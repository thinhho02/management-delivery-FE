'use client'

import { create } from '@/apis/apiCore'
import LinkCustom from '@/components/ui/LinkCustom'
import { toaster } from '@/components/ui/toaster'
import { getLiteFingerprint } from '@/libs/getLiteFingerprint'
import { AUTH_EVENT_STORAGE_KEY, broadcastAuthEvent } from '@/libs/tokenMemory'
import { Box, Button, Checkbox, Field, Fieldset, Heading, HStack, Input, InputGroup, Text } from '@chakra-ui/react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
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
    // Lắng nghe sự kiện storage để đồng bộ nhiều tab
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key !== AUTH_EVENT_STORAGE_KEY || !e.newValue) return;

            const event = JSON.parse(e.newValue) as {
                type: "LOGIN" | "LOGOUT" | "FORCE_LOGOUT";
                time: number;
            };

            if (event.type === "LOGIN") {
                // Tab khác login → revalidate user
                router.replace("/console")
            }

        };

        window.addEventListener("storage", handler);

        return () => {
            window.removeEventListener("storage", handler);
        };
    }, []);


    const submitForm = handleSubmit(async (data) => {
        const finger = await getLiteFingerprint()
        console.log(finger)
        console.log(data)
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
            console.log(res)
            router.replace("/console")
        }

    })
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
                                    <Button p={0} variant={'plain'} size={'sm'} color={'blue'} _hover={{ color: 'blue.500' }}>Quên mật khẩu?</Button>
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
        </Box>
    )
}

export default LoginForm