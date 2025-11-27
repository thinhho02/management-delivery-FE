'use client'

import { update } from '@/apis/apiCore'
import { toaster } from '@/components/ui/toaster'
import { Button, Field, Fieldset, Input, InputGroup } from '@chakra-ui/react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LuEye, LuEyeClosed } from 'react-icons/lu'
import z from 'zod'


const formSchema = z.object({
    newPassword: z.string().min(6, "Tối thiểu 6 ký tự"),
    verifyNewPassword: z.string().min(6, "Tối thiểu 6 ký tự"),

})

type FormValues = z.infer<typeof formSchema>

const FormChangePassword = ({ token }: { token: string }) => {
    const [seePassNew, setSeePassNew] = useState(false)
    const [seePassVerify, setSeePassVerify] = useState(false)
    const router = useRouter()


    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors }
    } = useForm<FormValues>({
        resolver: standardSchemaResolver(formSchema),
        defaultValues: {
            newPassword: '',
            verifyNewPassword: ''
        },
    })

    const submitForm = handleSubmit(async (dataForm) => {
        if (dataForm.newPassword !== dataForm.verifyNewPassword) {
            toaster.create({
                id: `Change-Pass-E-${Date.now}`,
                type: 'error',
                title: 'Mật khâu không trùng khớp'
            })
            return;
        }
        const res = await update<{ message: string }>("/business/reset-password", { newPassword: dataForm.newPassword, token: token })
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
            router.replace("/business/login")
        }
    })

    return (
        <form onSubmit={submitForm}>
            <Fieldset.Root mt={5}>
                <Fieldset.Content>
                    <Field.Root invalid={!!errors.newPassword}>
                        <Field.Label>Mật khẩu mới</Field.Label>
                        <InputGroup endElement={<Button p={0} variant={'plain'} color={'black'} size={'sm'} onClick={() => setSeePassNew(!seePassNew)}>{seePassNew ? <LuEye /> : <LuEyeClosed />}</Button>}>
                            <Input {...register('newPassword')} type={seePassNew ? "text" : "password"} borderColor={'gray.300'} placeholder='Nhập mật khẩu mới' />
                        </InputGroup>
                        <Field.ErrorText>{errors.newPassword?.message}</Field.ErrorText>
                    </Field.Root>
                    <Field.Root invalid={!!errors.verifyNewPassword}>
                        <Field.Label>Nhập lại mật khẩu mới</Field.Label>
                        <InputGroup endElement={<Button p={0} variant={'plain'} color={'black'} size={'sm'} onClick={() => setSeePassVerify(!seePassVerify)}>{seePassVerify ? <LuEye /> : <LuEyeClosed />}</Button>}>
                            <Input {...register('verifyNewPassword')} type={seePassVerify ? "text" : "password"} borderColor={'gray.300'} placeholder='Nhập lại mật khẩu mới' />
                        </InputGroup>
                        <Field.ErrorText>{errors.verifyNewPassword?.message}</Field.ErrorText>
                    </Field.Root>
                </Fieldset.Content>
                <Button type="submit" loading={isSubmitting} mt={10} alignSelf="flex-center" bgColor={'black'} color={'white'}>
                    Thay đổi mật khẩu
                </Button>
            </Fieldset.Root>
        </form>
    )
}

export default FormChangePassword