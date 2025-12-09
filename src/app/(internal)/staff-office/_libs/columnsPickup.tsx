"use client";

import { Tooltip } from "@/components/ui/tooltip";
import {
    Status,
    HStack,
    Box,
    Checkbox,
    Badge,
    Heading,
    Span,
    Text,
    Button
} from "@chakra-ui/react";

import { createColumnHelper } from "@tanstack/react-table";
import { IPickupOrder } from "../_hooks/usePickupOrder";
import LinkCustom from "@/components/ui/LinkCustom";
import { formatDateVN } from "@/utils/formatDateVN";
import TimelineRouteFull from "@/components/ui/TimelineRouteFull";
import { RiTimelineView } from "react-icons/ri";
import { ToggleTip } from "@/components/ui/toggleTooltip";
import { ShipmentEventType } from "@/components/ui/TimeLineShipment";

export const getShipmentStatus = (status: ShipmentEventType) => {
    switch (status) {
        case "created":
            return { label: "Đã tạo đơn", color: "gray" };
        case "waiting_pickup":
            return { label: "Chờ lấy hàng", color: "purple" };
        case "pickup":
            return { label: "Đã lấy hàng", color: "cyan" };
        case "arrival":
            return { label: "Đã nhập kho", color: "blue" };
        case "departure":
            return { label: "Đã xuất kho", color: "teal" };
        case "waiting_delivery":
            return { label: "Đang giao hàng", color: "cyan.600" }
        case "delivery_attempt":
            return { label: "Giao thất bại", color: "yellow" };
        case "delivered":
            return { label: "Giao thành công", color: "green" };
        case "returned":
            return { label: "Chuyển hoàn", color: "yellow" };
        case "cancelled":
            return { label: "Đã hủy", color: "red" };
        case "lost":
            return { label: "Thất lạc", color: "red" };
        case "damaged":
            return { label: "Hư hỏng", color: "red" };
        default:
            return { label: "Không xác định", color: "gray" };
    }
};

const columnHelper = createColumnHelper<IPickupOrder>();

export const PickupColumns = (
    selected: Record<string, boolean>,
    toggleOne: (id: string, v: boolean) => void
) => [
        // ====================================
        // CHECKBOX
        // ====================================
        columnHelper.display({
            id: "select",
            header: ({ table }) => {
                const rows = table.getRowModel().rows;
                const empty = rows.length === 0;

                const all = rows.every(r => selected[r.original._id]);
                const some = rows.some(r => selected[r.original._id]);

                const checkedState = empty ? false : all ? true : some ? "indeterminate" : false;

                return (
                    <Checkbox.Root
                        checked={checkedState}
                        onCheckedChange={e => {
                            rows.forEach(r => toggleOne(r.original._id, !!e.checked));
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
                    onCheckedChange={e => toggleOne(row.original._id, !!e.checked)}
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
        columnHelper.display({
            id: 'orderCode',
            header: "Mã đơn hàng",
            cell: info => {
                const code = info.row.original.orderCode;
                const order = info.row.original
                return (
                    <HStack>
                        <LinkCustom
                            href={`#`}
                            color={"orange.600"}
                            _hover={{ textDecoration: "underline" }}

                        >
                            {code}
                        </LinkCustom>
                        <ToggleTip
                            showArrow
                            content={
                                <Box
                                    p={3}
                                    shadow="md"
                                    overflowY="auto"
                                    width={{ base: '100%', md: '1000px' }}
                                >
                                    <TimelineRouteFull order={order} />
                                </Box>
                            }
                        >
                            <Button size="xs" variant="ghost">
                                <RiTimelineView color="teal" />
                            </Button>
                        </ToggleTip>
                    </HStack>
                );
            },
            meta: {
                sticky: "start",
                left: "48px",
                bg: "bg.muted",
                width: "120px",
            },
        }),

        // ====================================
        // TRACKING CODE
        // ====================================
        columnHelper.accessor("trackingCode", {
            header: "Mã vận đơn",
            cell: info => {
                const trackingCode = info.getValue() || "—"
                return (
                    <Text>
                        {trackingCode}
                    </Text>
                )
            },

        }),

        // ====================================
        // NGƯỜI GỬI
        // ====================================
        columnHelper.display({
            id: "sender",
            header: "Người gửi",
            cell: ({ row }) => {
                const sender = row.original.sender;
                if (!sender) return "—";

                return (
                    <Box fontWeight="600" textAlign={'center'}>
                        {sender.name} <br />
                        <Span color={'gray'}>
                            {sender.phone}
                        </Span>
                    </Box>
                );
            },
        }),

        // ====================================
        // NGƯỜI NHẬN
        // ====================================
        columnHelper.display({
            id: "receiver",
            header: "Người nhận",
            cell: ({ row }) => {
                const rc = row.original.receiver;
                if (!rc) return "—";

                return (
                    <Box fontWeight="600" textAlign={'center'}>
                        {rc.name} <br />
                        <Span color={'gray'}>
                            {rc.phone}
                        </Span>
                    </Box>
                );
            },
        }),

        // ====================================
        // ĐỊA CHỈ NHẬN
        // ====================================
        columnHelper.accessor("receiverAddress", {
            header: "Địa chỉ nhận",
            cell: info => {
                const receiverAddress = info.getValue() || "—"
                return (
                    <Tooltip showArrow content={receiverAddress}>
                        <Box maxW={'200px'} display={'inline-block'}>
                            <Text truncate>
                                {receiverAddress}
                            </Text>
                        </Box>
                    </Tooltip>
                )
            }
        }),

        // ====================================
        // WEIGHT
        // ====================================
        columnHelper.accessor("weight", {
            header: "Trọng lượng",
            cell: info => <b>{info.getValue()} KG</b>,
        }),

        // ====================================
        // SHIP FEE
        // ====================================
        columnHelper.accessor("shipFee", {
            header: "Phí ship",
            cell: info => <b>{info.getValue().toLocaleString("vi-VN")} đ</b>,
        }),

        // ====================================
        // STATUS
        // ====================================
        columnHelper.accessor("currentType", {
            header: "Trạng thái",
            cell: info => {
                const currentType = info.getValue();
                const { label, color } = getShipmentStatus(currentType);

                return (
                    <Badge colorPalette={color}>
                        {label}
                    </Badge>
                );
            },
        }),

        // ====================================
        // PRINTED
        // ====================================
        // columnHelper.accessor("printed", {
        //     header: "In nhãn",
        //     cell: info => {
        //         const printed = info.getValue()
        //         const color = printed ? "green" : "red"

        //         return (
        //             <Status.Root size={'sm'} colorPalette={color}>
        //                 <Status.Indicator />
        //                 {printed ? "Đã in" : "Chưa in"}
        //             </Status.Root>
        //         )
        //     },
        // }),

        // ====================================
        // HÌNH THỨC LẤY HÀNG
        // home_pickup | dropoff
        // ====================================
        columnHelper.accessor("pick", {
            header: "Lấy hàng",
            cell: info =>
                info.getValue() === "pick_home" ? "Shipper lấy" : "Gửi tại bưu cục",
        }),

        columnHelper.display({
            id: "createdAt",
            header: "Ngày tạo",
            cell: ({ row }) => {
                const createdAt = row.original.createdAt;
                if (!createdAt) return "—";

                return (
                    <Box fontWeight="600" textAlign={'center'}>
                        <Span color={'gray'}>
                            {formatDateVN(createdAt)}
                        </Span>
                    </Box>
                );
            },
        }),
    ];
