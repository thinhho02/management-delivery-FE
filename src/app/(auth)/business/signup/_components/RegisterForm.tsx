'use client'

import { registerBusiness } from '@/action/authBusiness'
import { sendOtpAction, verifyEmail } from '@/action/sendOtp'
import { create } from '@/apis/apiCore'
import LinkCustom from '@/components/ui/LinkCustom'
import { toaster } from '@/components/ui/toaster'
import { AUTH_EVENT_STORAGE_KEY } from '@/libs/tokenMemory'
import { Box, Button, Checkbox, CloseButton, Dialog, Field, Fieldset, Group, Heading, HStack, Input, InputGroup, Link, Portal, Stack, Text, VStack } from '@chakra-ui/react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { LuEye, LuEyeClosed } from 'react-icons/lu'
import z, { string } from 'zod'

const formSchema = z.object({
  email: z.string()
    .min(1, { message: "Chưa điền thông tin" })
    .pipe(z.email({ message: "Định dạng email không hợp lệ" })),
  name: z.string().min(1, "Chưa điền tên doanh nghiệp"),
  verifyEmail: z.string().min(1, "Chưa điền mã xác minh"),
  password: z.string().min(6, "Tối thiểu 6 ký tự"),
  acceptTerms: z.boolean().refine((val) => val === true, { error: "Bạn phải đồng ý điều khoản trước khi đăng ký" })
})

type FormValues = z.infer<typeof formSchema>



const RegisterForm = () => {
  const [openModal, setOpenModal] = useState(false)
  const [seePass, setSeePass] = useState(false)
  const [fieldSend, setFieldSend] = useState(false)
  const [seconds, setSeconds] = useState<number>(0);
  const inputEmailRef = useRef<HTMLInputElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter()


  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { isSubmitting, errors }
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      verifyEmail: '',
      acceptTerms: false
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
        }
        setSeconds(60);
      }
    })
  }, [])

  const submitForm = handleSubmit(async (data) => {

    const verifyRegister = await registerBusiness(data)

    if (!verifyRegister.success) {
      toaster.create({
        id: `register-business-err-${Date.now()}`,
        type: 'error',
        title: "Đăng ký không thành công",
        description: verifyRegister.message
      })
    } else {

      const dataForm = {
        email: data.email,
        password: data.password,
        name: data.name,
        verify: verifyRegister.success
      }
      const res = await create<{ success: boolean }>("/auth/business/register", dataForm)
      if (!res.success) {

        toaster.create({
          id: `register-business-err-${Date.now()}`,
          type: 'error',
          title: "Đăng ký không thành công",
          description: res.error
        })
      } else {

        toaster.create({
          id: `register-business-sc-${Date.now()}`,
          type: 'success',
          title: "Đăng ký thành công",
        })
        router.push("/business/login");
      }
    }
  })

  return (
    <Box rounded={'xl'} bgColor={'white'} color={'black'}>
      <Box p={6}>
        <Heading size={'2xl'} fontWeight={'medium'}>
          Đăng ký
        </Heading>
        <Text fontWeight={'500'} mt={2}>
          Bạn đã có tài khoản t&k express dành cho doanh nghiệp? <LinkCustom href={'/business/login'} color={'blue'} _hover={{ color: 'blue.500' }}>Đăng nhập</LinkCustom>
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
                    <Input type="text" ref={inputEmailRef} value={field.value} borderColor={'gray.300'} placeholder='Nhập địa chỉ Email của bạn' onFocus={() => setFieldSend(true)} onChange={(e) => field.onChange(e.target.value)} />
                  )}
                />
                <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
              </Field.Root>
              {fieldSend && <Field.Root invalid={!!errors.verifyEmail}>
                <Field.Label>Mã xác minh email</Field.Label>
                <Group attached w={'full'}>
                  <Input {...register('verifyEmail')} flex={1} type='text' borderColor={'gray.300'} placeholder='Nhập mã xác minh' />
                  <Button w={'70px'} type='button' loading={isPending} disabled={seconds > 0} bgColor="gray.600" color={'white'} _hover={{ bgColor: "gray.500" }} onClick={handleSendOTP}>
                    {seconds > 0 ? `${seconds}s` : "Gửi mã"}
                  </Button>
                </Group>
                <Field.ErrorText>{errors.verifyEmail?.message}</Field.ErrorText>
              </Field.Root>}

              <Field.Root invalid={!!errors.name}>
                <Field.Label>Nhập tên doanh nghiệp</Field.Label>
                <Input {...register('name')} type={'text'} borderColor={'gray.300'} placeholder='Nhập tên doanh nghiệp' />
                <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
              </Field.Root>


              <Field.Root invalid={!!errors.password}>
                <Field.Label>Mật khẩu</Field.Label>
                <InputGroup endElement={<Button p={0} variant={'plain'} color={'black'} size={'sm'} onClick={() => setSeePass(!seePass)}>{seePass ? <LuEye /> : <LuEyeClosed />}</Button>}>
                  <Input {...register('password')} type={seePass ? "text" : "password"} borderColor={'gray.300'} placeholder='Nhập mật khẩu' />
                </InputGroup>
                <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
              </Field.Root>
            </Fieldset.Content>
            <Controller
              control={control}
              name='acceptTerms'
              render={({ field }) => (
                <Field.Root invalid={!!errors.acceptTerms}>
                  <HStack gap={1}>
                    <Checkbox.Root checked={field.value} alignItems="flex-start" variant={'solid'} colorPalette={'teal'} onCheckedChange={({ checked }) => field.onChange(checked)}>
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label>Tôi đồng ý với các </Checkbox.Label>
                    </Checkbox.Root>
                    <Box p={0} cursor={'pointer'} color={'blue'} _hover={{ color: 'blue.500' }} onClick={() => setOpenModal(true)}>Điều khoản dịch vụ</Box>
                  </HStack>

                  <Field.ErrorText>{errors.acceptTerms?.message}</Field.ErrorText>

                </Field.Root>
              )}
            />


            <Button type="submit" loading={isSubmitting} mt={10} alignSelf="flex-center" bgColor={'black'} color={'white'}>
              Đăng ký
            </Button>
          </Fieldset.Root>
        </form>
      </Box>
      <Dialog.Root
        open={openModal}
        size={'xl'}
        placement={'center'}
        lazyMount
        closeOnInteractOutside={false}
        onOpenChange={(e) => {
          setOpenModal(e.open)
        }}>
          
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  Điều khoản dịch vụ
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>


              </Dialog.Body>
              <Dialog.Footer>


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

export default RegisterForm