'use client'

import { create, get } from '@/apis/apiCore'
import { toaster } from '@/components/ui/toaster'
import { debounce } from '@/libs/debounce'
import { Box, Button, CloseButton, Combobox, createListCollection, Dialog, Field, Fieldset, HStack, Input, Portal, Select, Span, Spinner, Stack, useFilter, useListCollection, VStack } from '@chakra-ui/react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import axios from 'axios'
import dynamic from 'next/dynamic'
import React, { memo, useCallback, useRef, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { LuPlus } from 'react-icons/lu'
import useSWR from 'swr'
import z from 'zod'
const LocationPostMap = dynamic(() => import('./LocationPostMap'))


const formSchema = z.object({
    type: z.string().array().nonempty("Hãy chọn 1 loại bưu cục"),
    name: z.string().min(1, "Tên bưu cục không được bỏ trống"),
    code: z.string().min(1, "Mã bưu cục không được bỏ trống"),
    addressNumber: z.string().min(1, "Số nhà không được bỏ trống"),
    address: z.string().min(1, "Địa chỉ bưu cục không được bỏ trống"),
    zone: z.string().min(1, "Hãy chọn 1 vùng hoạt động của bưu cục"),
    lngLat: z.string().min(1, "Cần có 1 vị trí trong bản đồ")
})

type FormValues = z.infer<typeof formSchema>

const types = createListCollection({
    items: [
        { label: "Trung tâm phân loại hàng", value: "sorting_center" },
        { label: "Kho trung chuyển", value: "distribution_hub" },
        { label: "Bưu cục giao hàng", value: "delivery_office" }
    ]
})

interface valueZone {
    _id: string,
    code: string;
    name: string
}

interface Props {
    onSuccess: () => void
}

const AddNewFormPost = memo(({ onSuccess }: Props) => {


    const {
        reset,
        register,
        setValue,
        handleSubmit,
        formState: { isSubmitting, errors },
        control,
    } = useForm<FormValues>({
        resolver: standardSchemaResolver(formSchema),
        defaultValues: {
            name: '',
            code: '',
            address: '',
            zone: '',
            addressNumber: ''
        }
    })
    const [isPending, startTransition] = useTransition();
    const [lngLat, setLngLat] = useState<string | undefined>()
    const [zoneId, setZoneId] = useState<string | undefined>()
    const [valueType, setValueType] = useState<string[]>([])
    const addressNumberRef = useRef<HTMLInputElement | null>(null)
    const { contains } = useFilter({ sensitivity: "base" })
    const { collection: collectionZone, filter: filterZone, set: setZone } = useListCollection<{ label: string, value: string }>({
        initialItems: [],
        filter: contains,
    })
    const { collection: collectionAddress, filter: filterAddress, set: setAddress } = useListCollection<{ id: string; label: string, value: string, coordinates: string }>({
        initialItems: [],
        filter: contains,
    })
    const { isValidating, error: errorFetchType } = useSWR(valueType.length > 0 ? `/post-office/type-post/${valueType[0]}` : null,
        get<valueZone[]>,
        {
            revalidateOnFocus: false,
            onSuccess: (data) => {
                if (!data.success) return;
                const setDataCombbox = data.result.map((zone) => {
                    const label = `${zone.name} - ${zone.code}`
                    const value = zone._id
                    return { label, value }
                })
                setZone(setDataCombbox)
            }
        })

    const searchAddress = (query: string) => {
        if (query === '' || !addressNumberRef.current?.value) {
            setAddress([])
            return;
        };
        const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!
        startTransition(async () => {
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
                        valueAddress.push({ id, label, value, coordinates: lngLat })
                    }
                })
                setAddress(valueAddress)
            } catch (error) {
                console.log(error)
            }
        })
    }

    const debouncedSearch = useCallback(debounce(searchAddress, 500), []);


    const [open, setOpen] = useState(false)

    const submitForm = handleSubmit(async (dataForm) => {
        if (!lngLat) return;
        const coordinates: { longitude: number, latitude: number } = JSON.parse(lngLat)
        const location = [coordinates.longitude, coordinates.latitude]
        const type = dataForm.type[0] as "sorting_center" | "distribution_hub" | "delivery_office"
        const zone = type === 'sorting_center'
            ? "regionId"
            : type === "distribution_hub"
                ? "provinceId"
                : "wardId"
        const addressValue = `${dataForm.addressNumber} ${dataForm.address}`
        const payload = {
            name: dataForm.name,
            code: dataForm.code,
            location,
            type,
            [zone]: dataForm.zone,
            address: addressValue
        }
        const res = await create<{ message: string }>("/post-office/create", payload)
        if (!res.success) {
            toaster.error({
                id: `Error-create-post-${Date.now}`,
                title: "Thêm mới không thành công",
                description: res.error,
            })
        } else {
            toaster.success({
                id: `Success-create-post-${Date.now}`,
                title: res.result.message
            })
            onSuccess()
            setOpen(false)
            setLngLat(undefined)
            setZoneId(undefined)
            setValueType([])
            reset({
                type: [],
                name: '',
                code: '',
                address: '',
                zone: '',
                addressNumber: '',
                lngLat: ''
            })
        }

    })

    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)} size={'lg'} scrollBehavior="outside">
            <Dialog.Trigger asChild>
                <Button
                    bgColor={'orange.600'}
                    _hover={{
                        bgColor: "orange.500"
                    }}
                    color={'fg'}
                >
                    <LuPlus /> Thêm
                </Button>
            </Dialog.Trigger>
            <Portal key={'dialog'}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Thêm mới bưu cục</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <form onSubmit={submitForm}>
                                <Fieldset.Root>
                                    <Fieldset.Content>
                                        <HStack direction="row" align={'start'}>
                                            <Field.Root invalid={!!errors.name}>
                                                <Field.Label>
                                                    Tên bưu cục
                                                </Field.Label>
                                                <Input {...register("name")} placeholder='Nhập tên bưu cục' />
                                                <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                                            </Field.Root>
                                            <Field.Root invalid={!!errors.code}>
                                                <Field.Label>
                                                    Mã bưu cục
                                                </Field.Label>
                                                <Input {...register("code")} placeholder='Nhập mã bưu cục' />
                                                <Field.ErrorText>{errors.code?.message}</Field.ErrorText>
                                            </Field.Root>
                                        </HStack>
                                        <HStack mt={10} align={'start'}>

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
                                                                    setLngLat(details.items[0].coordinates)
                                                                    field.onChange(details.value[0] || "")
                                                                }}
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
                                                                            {isPending ? (<HStack p="2">
                                                                                <Spinner size="xs" borderWidth="1px" />
                                                                                <Span>Loading...</Span>
                                                                            </HStack>) : (<>
                                                                                {/* <Combobox.Empty>Không tìm thấy khu vực</Combobox.Empty> */}
                                                                                {collectionAddress.items.map((item) => (
                                                                                    <Combobox.Item key={item.id} item={item}>
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
                                                </Field.Root>
                                            </HStack>

                                            <Field.ErrorText>{[errors.address?.message, errors.addressNumber?.message, errors.lngLat?.message].join(", ")}</Field.ErrorText>
                                        </Field.Root>
                                    </Fieldset.Content>
                                </Fieldset.Root>
                                <Box mt={10}>
                                    <LocationPostMap valueType={valueType} zoneId={zoneId} lngLat={lngLat} setLngLat={setLngLat} setValue={setValue} />
                                </Box>
                                <Button type="submit" loading={isSubmitting} mt={10} w={'full'}>
                                    Thêm mới bưu cục
                                </Button>
                            </form>

                        </Dialog.Body>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>

    )
})

export default AddNewFormPost