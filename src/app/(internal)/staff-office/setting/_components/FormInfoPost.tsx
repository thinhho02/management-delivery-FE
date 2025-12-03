// import { get } from '@/apis/apiCore'
// import { IPostOfficeRow } from '@/app/(internal)/admin/post-office/_libs/columns'
// import { Box, Center, Editable, Field, Fieldset, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
// import React from 'react'
// import useSWR from 'swr'

// const FormInfoPost = ({ postId }: { postId: string }) => {
//     const { data: post, isLoading, isValidating } = useSWR(`/post-office/${postId}`, get<IPostOfficeRow>)

//     if (!post || isLoading || isValidating) {
//         return (
//             <Box w={'full'}>
//                 <Center>
//                     <Spinner size={'sm'} />
//                 </Center>
//             </Box>
//         )
//     }
//     return (
//         <Box mt={10}>
//             {!post.success
//                 ? (
//                     <Center>
//                         <Text>{post.error}</Text>
//                     </Center>
//                 )
//                 : (
//                     <Box mb={5}>
//                         <VStack align="start">
//                             <Fieldset.Root>
//                                 <Fieldset.Content>
//                                     <HStack direction="row" align={'start'}>
//                                         <Field.Root>
//                                             <Field.Label>
//                                                 Tên bưu cục
//                                             </Field.Label>
//                                             <Editable.Root disabled defaultValue={post.result.name}>
//                                                 <Editable.Preview />
//                                                 <Editable.Input />
//                                             </Editable.Root>
//                                         </Field.Root>
//                                         <Field.Root>
//                                             <Field.Label>
//                                                 Mã bưu cục
//                                             </Field.Label>
//                                             <Editable.Root disabled defaultValue={post.result.name}>
//                                                 <Editable.Preview />
//                                                 <Editable.Input />
//                                             </Editable.Root>
//                                             <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
//                                         </Field.Root>
//                                     </HStack>
//                                     <HStack mt={5} align={'start'}>

//                                         <Field.Root invalid={!!errors.idNumber}>
//                                             <Field.Label>
//                                                 Số căn cước công dân
//                                             </Field.Label>
//                                             <Input {...register("idNumber")} readOnly maxLength={12} placeholder='Nhập số căn cước công dân' />
//                                             <Field.ErrorText>{errors.idNumber?.message}</Field.ErrorText>
//                                         </Field.Root>
//                                         <Field.Root invalid={!!errors.numberPhone}>
//                                             <Field.Label>
//                                                 Số điện thoại
//                                             </Field.Label>
//                                             <Input {...register("numberPhone")} readOnly maxLength={10} placeholder='Nhập số điện thoại' />
//                                             <Field.ErrorText>{errors.numberPhone?.message}</Field.ErrorText>
//                                         </Field.Root>

//                                     </HStack>
//                                     <Field.Root invalid={!!errors.address}>
//                                         <Field.Label>
//                                             Địa chỉ
//                                         </Field.Label>
//                                         <Editable.Root defaultValue={user.account.address}>
//                                             <Editable.Preview />
//                                             <Editable.Input  {...register("address")} placeholder='Nhập địa chỉ nhà nhân viên' />
//                                             <Editable.Control>
//                                                 <Editable.EditTrigger asChild>
//                                                     <IconButton variant="ghost" size="xs">
//                                                         <LuPencilLine />
//                                                     </IconButton>
//                                                 </Editable.EditTrigger>
//                                                 <Editable.CancelTrigger asChild>
//                                                     <IconButton variant="outline" size="xs">
//                                                         <LuX />
//                                                     </IconButton>
//                                                 </Editable.CancelTrigger>
//                                                 <Editable.SubmitTrigger asChild>
//                                                     <IconButton variant="outline" size="xs">
//                                                         <LuCheck />
//                                                     </IconButton>
//                                                 </Editable.SubmitTrigger>
//                                             </Editable.Control>
//                                         </Editable.Root>
//                                         {/* <Input {...register("address")} placeholder='Nhập địa chỉ nhà nhân viên' /> */}
//                                         <Field.ErrorText>{errors.address?.message}</Field.ErrorText>
//                                     </Field.Root>
//                                 </Fieldset.Content>
//                             </Fieldset.Root>

//                             <Button
//                                 mt={4}
//                                 colorScheme="blue"
//                                 borderRadius="full"
//                                 loading={loadingSubmit}
//                                 type='submit'
//                             >
//                                 Thay đổi
//                             </Button>
//                         </VStack>
//                     </Box>
//                 )}
//         </Box>
//     )
// }

// export default FormInfoPost