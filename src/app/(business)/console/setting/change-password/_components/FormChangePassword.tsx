'use client'

import { sendOtpAction, verifyOtpAction } from '@/action/sendOtp'
import { create, update } from '@/apis/apiCore'
import LinkCustom from '@/components/ui/LinkCustom'
import { toaster } from '@/components/ui/toaster'
import { Box, Button, CloseButton, createOverlay, Dialog, Field, Fieldset, Flex, Group, Heading, Input, InputGroup, Portal, Stack, VStack } from '@chakra-ui/react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { LuEye, LuEyeClosed } from 'react-icons/lu'
import z from 'zod'


const formSchema = z.object({
    currentPassword: z.string().min(6, "Tối thiểu 6 ký tự"),
    newPassword: z.string().min(6, "Tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(6, "Tối thiểu 6 ký tự"),

})

type FormValues = z.infer<typeof formSchema>

const FormChangePassword = () => {
    const [seePassCurrent, setSeePassCurrent] = useState(false)
    const [seePassNew, setSeePassNew] = useState(false)
    const [seePassVerify, setSeePassVerify] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting, errors }
    } = useForm<FormValues>({
        resolver: standardSchemaResolver(formSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        },
    })

    const handleOpenDialogForgotPassword = () => {
        dialog.open("open_forgot_password", {
            placement: 'center',
        })
    }

    const submitForm = handleSubmit(async (dataForm) => {
        if (dataForm.newPassword !== dataForm.confirmPassword) {
            toaster.create({
                id: `Error-Pass-${Date.now}`,
                type: "error",
                title: "Thay đổi mật khẩu không thành công",
                description: "Mật khẩu xác thực không trùng khớp với mật khẩu mới"
            })
            return;
        }

        const res = await update<{ message: string }>("/business/change-password", { newPassword: dataForm.newPassword, currentPassword: dataForm.currentPassword })
        console.log(res)
        if (!res.success) {
            toaster.create({
                id: `Change-Pass-E-${Date.now}`,
                type: 'error',
                title: 'Không thể cập nhật mật khẩu mới',
                description: res.error
            })
        } else {
            toaster.create({
                id: `Change-Pass-S-${Date.now}`,
                type: 'success',
                title: res.result.message,
            })
            reset()
        }
    })
    return (
        <Box>
            <form onSubmit={submitForm}>
                <VStack align="start">

                    <Fieldset.Root>
                        <Fieldset.Content>
                            <Field.Root invalid={!!errors.currentPassword} required>
                                <Field.Label>
                                    Mật khẩu hiện tại
                                    <Field.RequiredIndicator />
                                </Field.Label>
                                <InputGroup endElement={<Button p={0} variant={'plain'} size={'sm'} onClick={() => setSeePassCurrent(!seePassCurrent)}>{seePassCurrent ? <LuEye /> : <LuEyeClosed />}</Button>}>
                                    <Input {...register('currentPassword')} type={seePassCurrent ? "text" : "password"} borderColor={'gray.300'} placeholder='Nhập mật khẩu mới' />
                                </InputGroup>
                                <Field.ErrorText>{errors.currentPassword?.message}</Field.ErrorText>
                            </Field.Root>
                            <Field.Root invalid={!!errors.newPassword} required>
                                <Field.Label>
                                    Mật khẩu mới
                                    <Field.RequiredIndicator />
                                </Field.Label>
                                <InputGroup endElement={<Button p={0} variant={'plain'} size={'sm'} onClick={() => setSeePassNew(!seePassNew)}>{seePassNew ? <LuEye /> : <LuEyeClosed />}</Button>}>
                                    <Input {...register('newPassword')} type={seePassNew ? "text" : "password"} borderColor={'gray.300'} placeholder='Nhập mật khẩu mới' />
                                </InputGroup>
                                <Field.ErrorText>{errors.newPassword?.message}</Field.ErrorText>
                            </Field.Root>
                            <Field.Root invalid={!!errors.confirmPassword} required>
                                <Field.Label>
                                    Nhập lại mật khẩu mới
                                    <Field.RequiredIndicator />
                                </Field.Label>
                                <InputGroup endElement={<Button p={0} variant={'plain'} size={'sm'} onClick={() => setSeePassVerify(!seePassVerify)}>{seePassVerify ? <LuEye /> : <LuEyeClosed />}</Button>}>
                                    <Input {...register('confirmPassword')} type={seePassVerify ? "text" : "password"} borderColor={'gray.300'} placeholder='Nhập mật khẩu mới' />
                                </InputGroup>
                                <Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
                            </Field.Root>
                        </Fieldset.Content>
                    </Fieldset.Root>
                    <Flex align={'center'} justify={'space-between'} w={'full'} mt={4}>
                        <Button
                            colorScheme="blue"
                            borderRadius="full"
                            loading={isSubmitting}
                            type='submit'
                        >
                            Thay đổi mật khẩu
                        </Button>
                        <Button
                            fontWeight="medium"
                            variant={'plain'}
                            textDecoration={'none'}
                            color={'orange.600'}
                            _hover={{
                                color: "orange.300"
                            }}
                            onClick={handleOpenDialogForgotPassword}
                        >
                            Quên mật khẩu?
                        </Button>
                    </Flex>
                </VStack>
            </form>
            <dialog.Viewport />
        </Box>
    )
}

interface DialogProps {
    placement?: "center" | "top" | "bottom" | undefined,
    description?: React.ReactNode;
}

const step1Schema = z.object({
    email: z.string()
        .min(1, { message: "Chưa điền thông tin" })
        .pipe(z.email({ message: "Định dạng email không hợp lệ" })),
    verifyEmail: z.string().min(1, "Chưa điền mã xác minh")
})

type Step1Values = z.infer<typeof step1Schema>;


const step2Schema = z.object({
    newPassword: z.string().min(6, "Tối thiểu 6 ký tự"),
    verifyNewPassword: z.string().min(6, "Tối thiểu 6 ký tự"),
}).refine((data) => data.newPassword === data.verifyNewPassword, {
    message: "Mật khẩu không trùng khớp",
    path: ["verifyNewPassword"]
});

type Step2Values = z.infer<typeof step2Schema>;

const dialog = createOverlay<DialogProps>((props) => {
    const { description, ...rest } = props

    const inputEmailRef = useRef<HTMLInputElement | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isPending, startTransition] = useTransition();
    const [seconds, setSeconds] = useState<number>(0);
    const [renderVerify, setRenderVerify] = useState(false)
    const [seePassNew, setSeePassNew] = useState(false)
    const [seePassVerify, setSeePassVerify] = useState(false)
    const [stepForm, setStepForm] = useState<string>('verify_email')


    const form1 = useForm<Step1Values>({
        resolver: standardSchemaResolver(step1Schema),
        defaultValues: {
            email: '',
            verifyEmail: ''
        },
    })

    const form2 = useForm<Step2Values>({
        resolver: standardSchemaResolver(step2Schema),
        defaultValues: {
            newPassword: "",
            verifyNewPassword: ""
        }
    });

    useEffect(() => {
        // Chỉ chạy countdown khi seconds > 0
        if (seconds <= 0) return;

        timerRef.current = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Cleanup để không tạo nhiều interval khi state đổi
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [seconds]);

    const handleSendOTP = useCallback(() => {
        startTransition(async () => {
            const email = inputEmailRef.current?.value
            if (!email) {
                form1.trigger('email')
                return;
            }
            const verifyEmail = await create("/business/verify-email", { email })
            if (!verifyEmail.success) {
                toaster.create({
                    id: `verify-email-${Date.now()}`,
                    type: 'error',
                    title: verifyEmail.error
                })
            } else {
                if (seconds > 0) return;
                const res = await sendOtpAction(inputEmailRef.current?.value as string)
                if (!res.success) {
                    toaster.create({
                        id: `send-otp-${Date.now()}`,
                        type: 'error',
                        title: res.message
                    })
                } else {
                    toaster.create({
                        id: `send-otp-${Date.now()}`,
                        type: 'success',
                        title: res.message
                    })
                }
                setSeconds(60);
                setRenderVerify(true);
            }
        })
    }, [])

    const submitForm1 = form1.handleSubmit(async (dataForm1) => {
        if (dataForm1.email === '' || dataForm1.verifyEmail === '') return;

        const verifyOTP = await verifyOtpAction(dataForm1.email, dataForm1.verifyEmail)
        if (!verifyOTP.success) {
            toaster.create({
                id: `verify-email-${Date.now()}`,
                type: 'error',
                title: "Xác thực email thất bại",
                description: verifyOTP.message
            })
        } else {
            // send api BE
            setStepForm('change_password')
        }

    })

    const submitForm2 = form2.handleSubmit(async (dataForm2) => {
        if(stepForm !== "change_password") return;
        if (dataForm2.newPassword !== dataForm2.verifyNewPassword) {
            toaster.create({
                id: `Change-Pass-E-${Date.now}`,
                type: 'error',
                title: 'Mật khâu không trùng khớp'
            })
            return;
        }

        const res = await update<{ message: string }>("/business/update-password", { password: dataForm2.newPassword })
        if (!res.success) {
            toaster.create({
                id: `Change-Pass-E-${Date.now}`,
                type: 'error',
                title: 'Không thể cập nhật mật khẩu mới',
                description: res.error
            })
        } else {
            toaster.create({
                id: `Change-Pass-S-${Date.now}`,
                type: 'success',
                title: res.result.message,
            })
            dialog.close("open_forgot_password")
        }
    })
    return (
        <Dialog.Root {...rest} lazyMount closeOnInteractOutside={false} size={'md'}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>
                                Quên mật khẩu
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            {stepForm === "verify_email" && (
                                <form onSubmit={submitForm1}>
                                    <Fieldset.Root>
                                        <Fieldset.Content>
                                            <Field.Root invalid={!!form1.formState.errors.email}>
                                                <Field.Label>Địa chỉ Email</Field.Label>
                                                <Controller
                                                    control={form1.control}
                                                    name='email'
                                                    render={({ field }) => (
                                                        <Group attached w={'full'}>
                                                            <Input type="text" ref={inputEmailRef} readOnly={renderVerify} value={field.value} flex={1} borderColor={'gray.300'} placeholder='Nhập địa chỉ Email của bạn' onChange={(e) => field.onChange(e.target.value)} />
                                                            <Button w={'70px'} type='button' loading={isPending} disabled={seconds > 0} bgColor="gray.600" color={'white'} _hover={{ bgColor: "gray.500" }} onClick={handleSendOTP}>
                                                                {seconds > 0 ? `${seconds}s` : "Gửi mã"}
                                                            </Button>
                                                        </Group>
                                                    )}
                                                />
                                                <Field.ErrorText>{form1.formState.errors.email?.message}</Field.ErrorText>
                                            </Field.Root>
                                            {renderVerify && (
                                                <Field.Root invalid={!!form1.formState.errors.verifyEmail}>
                                                    <Field.Label>Mã xác thực</Field.Label>
                                                    <Input {...form1.register('verifyEmail')} type='text' borderColor={'gray.300'} placeholder='Nhập mã xác minh' />
                                                    <Field.ErrorText>{form1.formState.errors.verifyEmail?.message}</Field.ErrorText>
                                                </Field.Root>
                                            )}
                                        </Fieldset.Content>
                                    </Fieldset.Root>

                                    <Stack w={'full'} mt={7}>
                                        <Button type='submit' loading={form1.formState.isSubmitting} alignSelf={'end'}>
                                            Xác nhận
                                        </Button>
                                    </Stack>
                                </form>
                            )}
                            {stepForm === "change_password" && (
                                <form onSubmit={submitForm2}>
                                    <Fieldset.Root mt={5}>
                                        <Fieldset.Content>
                                            <Field.Root invalid={!!form2.formState.errors.newPassword}>
                                                <Field.Label>Mật khẩu mới</Field.Label>
                                                <InputGroup endElement={<Button p={0} variant={'plain'} color={'black'} size={'sm'} onClick={() => setSeePassNew(!seePassNew)}>{seePassNew ? <LuEye /> : <LuEyeClosed />}</Button>}>
                                                    <Input {...form2.register('newPassword')} type={seePassNew ? "text" : "password"} borderColor={'gray.300'} placeholder='Nhập mật khẩu mới' />
                                                </InputGroup>
                                                <Field.ErrorText>{form2.formState.errors.newPassword?.message}</Field.ErrorText>
                                            </Field.Root>
                                            <Field.Root invalid={!!form2.formState.errors.verifyNewPassword}>
                                                <Field.Label>Nhập lại mật khẩu mới</Field.Label>
                                                <InputGroup endElement={<Button p={0} variant={'plain'} color={'black'} size={'sm'} onClick={() => setSeePassVerify(!seePassVerify)}>{seePassVerify ? <LuEye /> : <LuEyeClosed />}</Button>}>
                                                    <Input {...form2.register('verifyNewPassword')} type={seePassVerify ? "text" : "password"} borderColor={'gray.300'} placeholder='Nhập lại mật khẩu mới' />
                                                </InputGroup>
                                                <Field.ErrorText>{form2.formState.errors.verifyNewPassword?.message}</Field.ErrorText>
                                            </Field.Root>
                                        </Fieldset.Content>
                                        <Button type="submit" loading={form2.formState.isSubmitting} mt={10} alignSelf="flex-center">
                                            Thay đổi mật khẩu
                                        </Button>
                                    </Fieldset.Root>
                                </form>
                            )}
                        </Dialog.Body>

                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal >
        </Dialog.Root >
    )
})

export default FormChangePassword