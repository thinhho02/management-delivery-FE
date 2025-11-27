// 'use client'

// import { create, get } from '@/apis/apiCore'
// import { toaster } from '@/components/ui/toaster'
// import { debounce } from '@/libs/debounce'
// import { Box, Button, CloseButton, Combobox, createListCollection, Dialog, Field, Fieldset, HStack, Input, Portal, Select, Span, Spinner, Stack, useFilter, useListCollection, VStack } from '@chakra-ui/react'
// import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
// import axios from 'axios'
// import dynamic from 'next/dynamic'
// import { useSearchParams } from 'next/navigation'
// import React, { useCallback, useRef, useState, useTransition } from 'react'
// import { Controller, useForm } from 'react-hook-form'
// import { LuPlus } from 'react-icons/lu'
// import useSWR, { mutate } from 'swr'
// import z from 'zod'


// const formSchema = z.object({
//     name: z.string().min(1, "Tên nhân viên không được bỏ trống"),
//     email: z.string()
//         .min(1, { message: "Chưa điền thông tin" })
//         .pipe(z.email({ message: "Định dạng email không hợp lệ" })),
//     password: z.string().min(6, "Tối thiểu 6 ký tự"),
//     idNumber: z.string().min(1, "Số CCCD không được bỏ trống").max(10, "Số CCCD tối đa là 10 số"),
//     numberPhone: z.string().min(1, "Số điện thoại không được bỏ trống"),
//     address: z.string().min(1, "Địa chỉ không được bỏ trống"),
//     role: z.string().array().nonempty("Hãy chọn 1 chức vụ")
// })

// type FormValues = z.infer<typeof formSchema>


// const AddNewEmployee = () => {
//     const searchParams = useSearchParams();


//     const {
//         reset,
//         register,
//         setValue,
//         handleSubmit,
//         formState: { isSubmitting, errors },
//         control,
//     } = useForm<FormValues>({
//         resolver: standardSchemaResolver(formSchema),
//         defaultValues: {
//             name: '',
//             email: '',
//             password: '',
//             idNumber: '',
//             numberPhone: '',
//             address: '',
//             role: []
//         }
//     })
//     const [isPending, startTransition] = useTransition();








//     const [open, setOpen] = useState(false)

//     const submitForm = handleSubmit(async (dataForm) => {
//         console.log(dataForm)

//     })

//     return (
//         <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)} size={'lg'} scrollBehavior="outside">
//             <Dialog.Trigger asChild>
//                 <Button
//                     bgColor={'orange.600'}
//                     _hover={{
//                         bgColor: "orange.500"
//                     }}
//                     color={'fg'}
//                 >
//                     <LuPlus /> Thêm
//                 </Button>
//             </Dialog.Trigger>
//             <Portal key={'dialog'}>
//                 <Dialog.Backdrop />
//                 <Dialog.Positioner>
//                     <Dialog.Content>
//                         <Dialog.Header>
//                             <Dialog.Title>Thêm mới nhân viên</Dialog.Title>
//                         </Dialog.Header>
//                         <Dialog.Body>
//                             <form onSubmit={submitForm}>
//                                 <Fieldset.Root>
//                                     <Fieldset.Content>
//                                         <HStack direction="row" align={'start'}>
//                                             <Field.Root invalid={!!errors.name}>
//                                                 <Field.Label>
//                                                     Tên nhân viên
//                                                 </Field.Label>
//                                                 <Input {...register("name")} placeholder='Nhập tên nhân viên' />
//                                                 <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
//                                             </Field.Root>
//                                             <Field.Root invalid={!!errors.email}>
//                                                 <Field.Label>
//                                                     Email đăng nhập
//                                                 </Field.Label>
//                                                 <Input {...register("email")} placeholder='Nhập email' />
//                                                 <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
//                                             </Field.Root>
//                                         </HStack>
//                                         <HStack mt={10} align={'start'}>

//                                             <Field.Root invalid={!!errors.idNumber}>
//                                                 <Field.Label>Loại bưu cục</Field.Label>
//                                                 <Controller
//                                                     control={control}
//                                                     name="type"
//                                                     render={({ field }) => (
//                                                         <Select.Root
//                                                             name={field.name}
//                                                             value={field.value || []}
//                                                             onValueChange={({ value }) => {
//                                                                 console.log(value)
//                                                                 field.onChange(value)
//                                                                 setValueType(value)
//                                                             }}
//                                                             onInteractOutside={() => field.onBlur()}
//                                                             collection={types}
//                                                         >
//                                                             <Select.HiddenSelect />
//                                                             <Select.Control>
//                                                                 <Select.Trigger>
//                                                                     <Select.ValueText placeholder="Chọn loại bưu cục" />
//                                                                 </Select.Trigger>
//                                                                 <Select.IndicatorGroup>
//                                                                     <Select.Indicator />
//                                                                 </Select.IndicatorGroup>
//                                                             </Select.Control>
//                                                             <Portal key={'select'}>
//                                                                 <Select.Positioner zIndex="9999 !important">
//                                                                     <Select.Content>
//                                                                         {types.items.map((type) => (
//                                                                             <Select.Item item={type} key={type.value}>
//                                                                                 {type.label}
//                                                                                 <Select.ItemIndicator />
//                                                                             </Select.Item>)
//                                                                         )}
//                                                                     </Select.Content>
//                                                                 </Select.Positioner>
//                                                             </Portal>
//                                                         </Select.Root>
//                                                     )}
//                                                 />
//                                                 <Field.ErrorText>{errors.type?.message}</Field.ErrorText>
//                                             </Field.Root>
//                                             <Field.Root invalid={!!errors.zone}>
//                                                 <Field.Label>Chọn 1 khu vực hoạt động</Field.Label>
//                                                 <Controller
//                                                     control={control}
//                                                     name="zone"
//                                                     render={({ field }) => (
//                                                         <Combobox.Root
//                                                             collection={collectionZone}
//                                                             value={field.value ? [field.value] : []}
//                                                             onValueChange={({ value }) => {
//                                                                 field.onChange(value[0] || "")
//                                                                 setZoneId(value[0])
//                                                             }}
//                                                             onInputValueChange={(details) => filterZone(details.inputValue)}
//                                                             onInteractOutside={() => field.onBlur()}
//                                                             openOnClick
//                                                         >
//                                                             <Combobox.Control>
//                                                                 <Combobox.Input placeholder="Chọn khu vực hoạt động bưu cục" />
//                                                                 <Combobox.IndicatorGroup>
//                                                                     <Combobox.ClearTrigger />
//                                                                     <Combobox.Trigger />
//                                                                 </Combobox.IndicatorGroup>
//                                                             </Combobox.Control>

//                                                             <Portal key={'comboBox'}>
//                                                                 <Combobox.Positioner zIndex="9999 !important">
//                                                                     <Combobox.Content>
//                                                                         {isValidating ? (<HStack p="2">
//                                                                             <Spinner size="xs" borderWidth="1px" />
//                                                                             <Span>Loading...</Span>
//                                                                         </HStack>) : !!errorFetchType ? (
//                                                                             <Span p="2" color="fg.error">
//                                                                                 Error fetching
//                                                                             </Span>
//                                                                         ) : (<>
//                                                                             <Combobox.Empty>Không tìm thấy khu vực</Combobox.Empty>
//                                                                             {collectionZone.items.map((item) => (
//                                                                                 <Combobox.Item key={item.value} item={item}>
//                                                                                     {item.label}
//                                                                                     <Combobox.ItemIndicator />
//                                                                                 </Combobox.Item>
//                                                                             ))}
//                                                                         </>)}
//                                                                     </Combobox.Content>
//                                                                 </Combobox.Positioner>
//                                                             </Portal>
//                                                         </Combobox.Root>
//                                                     )}
//                                                 />
//                                                 <Field.ErrorText>{errors.zone?.message}</Field.ErrorText>
//                                             </Field.Root>
//                                         </HStack>
//                                         <Field.Root mt={5} invalid={!!errors.address || !!errors.addressNumber}>
//                                             <Field.Label>
//                                                 Địa chỉ bưu cục
//                                             </Field.Label>
//                                             <HStack w="full" align="start">
//                                                 {/* ---- Input Số nhà ---- */}
//                                                 <Field.Root flex="0 0 120px">
//                                                     <Controller
//                                                         control={control}
//                                                         name='addressNumber'
//                                                         render={({ field }) => (
//                                                             <Input type="text"
//                                                                 value={field.value || ''}
//                                                                 ref={addressNumberRef}
//                                                                 placeholder='Số nhà'
//                                                                 onChange={(e) => {
//                                                                     field.onChange(e.target.value)
//                                                                 }} />
//                                                         )}
//                                                     />
//                                                 </Field.Root>
//                                                 <Field.Root flex="1" >
//                                                     <Controller
//                                                         control={control}
//                                                         name='address'
//                                                         render={({ field }) => (
//                                                             <Combobox.Root
//                                                                 collection={collectionAddress}
//                                                                 value={field.value ? [field.value] : []}
//                                                                 onValueChange={(details) => {
//                                                                     setLngLat(details.items[0].coordinates)
//                                                                     field.onChange(details.value[0] || "")
//                                                                 }}
//                                                                 onInputValueChange={(details) => {
//                                                                     debouncedSearch(details.inputValue)
//                                                                     filterAddress(details.inputValue)
//                                                                 }}
//                                                                 onInteractOutside={() => field.onBlur()}
//                                                                 openOnClick
//                                                             >
//                                                                 <Combobox.Control>
//                                                                     <Combobox.Input placeholder="Nhập địa chỉ bưu cục" />
//                                                                     <Combobox.IndicatorGroup>
//                                                                         <Combobox.ClearTrigger />
//                                                                         <Combobox.Trigger />
//                                                                     </Combobox.IndicatorGroup>
//                                                                 </Combobox.Control>

//                                                                 <Portal key={'comboBox'}>
//                                                                     <Combobox.Positioner zIndex="9999 !important">
//                                                                         <Combobox.Content>
//                                                                             {isPending ? (<HStack p="2">
//                                                                                 <Spinner size="xs" borderWidth="1px" />
//                                                                                 <Span>Loading...</Span>
//                                                                             </HStack>) : (<>
//                                                                                 {/* <Combobox.Empty>Không tìm thấy khu vực</Combobox.Empty> */}
//                                                                                 {collectionAddress.items.map((item) => (
//                                                                                     <Combobox.Item key={item.id} item={item}>
//                                                                                         {item.label}
//                                                                                         <Combobox.ItemIndicator />
//                                                                                     </Combobox.Item>
//                                                                                 ))}
//                                                                             </>)}
//                                                                         </Combobox.Content>
//                                                                     </Combobox.Positioner>
//                                                                 </Portal>
//                                                             </Combobox.Root>
//                                                         )}
//                                                     />
//                                                 </Field.Root>
//                                             </HStack>

//                                             <Field.ErrorText>{[errors.address?.message, errors.addressNumber?.message, errors.lngLat?.message].join(", ")}</Field.ErrorText>
//                                         </Field.Root>
//                                     </Fieldset.Content>
//                                 </Fieldset.Root>

//                                 <Button type="submit" loading={isSubmitting} mt={10} w={'full'}>
//                                     Thêm mới nhân viên
//                                 </Button>
//                             </form>

//                         </Dialog.Body>
//                         <Dialog.CloseTrigger asChild>
//                             <CloseButton size="sm" />
//                         </Dialog.CloseTrigger>
//                     </Dialog.Content>
//                 </Dialog.Positioner>
//             </Portal>
//         </Dialog.Root>

//     )
// }

// export default AddNewEmployee