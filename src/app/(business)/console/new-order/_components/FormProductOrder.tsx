import { Box, Field, Fieldset, Heading, HStack, IconButton, Input, InputGroup, NumberInput } from '@chakra-ui/react'
import React, { memo } from 'react'
import z from 'zod'
import { ProductSchema } from './FormNewOrder'
import { useFormContext } from 'react-hook-form'
import { LuMinus, LuPlus } from 'react-icons/lu'


type FormValues = z.infer<typeof ProductSchema>


const FormProductOrder = memo(() => {


    const {
        register,
        formState: { errors },
    } = useFormContext<FormValues>()


    return (
        <Box py={4} px={4} rounded={'lg'} bgColor={'bg.muted'} w={'full'}>
            <Heading size={'lg'} fontWeight={'bold'}>
                Sản phẩm
            </Heading>
            <Fieldset.Root mt={5}>
                <Fieldset.Content>
                    <Field.Root invalid={!!errors.productName}>
                        <Field.Label>
                            Tên sản phẩm
                        </Field.Label>
                        <Input {...register("productName")} placeholder='Nhập tên sản phẩm' />
                        <Field.ErrorText>{errors.productName?.message}</Field.ErrorText>
                    </Field.Root>
                    <HStack>
                        <Field.Root invalid={!!errors.productQty}>
                            <Field.Label>
                                Số kiện
                            </Field.Label>
                            <NumberInput.Root defaultValue="1" position={'relative'} min={1} max={10}>

                                <NumberInput.DecrementTrigger asChild>
                                    <IconButton variant="ghost" size="sm" position={'absolute'} left={0.5} top={0.5} zIndex={'1'}>
                                        <LuMinus />
                                    </IconButton>
                                </NumberInput.DecrementTrigger>
                                <NumberInput.Input {...register('productQty')} textAlign={'center'} outline={'none'} />
                                <NumberInput.IncrementTrigger asChild>
                                    <IconButton variant={'ghost'} size="sm" position={'absolute'} right={0.5} top={0.5} zIndex={'1'}>
                                        <LuPlus />
                                    </IconButton>
                                </NumberInput.IncrementTrigger>
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.productQty?.message}</Field.ErrorText>
                        </Field.Root>
                        <Field.Root invalid={!!errors.productWeight}>
                            <Field.Label>
                                Tổng trọng lượng (KG)
                            </Field.Label>
                            <NumberInput.Root defaultValue="1" step={0.1} position={'relative'} min={0.01}>

                                <NumberInput.DecrementTrigger asChild>
                                    <IconButton variant="ghost" size="sm" position={'absolute'} left={0.5} top={0.5} zIndex={'1'}>
                                        <LuMinus />
                                    </IconButton>
                                </NumberInput.DecrementTrigger>
                                <NumberInput.Input {...register('productWeight')} textAlign={'center'} outline={'none'} />
                                <NumberInput.IncrementTrigger asChild>
                                    <IconButton variant={'ghost'} size="sm" position={'absolute'} right={0.5} top={0.5} zIndex={'1'}>
                                        <LuPlus />
                                    </IconButton>
                                </NumberInput.IncrementTrigger>
                            </NumberInput.Root>
                            <Field.ErrorText>{errors.productWeight?.message}</Field.ErrorText>
                        </Field.Root>
                    </HStack>
                </Fieldset.Content>
            </Fieldset.Root>

        </Box>
    )
})

export default FormProductOrder