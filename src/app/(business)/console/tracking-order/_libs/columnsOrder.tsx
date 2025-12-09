"use client";

import { Tooltip } from "@/components/ui/tooltip";
import LinkCustom from "@/components/ui/LinkCustom";
import {
    Status,
    HStack,
    Box,
    Checkbox,
    Badge,
    Text
} from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { IOrder } from "../_hooks/useBusinessOrders";



const columnHelper = createColumnHelper<IOrder>();

export const OrderColumns = (selected: Record<string, boolean>, toggleOne: (id: string, v: boolean) => void) => [
    columnHelper.display({
        id: "select",
        header: ({ table }) => {
            const rows = table.getRowModel().rows;
            const isEmpty = rows.length === 0;
            const all = rows.every((r) => selected[r.original._id]);
            const some = rows.some((r) => selected[r.original._id]);
            let checkedState: (boolean | "indeterminate") | undefined

            if (isEmpty) {
                checkedState = false;
            } else {
                checkedState = all ? true : some ? "indeterminate" : false;
            }
            return (
                <Checkbox.Root
                    checked={checkedState}
                    onCheckedChange={(e) => {
                        table.getRowModel().rows.forEach((r) => {
                            toggleOne(r.original._id, !!e.checked);
                        });
                    }}
                >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                </Checkbox.Root>
            );
        },
        cell: ({ row }) => (
            <Checkbox.Root
                checked={!!selected[row.original._id]}
                onCheckedChange={(e) => toggleOne(row.original._id, !!e.checked)}
            >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
            </Checkbox.Root>
        ),
        meta: {
            sticky: "start",
            left: "0px",
            width: "48px",
            bg: "bg.muted",
        },
    }),
    // 🧾 Mã đơn hàng
    columnHelper.accessor("orderCode", {
        header: "Mã đơn hàng",
        cell: info => {
            const code = info.getValue();
            return (
                <LinkCustom
                    href={`/console/${info.row.original._id}`}
                    color={"orange.600"}
                    _hover={{ textDecoration: "underline" }}
                >
                    {code}
                </LinkCustom>
            );
        },
        meta: {
            sticky: "start",
            left: "48px",
            bg: "bg.muted",
            width: "120px",
        },
    }),

    // 📦 Mã vận đơn
    columnHelper.accessor("trackingCode", {
        header: "Mã vận đơn",
        cell: info => info.getValue() || "—",
    }),

    columnHelper.accessor("customer", {
        header: "Người nhận",
        cell: ({ row }) => {
            const customer = row.original.customer;
            if (!customer) return "—";
            const tooltip = (
                <>
                    <b>{customer.name}</b> <br />
                    Số điện thoại: {customer.phone} <br />
                    Địa chỉ: {customer.address}
                </>
            );

            return (
                <Tooltip content={tooltip} showArrow>
                    <Box color="blue.600" cursor="pointer">{customer.name}</Box>
                </Tooltip>
            );
        }
    }),

    // 🏣 Bưu cục nhận
    columnHelper.display({
        id: "pickupOffice",
        header: "Bưu cục nhận",
        cell: ({ row }) => {
            const o = row.original.pickupOffice;
            if (!o) return "—";

            const tooltip = (
                <>
                    <b>{o.name}</b> <br />
                    Mã: {o.code} <br />
                    Địa chỉ: {o.address}
                </>
            );

            return (
                <Tooltip content={tooltip} showArrow>
                    <Box color="blue.600" cursor="pointer">{o.name}</Box>
                </Tooltip>
            );
        },
    }),

    // 🚚 Bưu cục giao
    columnHelper.display({
        id: "deliveryOffice",
        header: "Bưu cục giao",
        cell: ({ row }) => {
            const o = row.original.deliveryOffice;
            if (!o) return "—";

            const tooltip = (
                <>
                    <b>{o.name}</b> <br />
                    Mã: {o.code} <br />
                    Địa chỉ: {o.address}
                </>
            );

            return (
                <Tooltip content={tooltip} showArrow>
                    <Box color="blue.600" cursor="pointer">{o.name}</Box>
                </Tooltip>
            );
        },
    }),

    // 💰 Phí ship
    columnHelper.accessor("shipFee", {
        header: "Phí ship",
        cell: info => (
            <b>{info.getValue().toLocaleString("vi-VN")} đ</b>
        ),
    }),

    columnHelper.accessor("pick", {
        header: "Lấy hàng",
        cell: info =>
            info.getValue() === "pick_home" ? "Shipper lấy" : "Gửi tại bưu cục",
    }),

    columnHelper.display({
        id: "shipperPickup",
        header: "Shipper lấy hàng",
        cell: ({ row }) => {
            const events = row.original.events;
            const shipperPick = events.find(e => e.eventType === "waiting_pickup")
            if (!shipperPick) return "—";
            const tooltip = (
                <>
                    <b>{shipperPick.shipperDetailId.employeeId.name}</b> <br />
                    Số điện thoại: {shipperPick.shipperDetailId.employeeId.phone} <br />
                </>
            );

            return (
                <Tooltip content={tooltip} showArrow>
                    <Box cursor="pointer" maxW={'170px'}>
                        <Text truncate>
                            {shipperPick.shipperDetailId.employeeId.name}
                        </Text>
                    </Box>
                </Tooltip>
            );
        }
    }),

    columnHelper.display({
        id: "shipperDelivery",
        header: "Shipper giao hàng",
        cell: ({ row }) => {
            const events = row.original.events;
            const shipperDelivery = events.find(e => e.eventType === "waiting_delivery")
            if (!shipperDelivery) return "—";
            const tooltip = (
                <>
                    <b>{shipperDelivery.shipperDetailId.employeeId.name}</b> <br />
                    Số điện thoại: {shipperDelivery.shipperDetailId.employeeId.phone} <br />
                </>
            );

            return (
                <Tooltip content={tooltip} showArrow>
                    <Box cursor="pointer" maxW={'170px'}>
                        <Text truncate>
                            {shipperDelivery.shipperDetailId.employeeId.name}
                        </Text>
                    </Box>
                </Tooltip>
            );
        }
    }),

    // 📌 Trạng thái đơn hàng
    columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: info => {
            const status = info.getValue();
            const color =
                status === "pending" ? "yellow" :
                    status === "in_transit" ? "blue" :
                        status === "delivered" ? "green" : "red";

            return (
                <Badge colorPalette={color}>
                    {status === "pending"
                        ? "Chờ xử lý"
                        : status === "in_transit"
                            ? "Đang giao"
                            : status === "delivered"
                                ? "Đã giao"
                                : "Đã huỷ"}
                </Badge>
            );
        },
    }),

    // 🖨 Trạng thái in
    columnHelper.accessor("printed", {
        header: "In nhãn",
        cell: info => {
            const printed = info.getValue()
            const color = printed ? "green" : "red"

            return (
                <Status.Root size={'sm'} colorPalette={color}>
                    <Status.Indicator />
                    {printed ? "Đã in" : "Chưa in"}
                </Status.Root>
            )
        },
    }),
];
