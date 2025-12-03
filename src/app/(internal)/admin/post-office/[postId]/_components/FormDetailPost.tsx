'use client'

import { get, update } from '@/apis/apiCore'
import { Box, Button, Center, Combobox, createListCollection, Field, Fieldset, Flex, Heading, HStack, Input, Portal, Select, Span, Spinner, Switch, useFilter, useListCollection } from '@chakra-ui/react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import useSWR from 'swr'
import z from 'zod'
import { Geometry } from 'geojson'
import { debounce } from '@/libs/debounce'
import axios from 'axios'
import { HiCheck, HiX } from 'react-icons/hi'
import dynamic from 'next/dynamic'
import { toaster } from '@/components/ui/toaster'
import { ResponsePost } from './MainDetailPost'

const DetailPostMap = dynamic(() => import('./DetailPostMap'), { ssr: false });


const types = createListCollection({
    items: [
        { label: "Trung tâm phân loại hàng", value: "sorting_center" },
        { label: "Kho trung chuyển", value: "distribution_hub" },
        { label: "Bưu cục giao hàng", value: "delivery_office" }
    ]
})

const formSchema = z.object({
    type: z.string().array().nonempty("Hãy chọn 1 loại bưu cục"),
    name: z.string().min(1, "Tên bưu cục không được bỏ trống"),
    code: z.string().min(1, "Mã bưu cục không được bỏ trống"),
    addressNumber: z.string().min(1, "Số nhà không được bỏ trống"),
    address: z.string().min(1, "Địa chỉ bưu cục không được bỏ trống"),
    zone: z.string().min(1, "Hãy chọn 1 vùng hoạt động của bưu cục"),
    lngLat: z.string().min(1, "Cần có 1 vị trí trong bản đồ"),
    status: z.boolean()
})

type FormValues = z.infer<typeof formSchema>

interface valueZone {
    _id: string,
    code: string;
    name: string
}

interface IZone {
    _id: string;
    code: string;
    name: string;
    geometry: Geometry
}

interface Props {
    post: ResponsePost,
    zoneDataDefault: IZone,
    onSuccess: () => void,
    lngLatPost: string
}

const FormDetailPost = ({ post, zoneDataDefault, onSuccess, lngLatPost }: Props) => {
    const addressPost = post.address.split(/ (.*)/).slice(0, 2)
    const {
        getValues,
        register,
        setValue,
        handleSubmit,
        formState: { isSubmitting, errors, isDirty, dirtyFields },
        control,
    } = useForm<FormValues>({
        resolver: standardSchemaResolver(formSchema),
        defaultValues: {
            type: [post.type],
            name: post.name,
            code: post.code,
            address: addressPost[1],
            zone: zoneDataDefault._id,
            addressNumber: addressPost[0],
            status: post.status,
            lngLat: lngLatPost
        }
    })
    const [valueType, setValueType] = useState<string[]>([post.type])
    const [zoneId, setZoneId] = useState<string | undefined>()
    const [lngLat, setLngLat] = useState<string | undefined>(lngLatPost)
    const addressNumberRef = useRef<HTMLInputElement | null>(null)

    const { contains } = useFilter({ sensitivity: "base" })

    const { collection: collectionZone, filter: filterZone, set: setZone } = useListCollection<{ label: string, value: string }>({
        initialItems: [],
        filter: contains,
    })
    const { collection: collectionAddress, filter: filterAddress, set: setAddress } = useListCollection<{ id: string, label: string, value: string, coordinates: string }>({
        initialItems: [{ id: post._id, label: addressPost[1], value: addressPost[1], coordinates: lngLatPost }],
        filter: contains,
    })

    const { data, isValidating, error: errorFetchType } = useSWR(`/post-office/type-post/${valueType[0]}`,
        get<valueZone[]>,
        {
            revalidateOnFocus: false,
        })


    const searchAddress = async (query: string) => {
        console.log(query)
        console.log(addressNumberRef.current?.value)
        if (query === '' || !addressNumberRef.current?.value) {
            setAddress([])
            return;
        };
        const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!
        try {
            const q = `${addressNumberRef.current?.value} ${query}`
            const responseAddress = await axios.get(`https://api.mapbox.com/search/geocode/v6/forward?q=${q}&country=vn&type=address&access_token=${MAPBOX_ACCESS_TOKEN}`)
            const features = responseAddress.data.features
            const valueAddress: { id: string; label: string, value: string, coordinates: string }[] = []
            features.map((feature: any) => {
                // const label = `${feature.properties.name}, ${feature.properties.context.locality.name}, `
                if (feature.properties.feature_type == "street") {
                    const id = feature.properties.mapbox_id
                    const label = feature.properties.full_address
                    const value = feature.properties.full_address
                    const lngLat = JSON.stringify(feature.properties.coordinates)
                    // console.log(lngLat)
                    valueAddress.push({ id, label, value, coordinates: lngLat })
                }
            })
            console.log(valueAddress)
            setAddress(valueAddress)
        } catch (error) {
            console.log(error)
        }
    }

    const debouncedSearch = useCallback(debounce(searchAddress, 500), []);
    useEffect(() => {
        if (!data) return;
        if (!data.success) return;
        const setDataCombbox = data.result.map((zone) => {
            const label = `${zone.name} - ${zone.code}`
            const value = zone._id
            return { label, value }
        })
        setZone(setDataCombbox)
    }, [data])


    const submitForm = handleSubmit(async (dataForm) => {
        if (!isDirty) return;
        console.log(dataForm)
        const values: any = getValues();
        const changed: any = {};

        for (const key in dirtyFields) {
            changed[key] = values[key];
        }
        const type = dataForm.type[0] as "sorting_center" | "distribution_hub" | "delivery_office"
        const addressPost = (changed?.address || changed?.addressNumber) ? `${dataForm.addressNumber} ${dataForm.address}` : undefined
        const zone = type === 'sorting_center'
            ? "regionId"
            : type === "distribution_hub"
                ? "provinceId"
                : "wardId"

        const payload = {
            ...changed,
        }
        if (addressPost) {
            payload.address = addressPost
        }
        if (changed?.zone) {
            payload[zone] = changed.zone
        }
        if (changed?.lngLat) {
            const coordinates: { longitude: number, latitude: number } = JSON.parse(changed.lngLat)
            payload.location = [coordinates.longitude, coordinates.latitude]
        }
        console.log(payload)
        const res = await update<{message: string}>(`/post-office/update/${post._id}`, payload)
        if(!res.success){
            toaster.error({
                id: `Error-Update-P-${Date.now}`,
                title: "Cập nhật thất bại",
                description: res.error
            })
        }else{
            toaster.success({
                id: `Success-Update-P-${Date.now}`,
                title: res.result.message
            })
            onSuccess()
        }
    })
    return (
        <Flex w={'full'} mt={10}>
            <Box w={'7/12'}>
                <Fieldset.Root>
                    <form onSubmit={submitForm}>
                        <Fieldset.Content>
                            <HStack direction="row" align={'start'}>
                                <Field.Root invalid={false}>
                                    <Field.Label>
                                        Tên bưu cục
                                    </Field.Label>
                                    <Input {...register("name")} placeholder='Nhập tên bưu cục' />
                                    <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                                </Field.Root>
                                <Field.Root invalid={false}>
                                    <Field.Label>
                                        Mã bưu cục
                                    </Field.Label>
                                    <Input {...register("code")} placeholder='Nhập mã bưu cục' />
                                    <Field.ErrorText>{errors.code?.message}</Field.ErrorText>
                                </Field.Root>
                            </HStack>
                            <HStack direction="row" align={'start'}>
                                <Field.Root invalid={!!errors.type}>
                                    <Field.Label>Loại bưu cục</Field.Label>
                                    <Controller
                                        control={control}
                                        name="type"
                                        render={({ field }) => (
                                            <Select.Root
                                                name={field.name}
                                                value={field.value || []}
                                                onValueChange={({ value }) => {
                                                    console.log(value)
                                                    field.onChange(value)
                                                    setValueType(value)
                                                }}
                                                onInteractOutside={() => field.onBlur()}
                                                collection={types}
                                            >
                                                <Select.HiddenSelect />
                                                <Select.Control>
                                                    <Select.Trigger>
                                                        <Select.ValueText placeholder="Chọn loại bưu cục" />
                                                    </Select.Trigger>
                                                    <Select.IndicatorGroup>
                                                        <Select.Indicator />
                                                    </Select.IndicatorGroup>
                                                </Select.Control>
                                                <Portal key={'select'}>
                                                    <Select.Positioner zIndex="9999 !important">
                                                        <Select.Content>
                                                            {types.items.map((type) => (
                                                                <Select.Item item={type} key={type.value}>
                                                                    {type.label}
                                                                    <Select.ItemIndicator />
                                                                </Select.Item>)
                                                            )}
                                                        </Select.Content>
                                                    </Select.Positioner>
                                                </Portal>
                                            </Select.Root>
                                        )}
                                    />
                                    <Field.ErrorText>{errors.type?.message}</Field.ErrorText>
                                </Field.Root>
                                <Field.Root invalid={!!errors.zone}>
                                    <Field.Label>Khu vực hoạt động</Field.Label>
                                    <Controller
                                        control={control}
                                        name="zone"
                                        render={({ field }) => (
                                            <Combobox.Root
                                                collection={collectionZone}
                                                value={field.value ? [field.value] : []}

                                                onValueChange={({ value }) => {
                                                    field.onChange(value[0] || "")
                                                    setZoneId(value[0])
                                                }}
                                                defaultInputValue={`${zoneDataDefault?.name} - ${zoneDataDefault?.code}`}
                                                onInputValueChange={(details) => filterZone(details.inputValue)}
                                                onInteractOutside={() => field.onBlur()}
                                                openOnClick
                                            >
                                                <Combobox.Control>
                                                    <Combobox.Input placeholder="Chọn khu vực hoạt động bưu cục" />
                                                    <Combobox.IndicatorGroup>
                                                        <Combobox.ClearTrigger />
                                                        <Combobox.Trigger />
                                                    </Combobox.IndicatorGroup>
                                                </Combobox.Control>

                                                <Portal key={'comboBox'}>
                                                    <Combobox.Positioner zIndex="9999 !important">
                                                        <Combobox.Content>
                                                            {isValidating ? (<HStack p="2">
                                                                <Spinner size="xs" borderWidth="1px" />
                                                                <Span>Loading...</Span>
                                                            </HStack>) : !!errorFetchType ? (
                                                                <Span p="2" color="fg.error">
                                                                    Error fetching
                                                                </Span>
                                                            ) : (<>
                                                                <Combobox.Empty>Không tìm thấy khu vực</Combobox.Empty>
                                                                {collectionZone.items.map((item) => (
                                                                    <Combobox.Item key={item.value} item={item}>
                                                                        {item.label}
                                                                        <Combobox.ItemIndicator />
                                                                    </Combobox.Item>
                                                                ))}
                                                            </>)}
                                                        </Combobox.Content>
                                                    </Combobox.Positioner>
                                                </Portal>
                                            </Combobox.Root>
                                        )}
                                    />
                                    <Field.ErrorText>{errors.zone?.message}</Field.ErrorText>
                                </Field.Root>
                            </HStack>
                            <Field.Root mt={5} invalid={!!errors.address || !!errors.addressNumber}>
                                <Field.Label>
                                    Địa chỉ bưu cục
                                </Field.Label>
                                <HStack w="full" align="start">
                                    {/* ---- Input Số nhà ---- */}
                                    <Field.Root flex="0 0 120px">
                                        <Controller
                                            control={control}
                                            name='addressNumber'
                                            render={({ field }) => (
                                                <Input type="text"
                                                    value={field.value || ''}
                                                    ref={addressNumberRef}
                                                    placeholder='Số nhà'
                                                    onChange={(e) => {
                                                        field.onChange(e.target.value)
                                                    }} />
                                            )}
                                        />
                                    </Field.Root>
                                    <Field.Root flex="1" >
                                        <Controller
                                            control={control}
                                            name='address'
                                            render={({ field }) => (
                                                <Combobox.Root
                                                    collection={collectionAddress}
                                                    value={field.value ? [field.value] : []}
                                                    onValueChange={(details) => {
                                                        setLngLat(details.items[0]?.coordinates)
                                                        field.onChange(details.value[0] || "")
                                                    }}
                                                    defaultInputValue={addressPost[1]}
                                                    onInputValueChange={(details) => {
                                                        debouncedSearch(details.inputValue)
                                                        filterAddress(details.inputValue)
                                                    }}
                                                    onInteractOutside={() => field.onBlur()}
                                                    openOnClick
                                                >
                                                    <Combobox.Control>
                                                        <Combobox.Input placeholder="Nhập địa chỉ bưu cục" />
                                                        <Combobox.IndicatorGroup>
                                                            <Combobox.ClearTrigger />
                                                            <Combobox.Trigger />
                                                        </Combobox.IndicatorGroup>
                                                    </Combobox.Control>

                                                    <Portal key={'comboBox'}>
                                                        <Combobox.Positioner zIndex="9999 !important">
                                                            <Combobox.Content>

                                                                {collectionAddress.items.map((item) => (
                                                                    <Combobox.Item key={item.id} item={item}>
                                                                        {item.label}
                                                                        <Combobox.ItemIndicator />
                                                                    </Combobox.Item>
                                                                ))}

                                                            </Combobox.Content>
                                                        </Combobox.Positioner>
                                                    </Portal>
                                                </Combobox.Root>
                                            )}
                                        />
                                    </Field.Root>
                                </HStack>

                                <Field.ErrorText>{[errors.address?.message, errors.addressNumber?.message, errors.lngLat?.message].join(", ")}</Field.ErrorText>
                            </Field.Root>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Field.Root mt={5} invalid={!!errors.status}>
                                        <Switch.Root
                                            name={field.name}
                                            checked={field.value}
                                            onCheckedChange={({ checked }) => field.onChange(checked)}
                                            colorPalette={'green'}
                                        >
                                            <Switch.HiddenInput onBlur={field.onBlur} />
                                            <Switch.Control>
                                                <Switch.Thumb>
                                                    <Switch.ThumbIndicator fallback={<HiX color='black' />}>
                                                        <HiCheck />
                                                    </Switch.ThumbIndicator>
                                                </Switch.Thumb>
                                            </Switch.Control>
                                            <Switch.Label>Trạng thái hoạt động</Switch.Label>
                                        </Switch.Root>
                                        <Field.ErrorText>{errors.status?.message}</Field.ErrorText>
                                    </Field.Root>
                                )}
                            />
                            <Button type="submit" disabled={!isDirty} loading={isSubmitting} mt={10} alignSelf={'flex-end'}>
                                Thay đổi
                            </Button>
                        </Fieldset.Content>
                    </form>
                </Fieldset.Root>
            </Box>
            <Box w={'5/12'} px={10} alignSelf={'start'}>
                <Center>
                    <DetailPostMap zoneDataDefault={zoneDataDefault} zoneId={zoneId} valueType={valueType} lngLat={lngLat} setLngLat={setLngLat} setValue={setValue} />
                </Center>
            </Box>
        </Flex>
    )
}

export default FormDetailPost