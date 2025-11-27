'use client'

import { sendOtpAction, verifyEmail, verifyOtpAction } from '@/action/sendOtp'
import { create, update } from '@/apis/apiCore'
import LinkCustom from '@/components/ui/LinkCustom'
import { toaster } from '@/components/ui/toaster'
import { getLiteFingerprint } from '@/libs/getLiteFingerprint'
import { Box, Button, Checkbox, CloseButton, createOverlay, Dialog, Field, Fieldset, Group, Heading, HStack, Input, InputGroup, Portal, Stack, Text } from '@chakra-ui/react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { LuEye, LuEyeClosed } from 'react-icons/lu'
import z from 'zod'


const formSchema = z.object({
    email: z.string()
        .min(1, { message: "Chưa điền thông tin" })
        .pipe(z.email({ message: "Định dạng email không hợp lệ" })),
    password: z.string().min(6, "Tối thiểu 6 ký tự"),
    rememberMe: z.boolean()
})

type FormValues = z.infer<typeof formSchema>

interface ResponseLogin {
    accessToken: string;
    sessionId: string;
    roleName: string;
    message: string;
}

const FormLoginInternal = () => {
    const router = useRouter()
    const [seePass, setSeePass] = useState(false)

    const {
        register,
        handleSubmit,
        control,
        formState: { isSubmitting, errors }
    } = useForm<FormValues>({
        resolver: standardSchemaResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false
        },
    })
    const submitForm = handleSubmit(async (data) => {
        const finger = await getLiteFingerprint()

        const payload = {
            email: data.email,
            password: data.password,
            rememberMe: data.rememberMe,
            fingerprint: finger.components,
            fingerprintHash: finger.hash,
            // fcmToken: ""
        }
        const res = await create<ResponseLogin>("/auth/internal/login", payload)
        if (!res.success) {
            toaster.create({
                id: `login-b-failed-${Date.now()}`,
                type: 'error',
                title: res.error
            })
            return { success: false, message: res.error }
        } else {
            const roleName = res.result.roleName
            if (roleName === "admin") {
                router.replace("/admin")
            } else if (roleName === "shipper") {
                router.replace("/shipper")
            } else if (roleName === "staffOffice") {
                router.replace("/staff-office")
            }
        }
    })

    const openDialog = () => {

        dialog.open("123", {
            placement: 'center'
        })
    }
    return (
        <Box rounded={'xl'} bgColor={'white'} color={'black'} w={80}>
            <Box p={6}>
                <Heading size={'2xl'} textAlign='center' fontWeight={'medium'}>
                    Đăng nhập
                </Heading>

                <form onSubmit={submitForm}>
                    <Fieldset.Root mt={5}>
                        <Fieldset.Content>
                            <Field.Root invalid={!!errors.email}>
                                <Field.Label>Địa chỉ Email</Field.Label>
                                <Controller
                                    control={control}
                                    name='email'
                                    render={({ field }) => (
                                        <Input type="text" value={field.value} borderColor={'gray.300'} placeholder='Nhập địa chỉ Email của bạn' onChange={(e) => field.onChange(e.target.value)} />
                                    )}
                                />
                                <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                            </Field.Root>


                            <Field.Root invalid={!!errors.password}>
                                <HStack w={'full'} justifyContent={'space-between'} alignItems={'center'}>
                                    <Field.Label>Mật khẩu</Field.Label>
                                    <Button
                                        p={0}
                                        variant={'plain'}
                                        size={'sm'}
                                        color={'blue'}
                                        type='button'
                                        _hover={{ color: 'blue.500' }}
                                        onClick={openDialog}
                                    >
                                        Quên mật khẩu?
                                    </Button>
                                </HStack>
                                <InputGroup endElement={<Button p={0} variant={'plain'} color={'black'} size={'sm'} onClick={() => setSeePass(!seePass)}>{seePass ? <LuEye /> : <LuEyeClosed />}</Button>}>
                                    <Input {...register('password')} type={seePass ? "text" : "password"} borderColor={'gray.300'} placeholder='Nhập mật khẩu' />
                                </InputGroup>
                                <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                            </Field.Root>
                        </Fieldset.Content>
                        <Controller
                            control={control}
                            name='rememberMe'
                            render={({ field }) => (
                                <Field.Root>
                                    <Checkbox.Root checked={field.value} alignItems="flex-start" variant={'solid'} colorPalette={'teal'} onCheckedChange={({ checked }) => field.onChange(checked)}>
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control />
                                        <Checkbox.Label>Ghi nhớ đăng nhập</Checkbox.Label>
                                    </Checkbox.Root>

                                </Field.Root>
                            )}
                        />


                        <Button type="submit" loading={isSubmitting} mt={10} alignSelf="flex-center" bgColor={'black'} color={'white'}>
                            Đăng nhập
                        </Button>
                    </Fieldset.Root>
                </form>
            </Box>
            <dialog.Viewport />
        </Box>
    )
}

interface DialogProps {
    placement?: "center" | "top" | "bottom" | undefined,
    description?: React.ReactNode;
}

const emailSchema = z.object({
    email: z.string()
        .min(1, { message: "Chưa điền thông tin" })
        .pipe(z.email({ message: "Định dạng email không hợp lệ" })),
    verifyEmail: z.string().min(1, "Chưa điền mã xác minh"),
})



type EmailValues = z.infer<typeof emailSchema>;


const dialog = createOverlay<DialogProps>((props) => {
    const { description, ...rest } = props

    // const [messageSender, setMessageSender] = useState<string | undefined>(undefined)
    const [seconds, setSeconds] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputEmailRef = useRef<HTMLInputElement | null>(null)
    const [isPending, startTransition] = useTransition();
    const [fieldSend, setFieldSend] = useState(false)
    const [messageSender, setMessageSender] = useState<string | undefined>(undefined)



    const {
        trigger,
        register,
        handleSubmit,
        control,
        formState: { isSubmitting, errors }
    } = useForm<EmailValues>({
        resolver: standardSchemaResolver(emailSchema),
        defaultValues: {
            email: '',
            verifyEmail: '',

        },
    })



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
                trigger('email')
                return;
            }
            const verify = await verifyEmail(email)
            if (!verify.status) {
                toaster.create({
                    id: `verify-email-${Date.now()}`,
                    type: 'error',
                    title: verify.message
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
                    setSeconds(60);
                    setFieldSend(true)
                }
            }
        })
    }, [])

    const submitFormEmail = handleSubmit(async (dataForm) => {

        const verify = await verifyOtpAction(dataForm.email, dataForm.verifyEmail)
        if (!verify.success) {
            toaster.create({
                id: `Verify-E-${Date.now}`,
                type: 'error',
                title: 'Không thể gửi email',
                description: verify.message
            })
        } else {
            const res = await create<{ message: string }>("/employee/verify", { email: dataForm.email })
            if (!res.success) {
                toaster.create({
                    id: `Verify-E-${Date.now}`,
                    type: 'error',
                    title: 'Không thể gửi email',
                    description: res.error
                })
            } else {
                setMessageSender(res.result.message)
            }
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
                            {!messageSender
                                ? (
                                    <form onSubmit={submitFormEmail}>
                                        <Fieldset.Root>
                                            <Fieldset.Content>
                                                <Field.Root invalid={!!errors.email}>
                                                    <Field.Label>Địa chỉ Email</Field.Label>
                                                    <Controller
                                                        control={control}
                                                        name='email'
                                                        render={({ field }) => (
                                                            <Group attached w={'full'}>
                                                                <Input type="text" ref={inputEmailRef} value={field.value} borderColor={'gray.300'} placeholder='Nhập địa chỉ Email của bạn' onChange={(e) => field.onChange(e.target.value)} />
                                                                <Button w={'70px'} type='button' loading={isPending} disabled={seconds > 0} bgColor="gray.600" color={'white'} _hover={{ bgColor: "gray.500" }} onClick={handleSendOTP}>
                                                                    {seconds > 0 ? `${seconds}s` : "Gửi mã"}
                                                                </Button>
                                                            </Group>
                                                        )}
                                                    />
                                                    <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                                                </Field.Root>
                                                {fieldSend &&
                                                    (<Field.Root invalid={!!errors.verifyEmail}>
                                                        <Field.Label>Mã xác minh email</Field.Label>
                                                        <Input {...register('verifyEmail')} type='text' borderColor={'gray.300'} placeholder='Nhập mã xác minh' />
                                                        <Field.ErrorText>{errors.verifyEmail?.message}</Field.ErrorText>
                                                    </Field.Root>)}
                                                <Stack w={'full'} mt={7}>
                                                    <Button type='submit' loading={isSubmitting} alignSelf={'end'}>
                                                        Xác nhận
                                                    </Button>
                                                </Stack>
                                            </Fieldset.Content>
                                        </Fieldset.Root>
                                    </form>
                                ) : (
                                    <Box w={'full'} textAlign={'center'}>
                                        <Heading size={'xl'} fontWeight={'bold'} color={'blue'}>
                                            {messageSender}
                                        </Heading>
                                    </Box>

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

export default FormLoginInternal