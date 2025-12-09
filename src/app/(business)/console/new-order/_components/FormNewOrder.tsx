'use client'

import { Alert, Box, Button, Container, FormatNumber, Heading, HStack, RadioGroup, Skeleton, Stack, Textarea, VStack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import FormSenderOrder from './FormSenderOrder'
import FormReceiverOrder from './FormReceiverOrder'
import FormProductOrder from './FormProductOrder'
import FormInfoOrder from './FormInfoOrder'
import z from 'zod'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useUserDefault } from '../_hooks/useUserDefault'
import { create, get } from '@/apis/apiCore'
import { toaster } from '@/components/ui/toaster'

export const SenderSchema = z.object({
    senderName: z.string().min(1, "Tên nhân viên không được bỏ trống"),
    senderEmail: z.string()
        .min(1, { message: "Chưa điền thông tin" })
        .pipe(z.email({ message: "Định dạng email không hợp lệ" })),
    senderCheckEmail: z.boolean(),
    senderSetDefault: z.boolean().optional(),
    isUserDefault: z.boolean().optional(),
    senderNumberPhone: z.string().min(1, "Số điện thoại không được bỏ trống").length(10, "Số điện thoại tối đa là 10 số"),
    senderAddress: z.string().min(1, "Địa chỉ không được bỏ trống"),
    senderProvinceId: z.string().min(1, "Tỉnh/Thành không được bỏ trống"),
    senderWardId: z.string().min(1, "Phường/Xã không được bỏ trống"),
    senderLngLat: z.string().min(1, "Cần có 1 vị trí trong bản đồ")
})

export const ReceiverSchema = z.object({
    receiverName: z.string().min(1, "Tên nhân viên không được bỏ trống"),
    receiverEmail: z.string()
        .min(1, { message: "Chưa điền thông tin" })
        .pipe(z.email({ message: "Định dạng email không hợp lệ" })),
    receiverCheckEmail: z.boolean().optional(),
    receiverNumberPhone: z.string().min(1, "Số điện thoại không được bỏ trống").length(10, "Số điện thoại tối đa là 10 số"),
    receiverAddress: z.string().min(1, "Địa chỉ không được bỏ trống"),
    receiverProvinceId: z.string().min(1, "Tỉnh/Thành không được bỏ trống"),
    receiverWardId: z.string().min(1, "Phường/Xã không được bỏ trống"),
    receiverLngLat: z.string().min(1, "Cần có 1 vị trí trong bản đồ")
})

export const ProductSchema = z.object({
    productName: z.string().min(1, "Tên sản phẩm không được bỏ trống"),
    productQty: z.string().min(1, "Số kiện hàng phải lớn hơn 1"),
    productWeight: z.string().min(1, "Trọng lượng phải lớn hớn 0")
})

export const InfoOrderSchema = z.object({
    shipCod: z.boolean(),
    amountCod: z.string().optional()
})

export const RootSchema = z.object({
    pick: z.string().min(1, "Chọn cách giao hàng"),
    note: z.string().optional(),
    payment: z.string().min(1, "Chọn 1 người thanh toán phí ship"),
    shipFee: z.number(),
    ...ReceiverSchema.shape,
    ...ProductSchema.shape,
    ...InfoOrderSchema.shape,
    ...SenderSchema.shape
})

interface CalcFeeResponse {
    success: boolean,
    zone: string,
    zoneLabel: string,
    distanceKm: number,
    shipFee: number
}

type FormValues = z.infer<typeof RootSchema>

const FormNewOrder = () => {
    const { data, isLoading, onMutate } = useUserDefault()
    const [valueRadio, setValueRadio] = useState<string | null>("pick_home")
    const [distanceKm, setDistanceKm] = useState<number>(0)
    const [shipFee, setShipFee] = useState<number>(0)
    const formParent = useForm<FormValues>({
        resolver: standardSchemaResolver(RootSchema),
        defaultValues: {
            pick: "pick_home",
            payment: 'sender_pay',
            note: '',

            productName: "",
            productQty: "1",
            productWeight: "1",

            shipCod: false,
            shipFee: 0,
            amountCod: '',

            receiverName: '',
            receiverNumberPhone: '',
            receiverCheckEmail: false,
            receiverEmail: '',
            receiverProvinceId: '',
            receiverWardId: '',
            receiverLngLat: '',
            receiverAddress: '',

            senderName: "",
            senderEmail: "",
            senderNumberPhone: "",
            senderCheckEmail: false,
            senderSetDefault: false,
            senderAddress: "",
            senderProvinceId: "",
            senderWardId: "",
            senderLngLat: "",
            isUserDefault: false
        }
    })
    
    useEffect(() => {
        if (isLoading || !data.default) return;
        formParent.reset({
            senderName: data.name,
            senderEmail: data.email,
            senderNumberPhone: data.numberPhone,
            senderCheckEmail: data.email ? true : false,
            senderAddress: data.address,
            isUserDefault: data.default,
            senderProvinceId: data?.provinceId?._id || "",
            senderWardId: data?.wardId?._id || "",
            senderLngLat: data.location
                ? JSON.stringify({
                    longitude: data.location.type === "Point" ? data.location.coordinates[0] : 0,
                    latitude: data.location.type === "Point" ? data.location.coordinates[1] : 0
                }) : ""
        }, { keepDefaultValues: false, })
    }, [isLoading, data])

    const senderProvinceId = formParent.watch("senderProvinceId");
    const senderLngLat = formParent.watch("senderLngLat");

    const receiverProvinceId = formParent.watch("receiverProvinceId");
    const receiverLngLat = formParent.watch("receiverLngLat");

    const productWeight = formParent.watch("productWeight");


    useEffect(() => {
        // Điều kiện đủ dữ liệu
        if (
            !senderProvinceId ||
            !senderLngLat ||
            !receiverProvinceId ||
            !receiverLngLat ||
            !productWeight
        ) {
            return;
        }

        // Parse lngLat
        const sellerPoint = JSON.parse(senderLngLat);
        const customerPoint = JSON.parse(receiverLngLat);

        // Tính trọng lượng tổng: qty * weight
        const totalWeight = Number(productWeight);

        // Gọi API
        const fetchShipFee = async () => {
            const payload = {
                senderProvinceId,
                senderLngLat: [sellerPoint.longitude, sellerPoint.latitude],
                receiverProvinceId,
                receiverLngLat: [customerPoint.longitude, customerPoint.latitude],
                totalWeight
            }
            const res = await create<CalcFeeResponse>(`/shipment/calculate`, payload)
            if (!res.success) {
                queueMicrotask(() => {
                    toaster.error({
                        id: `Error-Shipment-Calc-${Date.now}`,
                        title: "Không thể tính toán cước phí vận chuyển"
                    })
                })
            } else {
                setDistanceKm(res.result.distanceKm)
                setShipFee(res.result.shipFee)
                formParent.setValue("shipFee", res.result.shipFee)
            }
        };

        fetchShipFee();

    }, [
        senderProvinceId,
        senderLngLat,
        receiverProvinceId,
        receiverLngLat,
        productWeight
    ]);

    const submitForm = formParent.handleSubmit(async (dataForm) => {
        if (!dataForm.senderCheckEmail) {
            formParent.setError("senderEmail", { message: "Cần kiểm tra email trước khi tạo đơn hàng" })
            return;
        }
        if (!dataForm.receiverCheckEmail) {
            formParent.setError("receiverEmail", { message: "Cần kiểm tra email trước khi tạo đơn hàng" })
            return;
        }
        if (dataForm.shipCod && !dataForm.amountCod) {
            formParent.setError("amountCod", { message: "Nhập số tiền" })
            return;
        }

        // reverse number amountCod
        const payload = {
            pick: dataForm.pick,
            payment: dataForm.payment,
            note: dataForm.note,

            productName: dataForm.productName,
            productQty: dataForm.productQty,
            productWeight: dataForm.productWeight,

            shipCod: dataForm.shipCod,
            amountCod: Number((dataForm.amountCod || "").replace(/\D/g, "")),
            shipFee: dataForm.shipFee,

            senderName: dataForm.senderName,
            senderEmail: dataForm.senderEmail,
            senderNumberPhone: dataForm.senderNumberPhone,
            senderCheckEmail: dataForm.senderCheckEmail,
            senderAddress: dataForm.senderAddress,
            senderProvinceId: dataForm.senderProvinceId,
            senderWardId: dataForm.senderWardId,
            senderLngLat: dataForm.senderLngLat,
            senderSetDefault: dataForm.senderSetDefault,
            isUserDefault: dataForm.isUserDefault,

            receiverName: dataForm.receiverName,
            receiverEmail: dataForm.receiverEmail,
            receiverNumberPhone: dataForm.receiverNumberPhone,
            receiverCheckEmail: dataForm.receiverCheckEmail,
            receiverAddress: dataForm.receiverAddress,
            receiverProvinceId: dataForm.receiverProvinceId,
            receiverWardId: dataForm.receiverWardId,
            receiverLngLat: dataForm.receiverLngLat,
        }
        const res = await create<any>(`/order/create`, payload)
        if (!res.success) {
            toaster.error({
                id: `Create-Order-E-${Date.now}`,
                title: "Tạo đơn hàng không thành công",
                description: res.error
            })
        } else {
            toaster.success({
                id: `Success-Order-${Date.now}`,
                title: res.result.message
            })
            if (dataForm.isUserDefault && !dataForm.senderSetDefault) {
                formParent.reset()
                return;
            } else if (dataForm.senderSetDefault) {
                onMutate()
            }
            formParent.reset()
        }
    })
    return (
        <FormProvider {...formParent}>
            <form onSubmit={submitForm}>
                <Container maxW={'5xl'} mb={20}>
                    <VStack gap={4}>
                        <Box py={4} px={4} rounded={'lg'} bgColor={'bg.muted'} w={'full'}>
                            <Heading size={'lg'} fontWeight={'bold'}>
                                Hình thức lấy hàng
                            </Heading>
                            <Controller
                                control={formParent.control}
                                name="pick"
                                render={({ field }) => (

                                    <RadioGroup.Root
                                        mt={2}
                                        colorPalette={'orange'}
                                        variant={'outline'}
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={({ value }) => {
                                            field.onChange(value)
                                            setValueRadio(value)
                                        }}
                                    >
                                        <HStack gap="3">
                                            <RadioGroup.Item value={"pick_post"}>
                                                <RadioGroup.ItemHiddenInput onBlur={field.onBlur} />
                                                <RadioGroup.ItemIndicator />
                                                <RadioGroup.ItemText color={'gray.fg'}>Gửi hàng tại bưu cục</RadioGroup.ItemText>
                                            </RadioGroup.Item>
                                            <RadioGroup.Item value={"pick_home"}>
                                                <RadioGroup.ItemHiddenInput onBlur={field.onBlur} />
                                                <RadioGroup.ItemIndicator />
                                                <RadioGroup.ItemText color={'gray.fg'}>Lấy hàng tại nhà</RadioGroup.ItemText>
                                            </RadioGroup.Item>
                                        </HStack>
                                        {valueRadio === "pick_home" && (
                                            <Alert.Root mt={5} status="warning" bgColor={''}>
                                                <Alert.Title>Shipper sẽ đến địa chỉ của bạn để lấy hàng</Alert.Title>
                                            </Alert.Root>
                                        )}
                                    </RadioGroup.Root>
                                )}
                            />
                        </Box>
                        <Skeleton loading={isLoading}>
                            <FormSenderOrder user={data} isLoading={isLoading} />
                        </Skeleton>
                        <FormReceiverOrder />
                        <FormProductOrder />
                        <FormInfoOrder />
                        <Box py={4} px={4} rounded={'lg'} bgColor={'bg.muted'} w={'full'}>
                            <Stack gap={5}>
                                <Heading size={'lg'} fontWeight={'bold'}>
                                    Ghi chú
                                </Heading>
                                <Textarea {...formParent.register('note')} variant="outline" placeholder="Ghi chú cho người nhận hoặc shipper" />
                            </Stack>

                        </Box>
                        <Box py={4} alignSelf={'end'}>
                            <HStack gap={10}>
                                <Box>
                                    <VStack align={'end'}>
                                        <Controller
                                            control={formParent.control}
                                            name="payment"
                                            render={({ field }) => (
                                                <RadioGroup.Root
                                                    colorPalette={'orange'}
                                                    variant={'outline'}
                                                    name={field.name}
                                                    value={field.value}
                                                    onValueChange={({ value }) => {
                                                        field.onChange(value)
                                                    }}
                                                >
                                                    <HStack gap={10}>
                                                        <RadioGroup.Item value={"sender_pay"} >
                                                            <RadioGroup.ItemHiddenInput onBlur={field.onBlur} />
                                                            <RadioGroup.ItemIndicator />
                                                            <RadioGroup.ItemText>Người gửi thanh toán</RadioGroup.ItemText>
                                                        </RadioGroup.Item>
                                                        <RadioGroup.Item value={"receiver_pay"}>
                                                            <RadioGroup.ItemHiddenInput onBlur={field.onBlur} />
                                                            <RadioGroup.ItemIndicator />
                                                            <RadioGroup.ItemText>Người nhận thanh toán</RadioGroup.ItemText>
                                                        </RadioGroup.Item>
                                                    </HStack>
                                                </RadioGroup.Root>
                                            )}
                                        />
                                        <HStack>
                                            <Heading size={'md'}>
                                                Tổng cước: {Number(shipFee).toLocaleString("en-US")} <kbd>đ</kbd>
                                            </Heading>

                                        </HStack>
                                        <Box>
                                            <Heading size={'md'}>
                                                Khoảng cách ước tính: {distanceKm} <kbd>Km</kbd>
                                            </Heading>
                                        </Box>
                                    </VStack>
                                </Box>
                                <Button size={'lg'} loading={formParent.formState.isSubmitting} type='submit' bgColor={"red.solid"}>
                                    Tạo đơn hàng
                                </Button>
                            </HStack>
                        </Box>
                    </VStack>
                </Container>
            </form>
        </FormProvider>
    )
}

export default FormNewOrder