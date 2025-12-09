import { verifyEmail } from '@/action/sendOtp'
import { Box, Button, Combobox, createListCollection, Field, Fieldset, Heading, HStack, Input, InputGroup, Portal, Select, Status, Text, useFilter, useListCollection, VStack } from '@chakra-ui/react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { IPostOfficeRow } from '../../post-office/_libs/columns'
import { create, get } from '@/apis/apiCore'
import { HiCheck } from 'react-icons/hi'
import LinkCustom from '@/components/ui/LinkCustom'
import { toaster } from '@/components/ui/toaster'



const formSchema = z.object({
    name: z.string().min(1, "Tên nhân viên không được bỏ trống"),
    email: z.string()
        .min(1, { message: "Chưa điền thông tin" })
        .pipe(z.email({ message: "Định dạng email không hợp lệ" })),
    checkEmail: z.boolean(),
    idNumber: z.string().min(1, "Số CCCD không được bỏ trống").length(12, "Số CCCD tối đa là 12 số"),
    numberPhone: z.string().min(1, "Số điện thoại không được bỏ trống").length(10, "Số điện thoại tối đa là 10 số"),
    address: z.string().min(1, "Địa chỉ không được bỏ trống"),
    typePost: z.string().array().nonempty("Hãy chọn 1 loại bưu cục"),
    vehicleType: z.string().array().nonempty("Hãy chọn 1 loại phương tiện"),
    officeId: z.string().min(1, "Hãy chọn 1 bưu cục"),
    shipperZone: z.string().min(1, "Hãy chọn 1 vùng hoạt động của bưu cục"),

})

type FormValues = z.infer<typeof formSchema>

const typePosts = createListCollection({
    items: [
        { label: "Trung tâm phân loại hàng", value: "sorting_center" },
        { label: "Kho trung chuyển", value: "distribution_hub" },
        { label: "Bưu cục giao hàng", value: "delivery_office" }
    ]
})

const vehicleTypes = createListCollection({
    items: [
        { label: "Xe máy", value: "bike" },
        { label: "Xe tải", value: "truck" },
    ]
})
interface Props {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}


const AddNewShipper = ({ setOpen }: Props) => {

    const {
        reset,
        register,
        trigger,
        setError,
        clearErrors,
        setValue,
        handleSubmit,
        formState: { isSubmitting, errors },
        control,
    } = useForm<FormValues>({
        resolver: standardSchemaResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            checkEmail: false,
            idNumber: '',
            numberPhone: '',
            address: '',
            officeId: '',
            typePost: [],
            vehicleType: [],
            shipperZone: ''
        }
    })


    const [checkEmail, setCheckEmail] = useState(false)
    const [valueTypePost, setValueTypePost] = useState<string[]>([])
    const [valueVehicleTypes, setVehicleTypes] = useState<string[]>([])

    const inputEmailRef = useRef<HTMLInputElement | null>(null)
    const [isPending, startTransition] = useTransition();
    const [infoPost, setInfoPost] = useState<Record<string, any> | undefined>()


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

    const { contains } = useFilter({ sensitivity: "base" })
    const { collection: collectionPost, filter: filterPost, set: setPost } = useListCollection<{ label: string, name: string, value: string; id: string, code: string, status: boolean, address: string, zoneId: string | undefined, zoneName: string | undefined }>({
        initialItems: [],
        filter: contains,
    })
    const { collection: collectionShipperZone, filter: filterShipperZone, set: setShipperZone } = useListCollection<{ label: string, value: string }>({
        initialItems: [],
        filter: contains,
    })

    useEffect(() => {
        if (!infoPost || valueVehicleTypes.length < 1 || valueVehicleTypes[0] !== "bike" || valueTypePost[0] !== "delivery_office") {
            setShipperZone([])
            return;
        }
        const getShipperZoneByPost = async () => {
            const res = await get<any[]>(`/mapbox/shipperZone/${infoPost.id}`)
            if (res.success) {
                const shipperZone = res.result
                const dataShipperZone = shipperZone.map((zone) => {

                    const zoneId = zone._id
                    const zoneName = `${zone.name} - ${zone.code}`
                    return { label: zoneName, value: zoneId }
                })
                setShipperZone(dataShipperZone)
            }
        }
        getShipperZoneByPost()
    }, [infoPost, valueVehicleTypes, valueTypePost])

    useEffect(() => {
        if (valueTypePost.length < 1) return;
        setValue("officeId", "")
        const getPostByType = async () => {
            const res = await get<IPostOfficeRow[]>(`/post-office/list/${valueTypePost[0]}`)
            if (res.success) {
                const posts = res.result
                const dataPost = posts.map((post) => {
                    const zoneField = post.type === 'sorting_center'
                        ? "regionId"
                        : post.type === "distribution_hub"
                            ? "provinceId"
                            : "wardId"
                    const name = post.name
                    const label = post.name
                    const value = post._id
                    const id = post._id
                    const code = post.code
                    const status = post.status
                    const address = post.address
                    const zoneId = post[zoneField]?._id
                    const zoneName = `${post[zoneField]?.name} - ${post[zoneField]?.code}`
                    return { name, label, value, id, code, status, address, zoneId, zoneName }
                })
                setPost(dataPost)
            }
        }
        getPostByType()

    }, [valueTypePost])

    const submitForm = handleSubmit(async (dataForm) => {
        if (!checkEmail) {
            setError("email", { message: "Cần kiểm tra email trước khi tạo tài khoản" })
            return;
        }
        const roleName = 'shipper'
        const payload = {
            name: dataForm.name,
            email: dataForm.email,
            officeId: dataForm.officeId,
            address: dataForm.address,
            idNumber: dataForm.idNumber,
            numberPhone: dataForm.numberPhone,
            role: roleName,
            checkEmail: dataForm.checkEmail,
            vehicleType: dataForm.vehicleType[0],
            shipperZone: dataForm.shipperZone
        }

        const res = await create<{ message: string }>("/employee/create/shipper", payload)
        if (!res.success) {
            toaster.error({
                id: `Create-Employee-E-${Date.now}`,
                title: "Tạo tài khoản không thành công",
                description: res.error
            })
        } else {
            toaster.success({
                id: `Create-Employee-S-${Date.now}`,
                title: res.result.message
            })
            reset()
            setOpen(false)
        }

    })

    return (
        <form onSubmit={submitForm}>
            <Box divideY={'1px'}>
                <Fieldset.Root>
                    <Fieldset.Content>
                        <HStack direction="row" align={'start'}>
                            <Field.Root invalid={!!errors.name}>
                                <Field.Label>
                                    Tên nhân viên
                                </Field.Label>
                                <Input {...register("name")} placeholder='Nhập tên nhân viên' />
                                <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                            </Field.Root>
                            <Field.Root invalid={!!errors.email}>
                                <Field.Label>
                                    Email đăng nhập
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
                        </HStack>
                        <HStack mt={5} align={'start'}>

                            <Field.Root invalid={!!errors.idNumber}>
                                <Field.Label>
                                    Số căn cước công dân
                                </Field.Label>
                                <Input {...register("idNumber")} maxLength={12} placeholder='Nhập số căn cước công dân' />
                                <Field.ErrorText>{errors.idNumber?.message}</Field.ErrorText>
                            </Field.Root>
                            <Field.Root invalid={!!errors.numberPhone}>
                                <Field.Label>
                                    Số điện thoại
                                </Field.Label>
                                <Input {...register("numberPhone")} maxLength={10} placeholder='Nhập số điện thoại' />
                                <Field.ErrorText>{errors.numberPhone?.message}</Field.ErrorText>
                            </Field.Root>

                        </HStack>
                        <Field.Root invalid={!!errors.address}>
                            <Field.Label>
                                Địa chỉ
                            </Field.Label>
                            <Input {...register("address")} placeholder='Nhập địa chỉ nhà nhân viên' />
                            <Field.ErrorText>{errors.address?.message}</Field.ErrorText>
                        </Field.Root>
                        <HStack mt={5} align={'start'}>

                            <Field.Root invalid={!!errors.typePost}>
                                <Field.Label>Loại bưu cục</Field.Label>
                                <Controller
                                    control={control}
                                    name="typePost"
                                    render={({ field }) => (
                                        <Select.Root
                                            name={field.name}
                                            value={field.value || []}
                                            onValueChange={({ value }) => {
                                                field.onChange(value)
                                                setValueTypePost(value)
                                            }}
                                            onInteractOutside={() => field.onBlur()}
                                            collection={typePosts}
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
                                                        {typePosts.items.map((type) => (
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
                                <Field.ErrorText>{errors.typePost?.message}</Field.ErrorText>
                            </Field.Root>
                            <Field.Root invalid={!!errors.officeId}>
                                <Field.Label>Bưu cục</Field.Label>
                                <Controller
                                    control={control}
                                    name="officeId"
                                    render={({ field }) => (
                                        <Combobox.Root
                                            collection={collectionPost}
                                            value={field.value ? [field.value] : []}
                                            onValueChange={(details) => {
                                                field.onChange(details.value[0] || "")
                                                setInfoPost(details.items[0])
                                                // setZoneId(value[0])
                                            }}
                                            onInputValueChange={(details) => {
                                                filterPost(details.inputValue)
                                            }}
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
                                                        <Combobox.Empty>Không tìm thấy khu vực</Combobox.Empty>
                                                        {collectionPost.items.map((item) => (
                                                            <Combobox.Item key={item.value} item={item}>
                                                                {item.name}
                                                                <Combobox.ItemIndicator />
                                                            </Combobox.Item>
                                                        ))}
                                                    </Combobox.Content>
                                                </Combobox.Positioner>
                                            </Portal>
                                        </Combobox.Root>
                                    )}
                                />
                                <Field.ErrorText>{errors.officeId?.message}</Field.ErrorText>
                            </Field.Root>
                        </HStack>
                        <HStack mt={5} align={'start'}>
                            <Field.Root invalid={!!errors.vehicleType}>
                                <Field.Label>Loại phương tiện</Field.Label>
                                <Controller
                                    control={control}
                                    name="vehicleType"
                                    render={({ field }) => (
                                        <Select.Root
                                            name={field.name}
                                            value={field.value || []}
                                            onValueChange={({ value }) => {
                                                field.onChange(value)
                                                setVehicleTypes(value)
                                            }}
                                            onInteractOutside={() => field.onBlur()}
                                            collection={vehicleTypes}
                                        >
                                            <Select.HiddenSelect />
                                            <Select.Control>
                                                <Select.Trigger>
                                                    <Select.ValueText placeholder="Chọn loại phương tiện" />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            <Portal key={'select'}>
                                                <Select.Positioner zIndex="9999 !important">
                                                    <Select.Content>
                                                        {vehicleTypes.items.map((type) => (
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
                                <Field.ErrorText>{errors.vehicleType?.message}</Field.ErrorText>
                            </Field.Root>
                            {(valueVehicleTypes[0] === "bike" && valueTypePost[0] === "delivery_office") && (
                                <Field.Root invalid={!!errors.shipperZone}>
                                    <Field.Label>Khu vực hoạt động shipper</Field.Label>
                                    <Controller
                                        control={control}
                                        name="shipperZone"
                                        render={({ field }) => (
                                            <Combobox.Root
                                                collection={collectionShipperZone}
                                                value={field.value ? [field.value] : []}
                                                onValueChange={({ value }) => {
                                                    field.onChange(value[0] || "")
                                                }}
                                                onInputValueChange={(details) => filterShipperZone(details.inputValue)}
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

                                                            <Combobox.Empty>Không tìm thấy khu vực</Combobox.Empty>
                                                            {collectionShipperZone.items.map((item) => (
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
                                    <Field.ErrorText>{errors.shipperZone?.message}</Field.ErrorText>
                                </Field.Root>
                            )}
                        </HStack>
                    </Fieldset.Content>
                </Fieldset.Root>
                {infoPost && (
                    <Box mt={8}>
                        <Heading mt={8} size={'md'} fontWeight={'medium'}>
                            Thông tin bưu cục
                        </Heading>
                        <HStack w={'full'} mt={5} align={'start'} justify={'space-between'}>
                            <VStack gap={2} w={'full'} align={'start'}>
                                <Text>
                                    <Box minW={'90px'} display={'inline-block'}>
                                        Tên bưu cục:
                                    </Box>
                                    <LinkCustom href={`/admin/post-office/${infoPost.id}`} color={'bg.inverted'} _hover={{ textDecoration: "underline" }}>
                                        {infoPost.name}
                                    </LinkCustom>
                                </Text>
                                <Text>
                                    <Box minW={'90px'} display={'inline-block'}>
                                        Mã bưu cục:
                                    </Box>
                                    {infoPost.code}
                                </Text>

                                <Status.Root colorPalette={infoPost.status ? "green" : "red"}>
                                    <Status.Indicator />
                                    {infoPost.status ? "Đang hoạt động" : "Không hoạt động"}
                                </Status.Root>
                            </VStack>
                            <VStack gap={2} align={'start'}>
                                <Text>
                                    <Box minW={'125px'} display={'inline-block'}>
                                        Khu vực hoạt động:
                                    </Box>
                                    {infoPost.zoneName}
                                </Text>
                                <Text>
                                    <Box minW={'125px'} display={'inline-block'}>
                                        Địa chỉ bưu cục:
                                    </Box>
                                    {infoPost.address}
                                </Text>
                            </VStack>
                        </HStack>
                    </Box>
                )}
            </Box>

            <Button type="submit" loading={isSubmitting} mt={10} w={'full'}>
                Thêm mới nhân viên
            </Button>
        </form>
    )
}

export default AddNewShipper