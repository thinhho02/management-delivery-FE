'use client'

import { DeliveryOrder } from './DeliveryTab'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { LuMapPin, LuPhone } from 'react-icons/lu'

const OrderCard = ({ order }: { order: DeliveryOrder }) => {
    return (
        <Box
            w="full"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={3}
        >
            {/* HEADER */}
            <HStack justify="space-between">
                <Text fontWeight="bold">📦 GIAO HÀNG</Text>
                <Text fontSize="sm">TK: {order.trackingCode}</Text>
            </HStack>


            {/* CONTENT */}
            <HStack align="start">
                {/* LEFT */}
                <VStack align="start" flex={1}>
                    <Text fontWeight="bold">{order.receiverName}</Text>

                    <HStack>
                        <LuPhone />
                        <Text
                            fontSize="sm"
                            color="red.500"
                            cursor="pointer"
                            onClick={() => window.open(`tel:${order.receiverPhone}`)}
                        >
                            {order.receiverPhone.replace(/^(\d{2})\d{5}(\d{2})$/, "$1*****$2")}
                        </Text>
                    </HStack>

                    <HStack>
                        <LuMapPin />
                        <Text
                            fontSize="sm"
                            color="blue.600"
                            cursor="pointer"
                        >
                            {order.receiverAddress}
                        </Text>
                    </HStack>
                </VStack>

                {/* RIGHT */}
                <VStack align="end">
                    <Text fontSize="sm" fontWeight="medium">
                        {order.productsName}
                    </Text>
                    <Text fontSize="sm">⚖️ {order.totalWeight} kg</Text>
                    {order.note && (
                        <Text fontSize="xs" color="gray.500">
                            📝 {order.note}
                        </Text>
                    )}
                </VStack>
            </HStack>

            {/* FOOTER */}
            <HStack justify="space-between">
                <Text fontWeight="bold" color="orange.600">
                    COD:
                </Text>
                <Text fontWeight="bold" color="orange.600">
                    {order.codAmount.toLocaleString("vi-VN")} đ
                </Text>
            </HStack>
        </Box>
    )
}

export default OrderCard