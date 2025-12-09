import { UserContextState } from '@/app/(internal)/_providers/UserProviderInternal'
import { Box, Button, Editable, Field, Fieldset, HStack, IconButton, Input, VStack } from '@chakra-ui/react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { LuCheck, LuPencilLine, LuX } from 'react-icons/lu'
import z from 'zod'


const formSchema = z.object({
    email: z.string()
        .min(1, { message: "Chưa điền thông tin" })
        .pipe(z.email({ message: "Định dạng email không hợp lệ" })),
    name: z.string().min(1, "Chưa điền tên nhân viên"),
    idNumber: z.string().min(1, "Số CCCD không được bỏ trống").length(12, "Số CCCD tối đa là 12 số"),
    numberPhone: z.string().min(1, "Số điện thoại không được bỏ trống").length(10, "Số điện thoại tối đa là 10 số"),
    address: z.string().min(1, "Địa chỉ không được bỏ trống"),

})

type FormValues = z.infer<typeof formSchema>

const FormProfileStaff = ({ user, mutateUser }: UserContextState) => {

    const {
        register,
        handleSubmit,
        control,
        setError,
        formState: { errors }
    } = useForm<FormValues>({
        resolver: standardSchemaResolver(formSchema),
        defaultValues: {
            email: user.account.email,
            name: user.account.name,
            idNumber: user.account.idNumber,
            numberPhone: user.account.numberPhone,
            address: user.account.address
        },
    })

    const [loadingSubmit, setLoadingSubmit] = useState(false)


    const submitForm = handleSubmit(async (dataForm) => {
        // if (user.account.email !== dataForm.email) {
        //     const verify = await verifyEmail(dataForm.email)
        //     if (!verify.status) {
        //         setError("email", {
        //             type: "validate",
        //             message: verify.message
        //         })
        //         return;
        //     }
        // }
        // setPendingData(dataForm)        // Lưu dữ liệu form
        // setLoadingSubmit(true)          // Button loading
        // setOpenVerify(true)             // Mở dialog xác thực
    })
    return (
        <Box mt={10}>
            <form onSubmit={submitForm}>
                <Box mb={5}>
                    <VStack align="start">
                        <Fieldset.Root>
                            <Fieldset.Content>
                                <HStack direction="row" align={'start'}>
                                    <Field.Root invalid={!!errors.name}>
                                        <Field.Label>
                                            Tên nhân viên
                                        </Field.Label>
                                        <Input {...register("name")} readOnly placeholder='Nhập tên nhân viên' />
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
                                                <Input type="text" readOnly value={field.value} placeholder='Nhập địa chỉ Email của bạn' onChange={(e) => field.onChange(e.target.value)} />

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
                                        <Input {...register("idNumber")} readOnly maxLength={12} placeholder='Nhập số căn cước công dân' />
                                        <Field.ErrorText>{errors.idNumber?.message}</Field.ErrorText>
                                    </Field.Root>
                                    <Field.Root invalid={!!errors.numberPhone}>
                                        <Field.Label>
                                            Số điện thoại
                                        </Field.Label>
                                        <Input {...register("numberPhone")} readOnly maxLength={10} placeholder='Nhập số điện thoại' />
                                        <Field.ErrorText>{errors.numberPhone?.message}</Field.ErrorText>
                                    </Field.Root>

                                </HStack>
                                <Field.Root invalid={!!errors.address}>
                                    <Field.Label>
                                        Địa chỉ
                                    </Field.Label>
                                    <Editable.Root defaultValue={user.account.address}>
                                        <Editable.Preview />
                                        <Editable.Input  {...register("address")} placeholder='Nhập địa chỉ nhà nhân viên' />
                                        <Editable.Control>
                                            <Editable.EditTrigger asChild>
                                                <IconButton variant="ghost" size="xs">
                                                    <LuPencilLine />
                                                </IconButton>
                                            </Editable.EditTrigger>
                                            <Editable.CancelTrigger asChild>
                                                <IconButton variant="outline" size="xs">
                                                    <LuX />
                                                </IconButton>
                                            </Editable.CancelTrigger>
                                            <Editable.SubmitTrigger asChild>
                                                <IconButton variant="outline" size="xs">
                                                    <LuCheck />
                                                </IconButton>
                                            </Editable.SubmitTrigger>
                                        </Editable.Control>
                                    </Editable.Root>
                                    {/* <Input {...register("address")} placeholder='Nhập địa chỉ nhà nhân viên' /> */}
                                    <Field.ErrorText>{errors.address?.message}</Field.ErrorText>
                                </Field.Root>
                            </Fieldset.Content>
                        </Fieldset.Root>

                        <Button
                            mt={4}
                            colorScheme="blue"
                            borderRadius="full"
                            loading={loadingSubmit}
                            type='submit'
                        >
                            Thay đổi
                        </Button>
                    </VStack>
                </Box>
            </form>
        </Box>
    )
}

export default FormProfileStaff