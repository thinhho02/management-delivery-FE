'use client'

import { Box, Checkbox, defineStyle, Field, Heading, Input, InputGroup, InputProps, Stack, useControllableState } from '@chakra-ui/react'
import React, { memo, useState } from 'react'
import z from 'zod'
import { InfoOrderSchema } from './FormNewOrder'
import { Controller, useFormContext, UseFormSetValue } from 'react-hook-form'

type FormValues = z.infer<typeof InfoOrderSchema>


const FormInfoOrder = memo(() => {
    const [checked, setChecked] = useState(false)

    const {
        setValue,
        control,
        getValues,
        formState: { errors },
    } = useFormContext<FormValues>()

    return (
        <Box py={4} px={4} rounded={'lg'} bgColor={'bg.muted'} w={'full'}>
            <Stack gap={5}>
                <Heading size={'lg'} fontWeight={'bold'}>
                    Thông tin vận chuyển
                </Heading>
                <Controller
                    control={control}
                    name="shipCod"
                    render={({ field }) => (
                        <Checkbox.Root
                            checked={field.value}
                            onCheckedChange={({ checked }) => {
                                if (!checked) {
                                    setValue("amountCod", "")
                                }
                                field.onChange(checked)
                                setChecked(!!checked)
                            }}
                        >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>Khai giá</Checkbox.Label>
                        </Checkbox.Root>

                    )}
                />
                {checked && (
                    <Field.Root invalid={!!errors.amountCod} >
                        <Controller
                            control={control}
                            name='amountCod'
                            render={(({ field }) => (
                                <InputGroup endElement={"VNĐ"}>
                                    <FloatingLabelInput value={field.value} label="Nhập số tiền" type='tel' onValueChange={(e) => field.onChange(e)} />
                                </InputGroup>
                            )
                            )}
                        />
                        <Field.ErrorText>{errors.amountCod?.message}</Field.ErrorText>
                    </Field.Root>
                )}
            </Stack>

        </Box>
    )
})
interface FloatingLabelInputProps extends InputProps {
    label: React.ReactNode
    value?: string | undefined
    defaultValue?: string | undefined
    onValueChange?: ((value: string) => void) | undefined
}

const FloatingLabelInput = (props: FloatingLabelInputProps) => {
    const { label, onValueChange, value, defaultValue = "", ...rest } = props

    const [inputState, setInputState] = useControllableState({
        defaultValue,
        onChange: onValueChange,
        value,
    })

    const [focused, setFocused] = useState(false)
    const shouldFloat = inputState.length > 0 || focused
    const formatCurrency = (value: string) => {
        if (!value) return "";
        return Number(value).toLocaleString("en-US");
    };

    const removeFormat = (value: string) => {
        return value.replace(/[^0-9]/g, ""); // remove all non-numeric
    };
    return (
        <Box pos="relative" w="full">
            <Input
                {...rest}
                onFocus={(e) => {
                    props.onFocus?.(e)
                    setFocused(true)
                }}
                onBlur={(e) => {
                    props.onBlur?.(e)
                    setFocused(false)
                }}
                onChange={(e) => {
                    const raw = removeFormat(e.target.value);
                    const formatted = formatCurrency(raw);
                    props.onChange?.(e)
                    setInputState(formatted)
                }}
                value={inputState}
                data-float={shouldFloat || undefined}
            />
            <Field.Label css={floatingStyles} data-float={shouldFloat || undefined}>
                {label}
            </Field.Label>
        </Box>
    )
}

const floatingStyles = defineStyle({
    pos: "absolute",
    bg: "bg.muted",
    px: "0.5",
    top: "2.5",
    insetStart: "3",
    fontWeight: "normal",
    pointerEvents: "none",
    transition: "position",
    color: "fg.muted",
    "&[data-float]": {
        top: "-3",
        insetStart: "2",
        color: "fg",
    },
})

export default FormInfoOrder