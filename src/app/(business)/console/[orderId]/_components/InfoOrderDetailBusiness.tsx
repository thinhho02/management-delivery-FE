'use client'

import { Badge, Box, Grid, Heading, HStack, Text, Timeline, VStack } from '@chakra-ui/react'
import React from 'react'
import { ResponseDetailOrder } from '../_types/responseDetailOrder'
import { Tooltip } from '@/components/ui/tooltip'
import { LuMapPin } from 'react-icons/lu'
import { formatDateVN } from '@/utils/formatDateVN'
import dynamic from 'next/dynamic'
import TimelineShipment from '@/components/ui/TimeLineShipment'
import TrackingOrderMap from './TrackingOrderMap'
const InfoOrderMap = dynamic(() => import('./InfoOrderMap'))

interface Props {
    order: ResponseDetailOrder,
    onSuccess: () => void
}

const InfoOrderDetailBusiness = ({ order, onSuccess }: Props) => {
    return (
        <Box p={6}>
            <Heading size="lg" mb={4}>
                Chi tiết đơn hàng #{order.orderCode}
            </Heading>

            {/* =========================
           GRID LAYOUT 
      ========================= */}
            <Grid templateColumns="7fr 5fr" gap={6}>
                {/* LEFT SIDE: Sender / Receiver */}
                <VStack align="stretch" gap={6}>
                    {/* Người gửi */}
                    <Box p={4} bg="bg.muted" rounded="md">
                        <Heading size="md">Người gửi</Heading>
                        <Text><b>{order.seller.name}</b></Text>
                        <Text>{order.seller.phone}</Text>
                        <Text>{order.seller.email}</Text>
                        <Text>{order.seller.address}</Text>

                        {/* Tooltip Bưu cục */}
                        {order.shipment.pickupOffice && (
                            <Tooltip
                                showArrow
                                content={
                                    <Box>
                                        <Text><b>{order.shipment.pickupOffice.name}</b></Text>
                                        <Text>{order.shipment.pickupOffice.address}</Text>
                                    </Box>
                                }
                            >
                                <HStack mt={2} color="blue.600" cursor="pointer">
                                    <LuMapPin />
                                    <Text fontSize="sm">Bưu cục nhận hàng</Text>
                                </HStack>
                            </Tooltip>
                        )}
                    </Box>

                    {/* Người nhận */}
                    <Box p={4} bg="bg.muted" rounded="md">
                        <Heading size="md">Người nhận</Heading>
                        <Text><b>{order.customer.name}</b></Text>
                        <Text>{order.customer.phone}</Text>
                        <Text>{order.customer.email}</Text>
                        <Text>{order.customer.address}</Text>

                        {order.shipment.deliveryOffice && (
                            <Tooltip
                                showArrow
                                content={
                                    <Box>
                                        <Text><b>{order.shipment.deliveryOffice.name}</b></Text>
                                        <Text>{order.shipment.deliveryOffice.address}</Text>
                                    </Box>
                                }
                            >
                                <HStack mt={2} color="green.600" cursor="pointer">
                                    <LuMapPin />
                                    <Text fontSize="sm">Bưu cục giao hàng</Text>
                                </HStack>
                            </Tooltip>
                        )}
                    </Box>
                </VStack>

                {/* RIGHT SIDE: Map */}
                <Box >
                    <TrackingOrderMap order={order} />
                </Box>
            </Grid>

            {/* =========================
             ORDER BASIC INFO
      ========================= */}
            <Box mt={8} p={5} bg="bg.muted" rounded="md" divideY={'1px'}>
                <Heading size="md">Thông tin đơn hàng</Heading>
                <Box mt={5}>
                    <HStack justify="space-between">
                        <Text>Mã đơn hàng:</Text>
                        <Badge>{order.orderCode}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                        <Text>Trạng thái:</Text>
                        <Badge colorPalette={order.status === "pending" ? "orange" : order.status === "cancelled" ? "red" : order.status === "delivered" ? "green" : "cyan"}>
                            {order.status === "pending" ? "Đang xử lý" : order.status === "cancelled" ? "Đã hủy" : order.status === "delivered" ? "Giao thành công" : "Đang vận chuyển"}
                        </Badge>
                    </HStack>

                    <HStack justify="space-between">
                        <Text>COD:</Text>
                        <Text>{order.amountCod.toLocaleString('vi-VN', {style: "currency", currency: 'VND'})}</Text>
                    </HStack>

                    <HStack justify="space-between">
                        <Text>Phí ship:</Text>
                        <Text>{order.shipFee.toLocaleString('vi-VN', {style: "currency", currency: 'VND'})}</Text>
                    </HStack>

                    <HStack justify="space-between">
                        <Text>Ngày tạo:</Text>
                        <Text>{formatDateVN(order.createdAt)}</Text>
                    </HStack>
                </Box>
            </Box>

            {/* =========================
             TRACKING TIMELINE
      ========================= */}
            <Box mt={8} p={5} bg="bg.muted" rounded="md">
                <Heading size="md" mb={3}>Hành trình vận chuyển</Heading>

                <TimelineShipment order={order} />
            </Box>
        </Box>
    )
}

export default InfoOrderDetailBusiness