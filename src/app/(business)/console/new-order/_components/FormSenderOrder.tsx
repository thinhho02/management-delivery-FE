'use client'

import { Blockquote, Box, Button, Checkbox, CloseButton, Combobox, Dialog, Field, Fieldset, Heading, HStack, Input, InputGroup, Portal, useFilter, useListCollection } from '@chakra-ui/react'
import React, { memo, useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { SenderSchema } from './FormNewOrder'
import z from 'zod'
import { IUserDefault } from '../_hooks/useUserDefault'
import { Controller, useFormContext } from 'react-hook-form'
import { LuInfo, LuMapPinned } from 'react-icons/lu'
import { Tooltip } from '@/components/ui/tooltip'
import { HiCheck } from 'react-icons/hi'
import { verifyEmail } from '@/action/sendOtp'
import { get } from '@/apis/apiCore'
import { debounce } from '@/libs/debounce'
import axios from 'axios'
import { toaster } from '@/components/ui/toaster'
import MapSender from './map/MapSender'

type FormValues = z.infer<typeof SenderSchema>

interface Props {
    user: IUserDefault,
    isLoading: boolean
}

const FormSenderOrder = memo(({ user, isLoading }: Props) => {
    const [checkEmail, setCheckEmail] = useState(false)
    const [isPending, startTransition] = useTransition();
    const inputEmailRef = useRef<HTMLInputElement | null>(null)
    const [provinceId, setProvinceId] = useState<{ provinceId: string; provinceName: string } | undefined>()
    const [wardId, setWardId] = useState<{ wardId: string; wardName: string } | undefined>()
    const [lngLat, setLngLat] = useState<string | undefined>()
    const [addressMarker, setAddressMarker] = useState<string | undefined>()
    const [checkDefault, setCheckDefault] = useState(false)
    const [openDialog, setOpenDialog] = useState(false);




    const {
        register,
        setValue,
        setError,
        clearErrors,
        trigger,
        control,
        watch,
        formState: { errors, dirtyFields },
    } = useFormContext<FormValues>()


    const { contains } = useFilter({ sensitivity: "base" })

    const { collection: collectionProvince, filter: filterProvince, set: setProvince } = useListCollection<{ label: string, value: string }>({
        initialItems: [],
        filter: contains,
    })
    const { collection: collectionWard, filter: filterWard, set: setWard } = useListCollection<{ label: string, value: string }>({
        initialItems: [],
        filter: contains,
    })
    const { collection: collectionAddress, filter: filterAddress, set: setAddress } = useListCollection<{ id: string; label: string, value: string, coordinates: string }>({
        initialItems: user.address ? [{ id: user._id, label: user.address, value: user.address, coordinates: lngLat || "" }] : [],
        filter: contains,
    })
    const email = watch("senderEmail");
    const senderAddress = watch("senderAddress")
    const senderEmail = watch("senderEmail")
    const senderLngLat = watch("senderLngLat")
    const senderName = watch("senderName")
    const senderNumberPhone = watch("senderNumberPhone")
    const senderProvinceId = watch("senderProvinceId")
    const senderWardId = watch("senderWardId")

    useEffect(() => {
        if (isLoading || !user.default) return;
        if (user.location?.type === "Point") {
            const ll = JSON.stringify({
                longitude: user.location.coordinates[0],
                latitude: user.location.coordinates[1],
            });
            setLngLat(ll);
        }
        if (user.wardId) {
            setWardId({ wardId: user.wardId?._id, wardName: user.wardId?.name });
        }
        if (user.provinceId) {
            setProvinceId({ provinceId: user.provinceId._id, provinceName: user.provinceId.name });

        }
        setValue("senderSetDefault", false)
        setAddressMarker(user.address);
    }, [isLoading, user])

    useEffect(() => {
        if (isLoading || !user.default || !email) return;

        // Nếu email thay đổi so với default
        console.log("test", email === user.email)
        if (email === user.email) {
            setValue("senderCheckEmail", true);  // bắt user kiểm tra lại
            setCheckEmail(true);
        } else {
            setValue("senderCheckEmail", false);  // bắt user kiểm tra lại
            setCheckEmail(false);
        }

    }, [email, isLoading, user.default]);
    function hasSenderChanged(initial: any, current: any): boolean {
        const keys = [
            "senderAddress",
            "senderEmail",
            "senderLngLat",
            "senderName",
            "senderNumberPhone",
            "senderProvinceId",
            "senderWardId"
        ];

        return keys.some(key => initial[key] !== current[key]);
    }

    useEffect(() => {
        if (isLoading) return;

        if (!user.default) {
            return;
        }
        if (
            !senderAddress ||
            !senderEmail ||
            !senderLngLat ||
            !senderName ||
            !senderNumberPhone ||
            !senderProvinceId ||
            !senderWardId
        ) {
            return
        }
        const initialSender = {
            senderAddress: user.address,
            senderEmail: user.email,
            senderLngLat: user.location
                ? JSON.stringify({
                    longitude: user.location.type === "Point" ? user.location.coordinates[0] : 0,
                    latitude: user.location.type === "Point" ? user.location.coordinates[1] : 0,
                })
                : "",
            senderName: user.name,
            senderNumberPhone: user.numberPhone,
            senderProvinceId: user.provinceId?._id || "",
            senderWardId: user.wardId?._id || "",
        };

        const currentSender = {
            senderAddress,
            senderEmail,
            senderLngLat,
            senderName,
            senderNumberPhone,
            senderProvinceId,
            senderWardId,
        };

        const isChanged = hasSenderChanged(initialSender, currentSender);

        if (isChanged) {
            setCheckDefault(false);
            setValue("isUserDefault", false)
        } else {
            setCheckDefault(true);
            setValue("isUserDefault", true)
        }

    }, [
        senderAddress,
        senderEmail,
        senderLngLat,
        senderName,
        senderNumberPhone,
        senderProvinceId,
        senderWardId,
        user.default,
        isLoading]);

    useEffect(() => {

        const fetchListProvince = async () => {

            const res = await get<any[]>(`/mapbox/province/list/no-geo`)
            if (!res.success) {
                setProvince([])
            } else {
                const provinces = res.result
                const valueProvinces = provinces.map((province) => ({ label: province.name, value: province._id }))
                setProvince(valueProvinces)
            }
        }
        fetchListProvince()
    }, [])

    useEffect(() => {
        if (!provinceId) return;
        const fetchListWardByProvince = async () => {

            const res = await get<any[]>(`/mapbox/ward/list/${provinceId.provinceId}`)
            if (!res.success) {
                setWard([])
            } else {
                const wards = res.result
                const valueWard = wards.map((ward) => ({ label: ward.name, value: ward._id }))
                setWard(valueWard)
            }
        }
        fetchListWardByProvince()
    }, [setWard, provinceId])


    const handleCheckEmail = useCallback(() => {
        startTransition(async () => {
            const email = inputEmailRef.current?.value
            if (!email) {
                trigger('senderEmail')
                return;
            }
            const verify = await verifyEmail(email)
            if (!verify.status) {
                setError("senderEmail", { message: verify.message })
                setCheckEmail(false)
                setValue("senderCheckEmail", false)
            } else {
                clearErrors("senderEmail")
                setCheckEmail(true)
                setValue("senderCheckEmail", true)
            }
        })
    }, [])
    const searchAddress = async (query: string) => {
        if (query === '') {
            setAddress([])
            return;
        };
        const OPENMAP_TOKEN = process.env.NEXT_PUBLIC_OPENMAP_KEY!
        try {
            const path = `https://mapapis.openmap.vn/v1/geocode/forward?address=${query}&admin_v2=true&apikey=${OPENMAP_TOKEN}`
            const responseAddress = await axios.get(path)
            const features = responseAddress.data.results
            const valueAddress: { id: string; label: string, value: string, coordinates: string }[] = []
            features.map((feature: any) => {
                // const label = `${feature.properties.name}, ${feature.properties.context.locality.name}, `
                const id = feature.place_id
                const label = feature.formatted_address
                const value = feature.formatted_address
                const longitude = feature.geometry.location.lng
                const latitude = feature.geometry.location.lat
                const lngLat = JSON.stringify({ longitude, latitude })
                // console.log(lngLat)
                valueAddress.push({ id, label, value, coordinates: lngLat })
            })
            console.log(valueAddress)
            setAddress(valueAddress)
        } catch (error) {
            console.log(error)
        }
    }

    const debouncedSearch = useCallback(debounce(searchAddress, 500), []);
    return (
        <Box py={4} px={4} rounded={'lg'} bgColor={'bg.muted'} w={'full'}>
            <HStack w={'full'} align={'start'} justify={'space-between'}>
                <Heading size={'lg'} fontWeight={'bold'}>
                    Người gửi
                </Heading>
                {checkDefault ? (
                    <Heading fontWeight={'medium'} size={'md'} display={'flex'} alignItems={'center'} gap={2} alignSelf={'start'}>
                        <HiCheck color='green' /> Đang sử dụng thông tin mặc định
                    </Heading>
                ) : (
                    <Controller
                        control={control}
                        name="senderSetDefault"
                        render={({ field }) => (
                            <Checkbox.Root
                                checked={field.value}
                                onCheckedChange={({ checked }) => { field.onChange(checked) }}
                            >
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                                <Checkbox.Label>Đặt làm mặc định</Checkbox.Label>
                            </Checkbox.Root>
                        )}
                    />
                )}
            </HStack>
            <Fieldset.Root mt={5}>
                <Fieldset.Content>
                    <HStack w={'full'} align={'start'}>
                        <Field.Root invalid={!!errors.senderName}>
                            <Field.Label>
                                Tên người gửi
                            </Field.Label>
                            <Input {...register("senderName")} placeholder='Nhập tên người gửi' />
                            <Field.ErrorText>{errors.senderName?.message}</Field.ErrorText>
                        </Field.Root>


                        <Field.Root invalid={!!errors.senderNumberPhone}>
                            <Field.Label>
                                Số điện thoại
                            </Field.Label>
                            <Input {...register("senderNumberPhone")} maxLength={10} placeholder='Nhập số điện thoại' />
                            <Field.ErrorText>{errors.senderNumberPhone?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>
                    <Field.Root invalid={!!errors.senderEmail}>
                        <Field.Label>
                            Email
                            <Field.RequiredIndicator
                                fallback={

                                    <Tooltip showArrow content="Email này để gửi thông báo trạng thái đơn hàng">
                                        <LuInfo />
                                    </Tooltip>

                                }
                            />
                        </Field.Label>
                        <Controller
                            control={control}
                            name='senderEmail'
                            render={({ field }) => (
                                <InputGroup endElement={
                                    !checkEmail ? (<>
                                        <Button type='button' size={'xs'} me={"-2"} py={0} variant="ghost" loading={isPending} onClick={handleCheckEmail}>
                                            Kiểm tra
                                        </Button>
                                    </>) : (<HiCheck />)
                                }>
                                    <Input type="text" ref={inputEmailRef} value={field.value} placeholder='Nhập địa chỉ Email của người gửi' onChange={(e) => field.onChange(e.target.value)} />
                                </InputGroup>
                            )}
                        />
                        <Field.ErrorText>{errors.senderEmail?.message}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root mt={5}>
                        <Field.Label>
                            Địa chỉ người gửi
                        </Field.Label>
                        {/* ---- Input địa chỉ ---- */}
                        <HStack w={'full'} align={'start'}>
                            <Field.Root invalid={!!errors.senderProvinceId}>
                                <Controller
                                    control={control}
                                    name='senderProvinceId'
                                    render={({ field }) => (
                                        <Combobox.Root
                                            collection={collectionProvince}
                                            value={field.value ? [field.value] : []}

                                            onValueChange={(details) => {
                                                if (!details.value[0]) {
                                                    setWard([])
                                                    setAddress([])
                                                    setProvinceId(undefined)
                                                    setWardId(undefined)
                                                    setAddressMarker(undefined)
                                                    field.onChange("")
                                                    return;
                                                }
                                                setProvinceId({ provinceId: details.items[0].value, provinceName: details.items[0].label })
                                                field.onChange(details.value[0])
                                            }}

                                            inputValue={provinceId?.provinceName}
                                            onInputValueChange={(details) => {
                                                filterProvince(details.inputValue)
                                            }}
                                            onInteractOutside={() => field.onBlur()}
                                            openOnClick
                                        >
                                            <Combobox.Control>
                                                <Combobox.Input placeholder="Nhập tỉnh/thành phố" />
                                                <Combobox.IndicatorGroup>
                                                    <Combobox.ClearTrigger />
                                                    <Combobox.Trigger />
                                                </Combobox.IndicatorGroup>
                                            </Combobox.Control>
                                            <Portal key={'comboBox'}>
                                                <Combobox.Positioner zIndex="9999 !important">
                                                    <Combobox.Content>

                                                        <Combobox.Empty>Không tìm thấy tỉnh/thành</Combobox.Empty>
                                                        {collectionProvince.items.map((item) => (
                                                            <Combobox.Item key={item.value} item={item}>
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
                                <Field.ErrorText>{errors.senderProvinceId?.message}</Field.ErrorText>
                            </Field.Root>
                            <Field.Root invalid={!!errors.senderWardId}>
                                <Controller
                                    control={control}
                                    name='senderWardId'
                                    render={({ field }) => (
                                        <Combobox.Root
                                            collection={collectionWard}
                                            value={field.value ? [field.value] : []}
                                            onValueChange={(details) => {
                                                if (!details.value[0]) {
                                                    setAddress([])
                                                    setAddressMarker(undefined)
                                                    setWardId(undefined)
                                                    field.onChange("")
                                                    return;
                                                }
                                                setWardId({ wardId: details.items[0].value, wardName: details.items[0].label })
                                                field.onChange(details.value[0])
                                            }}
                                            inputValue={wardId?.wardName}
                                            onInputValueChange={(details) => {
                                                filterWard(details.inputValue)
                                            }}
                                            onInteractOutside={() => field.onBlur()}
                                            openOnClick
                                        >
                                            <Combobox.Control>
                                                <Combobox.Input placeholder="Nhập Phường/Xã" />
                                                <Combobox.IndicatorGroup>
                                                    <Combobox.ClearTrigger />
                                                    <Combobox.Trigger />
                                                </Combobox.IndicatorGroup>
                                            </Combobox.Control>
                                            <Portal key={'comboBox'}>
                                                <Combobox.Positioner zIndex="9999 !important">
                                                    <Combobox.Content>

                                                        <Combobox.Empty>Không tìm thấy phường/xã</Combobox.Empty>
                                                        {collectionWard.items.map((item) => (
                                                            <Combobox.Item key={item.value} item={item}>
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
                                <Field.ErrorText>{errors.senderWardId?.message}</Field.ErrorText>
                            </Field.Root>
                        </HStack>
                        <Field.Root mt={5} invalid={!!errors.senderAddress}>
                            <Controller
                                control={control}
                                name='senderAddress'
                                render={({ field }) => (
                                    <Combobox.Root
                                        collection={collectionAddress}
                                        value={field.value ? [field.value] : []}
                                        onValueChange={(details) => {
                                            setLngLat(details.items[0]?.coordinates)
                                            field.onChange(details.value[0] || "")
                                        }}
                                        inputValue={addressMarker}
                                        onInputValueChange={(details) => {
                                            debouncedSearch(details.inputValue)
                                            filterAddress(details.inputValue)
                                        }}
                                        onInteractOutside={() => field.onBlur()}
                                        openOnClick
                                    >
                                        <Combobox.Control>
                                            <Combobox.Input placeholder="Nhập địa chỉ người nhận" />
                                            <Combobox.IndicatorGroup>
                                                <Combobox.ClearTrigger />
                                                <Combobox.Trigger />
                                            </Combobox.IndicatorGroup>
                                        </Combobox.Control>

                                        <Portal key={'comboBox'}>
                                            <Combobox.Positioner zIndex="9999 !important">
                                                <Combobox.Content>

                                                    <Combobox.Empty>Không tìm thấy khu vực</Combobox.Empty>
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

                        <Field.ErrorText>{[errors.senderAddress?.message, errors.senderLngLat?.message].join(", ")}</Field.ErrorText>
                    </Field.Root>
                    <HStack w={'full'} justify={'space-between'}>
                        <Blockquote.Root colorPalette={'red'} variant={'solid'}>
                            <Blockquote.Content fontSize={'sm'}>
                                Địa chỉ có thể sai sót, nếu như không tìm thấy địa chỉ hãy
                                sử dụng bản đồ để cập nhật vị trí chính xác hoặc ghi chú số nhà ở phía dưới cho Shipper
                            </Blockquote.Content>
                        </Blockquote.Root>
                        <Button variant={'outline'} size={'sm'} onClick={() => setOpenDialog(true)}>
                            <LuMapPinned />
                            Mở bản đồ
                        </Button>
                    </HStack>
                </Fieldset.Content>
            </Fieldset.Root>
            <Dialog.Root open={openDialog} size={'lg'} onOpenChange={(e) => setOpenDialog(e.open)}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content p={4}>
                            <Dialog.Header>
                                <Dialog.Title>Bản đồ</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <MapSender lngLat={lngLat} setLngLat={setLngLat} setValue={setValue} wardId={wardId} setAddressMarker={setAddressMarker} />
                            </Dialog.Body>
                            <Dialog.Footer>

                                <Button
                                    bg="orange.600"
                                    _hover={{ bg: "orange.500" }}
                                    onClick={() => {
                                        if (!lngLat) {
                                            toaster.error({
                                                id: `error-lnglat-receiver-${Date.now}`,
                                                title: "Chưa cập nhật vị trí"
                                            })
                                        } else {
                                            setOpenDialog(false)
                                        }
                                    }}
                                >
                                    Xác nhận
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

        </Box>
    )
})

export default FormSenderOrder