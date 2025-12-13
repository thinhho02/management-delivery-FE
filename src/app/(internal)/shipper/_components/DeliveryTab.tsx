'use client'

import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import React, { useState } from 'react'
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import OrderCard from './OrderCard';
import { IShipper } from '../_provider/ShipperInfoProvider';
import ScanShipper from './ScanShipper';

export interface DeliveryOrder {
    _id: string;
    trackingCode: string;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;

    productsName: string;
    totalWeight: number;
    note?: string;
    codAmount: number;

    status: "waiting_delivery" | "delivery_attempt" | "delivered";
}

const DeliveryTab = ({ typeShip, shipper }: { typeShip: "pickup" | "delivered", shipper: IShipper }) => {

    const [date, setDate] = useState<Date>(new Date());

    const orders: DeliveryOrder[] = [
        {
            _id: "1",
            trackingCode: "TK123456",
            receiverName: "Nguyễn Văn A",
            receiverPhone: "0988888802",
            receiverAddress: "123 Lê Lợi, Q1, HCM",
            productsName: "Áo thun, Quần jean",
            totalWeight: 1.5,
            note: "Giao giờ HC",
            codAmount: 350000,
            status: "waiting_delivery"
        }
    ];

    const totalOrders = orders.length;
    return (
        <Box p={3}>
            {/* HEADER */}
            <VStack align="start" mb={3}>
                {typeShip === "pickup" && <ScanShipper type="pickup" shipperId={shipper._id} />}
                {typeShip === "delivered" && <ScanShipper type="delivered" shipperId={shipper._id} />}

                {/* <HStack justify="space-between" w="full">
                    <HStack>
                        <Text fontSize="sm">Ngày:</Text>
                        <DatePicker
                            selected={date}
                            onChange={(d) => d && setDate(d)}
                            dateFormat="dd/MM/yyyy"
                            className="datepicker"
                        />
                    </HStack>

                    <Badge colorScheme="blue">
                        {totalOrders} đơn
                    </Badge>
                </HStack> */}
            </VStack>

            {/* LIST */}
            {/* <VStack>
                {orders.map((order) => (
                    <OrderCard key={order._id} order={order} />
                ))}
            </VStack> */}
        </Box>
    )
}

export default DeliveryTab