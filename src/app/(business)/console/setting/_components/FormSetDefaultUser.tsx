'use client'


import { verifyEmail } from '@/action/sendOtp'
import { APIResponse, create, get } from '@/apis/apiCore'
import { toaster } from '@/components/ui/toaster'
import { Tooltip } from '@/components/ui/tooltip'
import { debounce } from '@/libs/debounce'
import { Badge, Box, Button, Center, CloseButton, Combobox, Dialog, Field, Fieldset, Flex, Heading, HStack, Input, InputGroup, Portal, Span, Spinner, useFilter, useListCollection } from '@chakra-ui/react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import axios from 'axios'
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { HiCheck } from 'react-icons/hi'
import { LuInfo, LuMapPinned } from 'react-icons/lu'
import z from 'zod'
import { IUserDefault } from '../../new-order/_hooks/useUserDefault'

const LocationUserMap = dynamic(() => import('./LocationMapUser'), { ssr: false })


const formSchema = z.object({
    name: z.string().min(1, "Tên nhân viên không được bỏ trống"),
    email: z.string()
        .trim()
        .refine((val) => val === "" || z.email().safeParse(val).success, {
            message: "Định dạng email không hợp lệ"
        }),
    checkEmail: z.boolean(),
    numberPhone: z.string().min(1, "Số điện thoại không được bỏ trống").length(10, "Số điện thoại tối đa là 10 số"),
    address: z.string().min(1, "Địa chỉ không được bỏ trống"),
    provinceId: z.string().min(1, "Tỉnh/Thành không được bỏ trống"),
    wardId: z.string().min(1, "Phường/Xã không được bỏ trống"),
    lngLat: z.string().min(1, "Cần có 1 vị trí trong bản đồ")
})

type FormValues = z.infer<typeof formSchema>

const FormSetDefaultUser = ({ data, onSuccess }: { data: APIResponse<IUserDefault>, onSuccess: () => void }) => {


    const [checkEmail, setCheckEmail] = useState(false)
    const [lngLat, setLngLat] = useState<string | undefined>()
    const [isPending, startTransition] = useTransition();
    const inputEmailRef = useRef<HTMLInputElement | null>(null)
    const [openDialog, setOpenDialog] = useState(false);
    const [provinceId, setProvinceId] = useState<{ provinceId: string; provinceName: string } | undefined>()
    const [wardId, setWardId] = useState<{ wardId: string; wardName: string } | undefined>()
    const [addressMarker, setAddressMarker] = useState<string | undefined>()

    useEffect(() => {
        if (!data.success || !data.result.default) return;
        if (data.result.location?.type === "Point") {
            const ll = JSON.stringify({
                longitude: data.result.location.coordinates[0],
                latitude: data.result.location.coordinates[1],
            });
            setLngLat(ll);
        }
        if (data.result.wardId) {
            setWardId({ wardId: data.result.wardId?._id, wardName: data.result.wardId?.name });
        }
        if (data.result.provinceId) {
            setProvinceId({ provinceId: data.result.provinceId._id, provinceName: data.result.provinceId.name });

        }

        setAddressMarker(data.result.address);

        setCheckEmail(!!data.result.email);
    }, [data.success])

    const {
        reset,
        register,
        trigger,
        setError,
        clearErrors,
        setValue,
        handleSubmit,
        formState: { isSubmitting, errors, isDirty, dirtyFields },
        control,
    } = useForm<FormValues>({
        resolver: standardSchemaResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            numberPhone: "",
            address: "",
            checkEmail: false,
            lngLat: "",
            provinceId: "",
            wardId: "",

        }
    })
    useEffect(() => {
        if (!data.success || !data.result.default) return;
        reset({
            name: data.result.name,
            email: data.result.email,
            numberPhone: data.result.numberPhone,
            checkEmail: data.result.email ? true : false,
            address: data.result.address,
            provinceId: data.result?.provinceId?._id || "",
            wardId: data.result?.wardId?._id || "",
            lngLat: data.result.location
                ? JSON.stringify({
                    longitude: data.result.location.type === "Point" ? data.result.location.coordinates[0] : 0,
                    latitude: data.result.location.type === "Point" ? data.result.location.coordinates[1] : 0
                }) : ""
        })
    }, [data.success])

    useEffect(() => {
        if (!data.success || !data.result.default) return;
        if (!dirtyFields.email) {
            setValue("checkEmail", true)
            setCheckEmail(true)
            return;
        }
        setValue("checkEmail", false)
        setCheckEmail(false)
    }, [dirtyFields.email, data.success])



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
        initialItems: data.success ? [{ id: data.result._id, label: data.result.address, value: data.result.address, coordinates: lngLat || "" }] : [],
        filter: contains,
    })

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
    }, [setProvince])

    useEffect(() => {
        if (!provinceId) return;
        console.log(provinceId)
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
                trigger('email')
                return;
            }
            const verify = await verifyEmail(email)
            if (!verify.status) {
                setError("email", { message: verify.message })
                setCheckEmail(false)
                setValue("checkEmail", false)
            } else {
                clearErrors("email")
                setCheckEmail(true)
                setValue("checkEmail", true)
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

    const submitForm = handleSubmit(async (dataForm) => {

        console.log(dataForm)
        if (!lngLat) return;
        const coordinates: { longitude: number, latitude: number } = JSON.parse(lngLat)
        const location = [coordinates.longitude, coordinates.latitude]

        const payload: any = {
            name: dataForm.name,
            numberPhone: dataForm.numberPhone,
            address: dataForm.address,
            provinceId: dataForm.provinceId,
            wardId: dataForm.wardId,
            location,
        }
        // Nếu user nhập email → gửi email + checkEmail
        if (dataForm.email.trim() !== "") {
            payload.email = dataForm.email;
            payload.checkEmail = dataForm.checkEmail;   // FE đã set true/false
        }

        const res = await create(`/user/create/default`, payload)
        if (!res.success) {
            toaster.error({
                id: `Error-U-D-${Date.now}`,
                title: "Cập nhật thất bại",
                description: res.error
            })
        } else {
            onSuccess()
        }
    })

    return (
        <Box>
            <form onSubmit={submitForm}>
                <Fieldset.Root>
                    <Fieldset.Content>
                        <Field.Root invalid={!!errors.name}>
                            <Field.Label>
                                Tên người bán
                            </Field.Label>
                            <Input {...register("name")} placeholder='Nhập tên nhân viên' />
                            <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                        </Field.Root>
                        <Field.Root invalid={!!errors.email}>
                            <Field.Label>
                                Email
                                <Field.RequiredIndicator
                                    fallback={
                                        <Flex alignItems={'center'} gap={1} >
                                            <Tooltip showArrow content="Email này để gửi thông báo trạng thái đơn hàng, nếu trường này không có thì sẽ sử dụng Email của doanh nghiệp">
                                                <LuInfo />
                                            </Tooltip>
                                        </Flex>
                                    }
                                />
                            </Field.Label>
                            <Controller
                                control={control}
                                name='email'
                                render={({ field }) => (
                                    <InputGroup endElement={
                                        !checkEmail ? (<>
                                            <Button type='button' size={'xs'} me={"-2"} py={0} variant="ghost" loading={isPending} onClick={handleCheckEmail}>
                                                Kiểm tra
                                            </Button>
                                        </>) : (<HiCheck />)
                                    }>
                                        <Input type="text" ref={inputEmailRef} value={field.value} placeholder='Nhập địa chỉ Email của bạn' onChange={(e) => field.onChange(e.target.value)} />
                                    </InputGroup>
                                )}
                            />
                            <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={!!errors.numberPhone}>
                            <Field.Label>
                                Số điện thoại
                            </Field.Label>
                            <Input {...register("numberPhone")} maxLength={10} placeholder='Nhập số điện thoại' />
                            <Field.ErrorText>{errors.numberPhone?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root mt={5} invalid={!!errors.address}>
                            <Field.Label>
                                Địa chỉ người bán
                            </Field.Label>
                            {/* ---- Input địa chỉ ---- */}
                            <HStack w={'full'} align={'start'}>
                                <Field.Root invalid={!!errors.provinceId}>
                                    <Controller
                                        control={control}
                                        name='provinceId'
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
                                    <Field.ErrorText>{errors.provinceId?.message}</Field.ErrorText>
                                </Field.Root>
                                <Field.Root invalid={!!errors.wardId}>
                                    <Controller
                                        control={control}
                                        name='wardId'
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
                                    <Field.ErrorText>{errors.wardId?.message}</Field.ErrorText>
                                </Field.Root>
                            </HStack>
                            <Field.Root mt={5} invalid={!!errors.address}>
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

                                            inputValue={addressMarker}
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

                            <Field.ErrorText>{[errors.address?.message, errors.lngLat?.message].join(", ")}</Field.ErrorText>
                        </Field.Root>
                        <Box textAlign={'end'}>
                            <Button variant={'outline'} size={'sm'} onClick={() => setOpenDialog(true)}>
                                <LuMapPinned />
                                Mở bản đồ
                            </Button>
                        </Box>
                    </Fieldset.Content>
                </Fieldset.Root>

                <Button type="submit" disabled={!isDirty} loading={isSubmitting} mt={10}>
                    Lưu thông tin
                </Button>
            </form>
            <Dialog.Root open={openDialog} size={'lg'} onOpenChange={(e) => setOpenDialog(e.open)}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content p={4}>
                            <Dialog.Header>
                                <Dialog.Title>Bản đồ</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <LocationUserMap lngLat={lngLat} setLngLat={setLngLat} setValue={setValue} wardId={wardId} setAddressMarker={setAddressMarker} />
                            </Dialog.Body>
                            <Dialog.Footer>

                                <Button
                                    bg="orange.600"
                                    _hover={{ bg: "orange.500" }}
                                    onClick={() => {
                                        if (!lngLat) {
                                            toaster.error({
                                                id: `error-lnglat-${Date.now}`,
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
}

export default FormSetDefaultUser