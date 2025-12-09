'use client'

import { create } from '@/apis/apiCore'
import LinkCustom from '@/components/ui/LinkCustom'
import { toaster } from '@/components/ui/toaster'
import { getLiteFingerprint } from '@/libs/getLiteFingerprint'
import { Box, Button, Checkbox, CloseButton, createOverlay, Dialog, Field, Fieldset, Heading, HStack, Input, InputGroup, Portal, Stack, Text } from '@chakra-ui/react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Controller, useController, useForm } from 'react-hook-form'
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
    message: string;
}

const LoginForm = () => {
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

        const res = await create<ResponseLogin>("/auth/business/login", payload)
        if (!res.success) {
            toaster.create({
                id: `login-b-failed-${Date.now()}`,
                type: 'error',
                title: res.error
            })
            return { success: false, message: res.error }
        } else {
            router.replace("/console")
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
                <Text fontWeight={'500'} mt={2}>
                    Chưa có tài khoản? <LinkCustom href={'/business/signup'} color={'blue'} _hover={{ color: 'blue.500' }}>Đăng Ký</LinkCustom>
                </Text>
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

const emailSchema = formSchema.pick({
    email: true,
});

type EmailValues = z.infer<typeof emailSchema>;

const dialog = createOverlay<DialogProps>((props) => {
    const { description, ...rest } = props

    const [messageSender, setMessageSender] = useState<string| undefined>(undefined)
    const {
        handleSubmit,
        control,
        formState: { isSubmitting, errors }
    } = useForm<EmailValues>({
        resolver: standardSchemaResolver(emailSchema),
        defaultValues: {
            email: '',
        },
    })

    const submitFormChangePass = handleSubmit(async (dataForm) => {
        if (dataForm.email === '') return;

        const res = await create<{message: string}>("/business/verify", { email: dataForm.email })
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
                            {messageSender
                                ? (
                                    <Box w={'full'} textAlign={'center'}>
                                        <Heading size={'xl'} fontWeight={'bold'} color={'blue'}>
                                            {messageSender}
                                        </Heading>
                                    </Box>
                                )
                                : (
                                    <form onSubmit={submitFormChangePass}>
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

                                        <Stack w={'full'} mt={7}>
                                            <Button type='submit' loading={isSubmitting} alignSelf={'end'}>
                                                Xác nhận
                                            </Button>
                                        </Stack>
                                    </form>)
                            }
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



export default LoginForm