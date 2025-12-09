import { verifyEmail } from '@/action/sendOtp'
import { update } from '@/apis/apiCore'
import { toaster } from '@/components/ui/toaster'
import { UserContextState } from '@/app/(business)/_providers/UserProviderBusiness'
import { Box, Button, CloseButton, Dialog, Field, Fieldset, Heading, Input, InputGroup, Portal, VStack } from '@chakra-ui/react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import React, { useCallback, useRef, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { LuEye, LuEyeClosed } from 'react-icons/lu'
import z from 'zod'


const formSchema = z.object({
    email: z.string()
        .min(1, { message: "Chưa điền thông tin" })
        .pipe(z.email({ message: "Định dạng email không hợp lệ" })),
    name: z.string().min(1, "Chưa điền tên doanh nghiệp"),
})

type FormValues = z.infer<typeof formSchema>

const FormProfileBusiness = ({ user, mutateUser }: UserContextState) => {
    const [seePass, setSeePass] = useState(false)
    const [openVerify, setOpenVerify] = useState(false)
    const [pendingData, setPendingData] = useState<FormValues | null>(null)
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const verifyPasswordRef = useRef<HTMLInputElement | null>(null)
    const [isPending, startTransition] = useTransition();


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
        },
    })

    const submitForm = handleSubmit(async (dataForm) => {
        if (user.account.email !== dataForm.email) {
            const verify = await verifyEmail(dataForm.email)
            if (!verify.status) {
                setError("email", {
                    type: "validate",
                    message: verify.message
                })
                return;
            }
        }
        setPendingData(dataForm)        // Lưu dữ liệu form
        setLoadingSubmit(true)          // Button loading
        setOpenVerify(true)             // Mở dialog xác thực
    })


    const handleVerify = useCallback((password: string) => {
        if (!pendingData) return;
        if (!password || password.trim() === '') {
            toaster.create({
                id: `Error-update-${Date.now}`,
                type: "error",
                title: "Vui lòng nhập đầy đủ thông tin"
            })
            return;
        }
        startTransition(async () => {
            const data = {
                email: pendingData.email,
                name: pendingData.name,
                password
            }
            const res = await update<{ message: string, data: { email: string, name: string } }>("/business/update", data)


            if (!res.success) {
                toaster.create({
                    id: `Error-update-${Date.now}`,
                    type: "error",
                    title: res.error
                })
            }
            else {
                toaster.create({
                    id: `Success-update-${Date.now}`,
                    type: "success",
                    title: res.result.message
                })

                mutateUser((prev) => {
                    if (!prev || !prev.success) return undefined
                    return {
                        ...prev,
                        result: {
                            ...prev.result,
                            account: {
                                ...prev.result.account,
                                email: res.result.data.email,
                                name: res.result.data.name
                            }
                        }
                    }
                }, false)

                setPendingData(null)        // Lưu dữ liệu form
                setLoadingSubmit(false)          // Button loading
                setOpenVerify(false)             // Mở dialog xác thực
            }
        })
    }, [pendingData])
    return (
        <Box mt={10} divideY={'1px'}>
            <form onSubmit={submitForm}>
                <Box mb={5}>
                    <VStack align="start">
                        <Fieldset.Root>
                            <Fieldset.Content>
                                <Field.Root invalid={!!errors.name}>
                                    <Field.Label>
                                        Tên doanh nghiệp
                                    </Field.Label>
                                    <Input {...register("name")} placeholder='Nhập tên doanh nghiệp của bạn' />
                                    <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                                </Field.Root>
                                <Field.Root invalid={!!errors.email}>
                                    <Field.Label>
                                        Email
                                    </Field.Label>
                                    <Controller
                                        control={control}
                                        name='email'
                                        render={({ field }) => (
                                            <Input type="text" value={field.value} placeholder='Nhập địa chỉ Email của bạn' onChange={(e) => field.onChange(e.target.value)} />
                                        )}
                                    />
                                    <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
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
            <Dialog.Root
                open={openVerify}
                placement={'center'}
                lazyMount
                closeOnInteractOutside={false}
                onOpenChange={(e) => {
                    setOpenVerify(e.open)
                    setLoadingSubmit(e.open)
                }}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content p={4}>
                            <Dialog.Header>
                                <Dialog.Title>
                                    Xác thực mật khẩu
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <InputGroup endElement={<Button p={0} variant={'plain'} size={'sm'} onClick={() => setSeePass(!seePass)}>{seePass ? <LuEye /> : <LuEyeClosed />}</Button>}>
                                    <Input
                                        size="sm"
                                        type={seePass ? "text" : "password"}
                                        ref={verifyPasswordRef}
                                        placeholder="Nhập mật khẩu để xác thực"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                if (!verifyPasswordRef.current) return;
                                                const pass = verifyPasswordRef.current.value
                                                handleVerify(pass)
                                            }
                                        }}
                                    />
                                </InputGroup>

                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button
                                    colorScheme="blue"
                                    loading={isPending}
                                    onClick={() => {
                                        if (!verifyPasswordRef.current) return;
                                        const pass = verifyPasswordRef.current.value
                                        handleVerify(pass)
                                    }}
                                >
                                    Xác nhận
                                </Button>

                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </Box>
    )
}

export default FormProfileBusiness