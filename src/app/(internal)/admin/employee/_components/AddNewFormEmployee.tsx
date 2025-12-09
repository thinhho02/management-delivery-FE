'use client'

import { verifyEmail } from '@/action/sendOtp'
import { create, get } from '@/apis/apiCore'
import { toaster } from '@/components/ui/toaster'
import { Box, Button, Combobox, createListCollection, Field, Fieldset, Heading, HStack, Input, InputGroup, Portal, Select, Span, Spinner, Stack, Status, Text, useFilter, useListCollection, VStack } from '@chakra-ui/react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { HiCheck } from 'react-icons/hi'

import z from 'zod'
import { IPostOfficeRow } from '../../post-office/_libs/columns'
import LinkCustom from '@/components/ui/LinkCustom'


const formSchema = z.object({
    name: z.string().min(1, "Tên nhân viên không được bỏ trống"),
    email: z.string()
        .min(1, { message: "Chưa điền thông tin" })
        .pipe(z.email({ message: "Định dạng email không hợp lệ" })),
    checkEmail: z.boolean(),
    idNumber: z.string().min(1, "Số CCCD không được bỏ trống").length(12, "Số CCCD tối đa là 12 số"),
    numberPhone: z.string().min(1, "Số điện thoại không được bỏ trống").length(10, "Số điện thoại tối đa là 10 số"),
    address: z.string().min(1, "Địa chỉ không được bỏ trống"),
    type: z.string().array().nonempty("Hãy chọn 1 loại bưu cục"),
    officeId: z.string().min(1, "Hãy chọn 1 bưu cục")
})

type FormValues = z.infer<typeof formSchema>

const types = createListCollection({
    items: [
        { label: "Trung tâm phân loại hàng", value: "sorting_center" },
        { label: "Kho trung chuyển", value: "distribution_hub" },
        { label: "Bưu cục giao hàng", value: "delivery_office" }
    ]
})

interface Props {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AddNewEmployee = ({ setOpen }: Props) => {


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
            idNumber: '',
            numberPhone: '',
            address: '',
            checkEmail: false,
            officeId: ''
        }
    })
    const [checkEmail, setCheckEmail] = useState(false)
    const [valueType, setValueType] = useState<string[]>([])
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

    useEffect(() => {
        if (valueType.length < 1) return;
        setValue("officeId", "")
        const getPostByType = async () => {
            const res = await get<IPostOfficeRow[]>(`/post-office/list/${valueType[0]}`)
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

    }, [valueType])

    const submitForm = handleSubmit(async (dataForm) => {
        if (!checkEmail) {
            setError("email", { message: "Cần kiểm tra email trước khi tạo tài khoản" })
            return;
        }
        const roleName = 'staffOffice'
        const payload = {
            name: dataForm.name,
            email: dataForm.email,
            officeId: dataForm.officeId,
            address: dataForm.address,
            idNumber: dataForm.idNumber,
            numberPhone: dataForm.numberPhone,
            role: roleName,
            checkEmail: dataForm.checkEmail
        }

        const res = await create<{ message: string }>("/employee/create/staff", payload)
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
            setCheckEmail(false)
            setValueType([])
            setInfoPost(undefined)
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

export default AddNewEmployee