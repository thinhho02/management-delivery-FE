"use client";

import {
    Box,
    Table,
    Spinner,
    Center,
    HStack,
    Pagination,
    ButtonGroup,
    IconButton,
    ActionBar,
    Portal,
    Button,
    createListCollection,
    Select,
    useFilter,
    Input
} from "@chakra-ui/react";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    SortingState,
} from "@tanstack/react-table";

import { LuChevronLeft, LuChevronRight, LuSquarePlus, LuTrash2 } from "react-icons/lu";

import { Tooltip } from "@/components/ui/tooltip";
import { toaster } from "@/components/ui/toaster";
import { create, update } from "@/apis/apiCore";
import { PickupColumns } from "../_libs/columnsPickup";
import { IPickupOrder, usePickupOrders } from "../_hooks/usePickupOrder";
import ScanDialog from "./ScanDialog";
import { DeliveryColumns } from "../_libs/columnsDelivery";
import { IPostOffice } from "../_providers/PostInfoProvider";
import { useSocketInternal } from "../../_providers/SocketProviderInternal";


// ================================
// ENUM STATUS PICKUP
// ================================
const statusOptions = createListCollection({
    items: [
        { label: "Đã tạo đơn", value: "created" },
        { label: "Chờ lấy hàng", value: "waiting_pickup" },
        { label: "Đã lấy hàng", value: "pickup" },
        { label: "Đã nhập kho", value: "arrival" },
        { label: "Đã xuất kho", value: "departure" },
        { label: "Đang chuyển tiếp", value: "transferring" },
        { label: "Đang giao hàng", value: "waiting_delivery" },
        { label: "Giao thất bại", value: "delivery_attempt" },
        { label: "Giao thành công", value: "delivered" },
        { label: "Chuyển hoàn", value: "returned" },
        { label: "Đã hủy", value: "cancelled" },
        { label: "Thất lạc", value: "lost" },
        { label: "Hư hỏng", value: "damaged" },
    ]
});

const pickOptions = createListCollection({
    items: [
        { label: "Shipper lấy hàng", value: "pick_home" },
        { label: "Gửi tại bưu cục", value: "pick_post" },
    ],
});

export default function PickupOrderTable({ typeOffice, postInfo }: { typeOffice: "inbound" | "outbound", postInfo: IPostOffice }) {
    const [page, setPage] = useState(1);
    const [valueStatus, setValueStatus] = useState<string[]>([]);
    const [valuePick, setValuePick] = useState<string[]>([]);

    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [searchText, setSearchText] = useState("");
    const [isPending, startTransitrion] = useTransition();

    const [sorting, setSorting] = useState<SortingState>([]);
    const { socket, isConnected } = useSocketInternal()

    const { contains } = useFilter({ sensitivity: "base" });
    // ================================
    // FETCH API
    // ================================
    const { data, pagination, loading, mutate, postId } = usePickupOrders({
        typeOffice,
        page,
        status: valueStatus[0],
        pick: valuePick[0],
        postInfo
    });

    useEffect(() => {
        if (!isConnected) return;
        const updateOrder = (payload: IPickupOrder) => {
            mutate(prev => {
                if (!prev?.success) return prev;

                const updatedRows = prev.result.orders.map(o => {

                    return o._id == payload._id ? { ...o, ...payload } : o;
                });

                return {
                    ...prev,
                    result: {
                        ...prev.result,
                        orders: updatedRows
                    }
                };
            }, false);
        }

        socket.on("order:update", updateOrder)

        return () => {
            socket.off("order:update", updateOrder)
        }
    }, [isConnected])

    // Reset checkbox khi thay đổi filter
    useEffect(() => {
        setSelected({});
    }, [valueStatus, valuePick, page]);

    const toggleOne = useCallback((id: string, v: boolean) => {
        setSelected((cur) => ({ ...cur, [id]: v }));
    }, []);

    const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);
    const someSelected = selectedCount > 0;

    const columns = useMemo(
        () => {
            if (typeOffice === "inbound") {
                return PickupColumns(selected, toggleOne)
            } else {
                return DeliveryColumns(selected, toggleOne)
            }
        },
        [selected, toggleOne, typeOffice]
    );

    const tableData = useMemo(() => {
        if (!data) return [];
        if (!searchText.trim()) return data;
        const lower = searchText.toLowerCase();

        return data.filter((item) => {
            return (
                contains(item.trackingCode ?? "", lower)
            );
        });
    }, [data, searchText]);

    const table = useReactTable({
        data: tableData,
        columns,
        state: { sorting },
        getCoreRowModel: getCoreRowModel(),
    });

    // ================================
    // HANDLE PRINT BULK
    // ================================
    const handlePrintBulk = (selectedOrders: any[], canPrint: boolean) => {
        if (!canPrint) return;

        // startPrint(async () => {
        //     const ids = selectedOrders.map((o) => o._id);

        //     const res = await create<any>(
        //         `/order/print-bulk`,
        //         { orderIds: ids, size: "A6" },
        //         { responseType: "blob" }
        //     );

        //     if (!res.success) {
        //         return toaster.error({
        //             id: "print-error",
        //             title: "In thất bại",
        //             description: res.error,
        //         });
        //     }

        //     const url = URL.createObjectURL(res.result);

        //     window.open(url, "_blank");

        //     mutate();
        // });
    };

    // ================================
    // HANDLE CANCEL
    // ================================
    const handleArrangeTransport = (selectedOrders: any[]) => {
        startTransitrion(async () => {
            const ids = selectedOrders.map((o) => o._id);

            const res = await update<any>("/order/pickup-office/arrange-transport", { orderIds: ids });

            if (!res.success) {
                toaster.error({
                    id: `Arrange-${Date.now()}`,
                    title: "Sắp xếp vận chuyển thất bại",
                    description: res.error
                });
                return;
            }

            const { arranged, failed } = res.result;
            if (failed.length > 0) {
                const reason = failed.map((f: any) => f.reason)
                toaster.error({
                    id: `Arrange-${Date.now()}`,
                    title: "Sắp xếp vận chuyển thất bại",
                    description: reason.join(", ")
                });
                return;
            }
            // ================================
            // UPDATE LOCAL SWR CACHE
            // ================================
            mutate(prev => {
                if (!prev?.success) return prev;

                const updatedRows = prev.result.orders.map(o => {
                    const updated = arranged.find((x: any) => x._id === o._id);
                    return updated ? { ...o, ...updated } : o;
                });

                return {
                    ...prev,
                    result: {
                        ...prev.result,
                        orders: updatedRows
                    }
                };
            }, false);

            setSelected({});


            toaster.success({
                id: `Arrange-${Date.now()}`,
                title: "Sắp xếp vận chuyển thành công"
            });

        });
    };

    return (
        <Box my={6}>
            {/* ============================================
                FILTER BAR
            ============================================= */}
            <HStack mb={4} justify={postInfo.type === "delivery_office" ? 'space-between' : "end"} flexWrap={'wrap'}>
                {/* status */}
                {postInfo.type === "delivery_office" && (
                    <HStack gap={5} w={'md'}>
                        <Select.Root
                            value={valueStatus}
                            onValueChange={(e) => {
                                setValueStatus(e.value);
                                setPage(1);
                            }}
                            size={'sm'}
                            collection={statusOptions}
                        >
                            <Select.HiddenSelect />
                            <Select.Control>
                                <Select.Trigger>
                                    <Select.ValueText placeholder="Trạng thái đơn" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.ClearTrigger />
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>

                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {statusOptions.items.map((s) => (
                                            <Select.Item key={s.value} item={s}>
                                                {s.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>

                        {/* pick option */}
                        <Select.Root
                            value={valuePick}
                            onValueChange={(e) => {
                                setValuePick(e.value);
                                setPage(1);
                            }}
                            collection={pickOptions}
                            size={'sm'}
                        >
                            <Select.HiddenSelect />
                            <Select.Control>
                                <Select.Trigger>
                                    <Select.ValueText placeholder="Hình thức lấy hàng" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.ClearTrigger />
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>

                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {pickOptions.items.map((s) => (
                                            <Select.Item key={s.value} item={s}>
                                                {s.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                    </HStack>
                )}
                <HStack gap={5} w={'md'} justify={'end'}>
                    {typeOffice === "inbound" && <ScanDialog mutate={mutate} type="arrival" officeId={postId} />}
                    {typeOffice === "outbound" && <ScanDialog mutate={mutate} type="departure" officeId={postId} />}

                </HStack>
            </HStack>

            <Box>
                <Input
                    placeholder="Nhập mã vận đơn"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    w="300px"
                    mb={4}
                />
            </Box>

            {/* ============================================
                TABLE
            ============================================= */}
            <Table.ScrollArea borderWidth="1px">
                <Table.Root
                    variant="outline"
                    size="sm"
                    native
                    interactive
                    textStyle={'xs'}
                    css={{
                        "& [data-sticky]": {
                            position: "sticky",
                            zIndex: 1,


                        },
                    }}
                >
                    <Table.Header>
                        {table.getHeaderGroups().map((hg) => (
                            <Table.Row key={hg.id}>
                                {hg.headers.map((header) => (
                                    <Table.ColumnHeader
                                        key={header.id}
                                        data-sticky={(header.column.columnDef.meta as any)?.sticky}
                                        left={(header.column.columnDef.meta as any)?.left}
                                        css={{
                                            bg: (header.column.columnDef.meta as any)?.bg,
                                            minWidth: (header.column.columnDef.meta as any)?.width,
                                            textAlign: header.column.id !== 'orderCode' ? "center" : undefined
                                        }}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </Table.ColumnHeader>
                                ))}
                            </Table.Row>
                        ))}
                    </Table.Header>

                    <Table.Body>
                        {loading ? (
                            <Table.Row>
                                <Table.Cell colSpan={columns.length}>
                                    <Center py={4}>
                                        <Spinner size="sm" />
                                    </Center>
                                </Table.Cell>
                            </Table.Row>
                        ) : data && data.length === 0 ? (
                            <Table.Row>
                                <Table.Cell colSpan={columns.length} textAlign="center">
                                    Không có dữ liệu
                                </Table.Cell>
                            </Table.Row>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <Table.Row key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <Table.Cell
                                            key={cell.id}
                                            textAlign={cell.column.id !== 'orderCode' ? "center" : undefined}
                                            data-sticky={(cell.column.columnDef.meta as any)?.sticky}
                                            left={(cell.column.columnDef.meta as any)?.left}
                                            css={{
                                                bg: (cell.column.columnDef.meta as any)?.bg,
                                                minWidth: (cell.column.columnDef.meta as any)?.width,
                                            }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </Table.Cell>
                                    ))}
                                </Table.Row>
                            ))
                        )}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>

            {/* ============================================
                PAGINATION
            ============================================= */}
            <HStack justify="center" mt={4}>
                <Pagination.Root
                    page={page}
                    count={pagination?.totalPages || 1}
                    pageSize={1}
                    onPageChange={(e) => setPage(e.page)}
                >
                    <ButtonGroup variant="ghost" size="sm">
                        <Pagination.PrevTrigger asChild>
                            <IconButton>
                                <LuChevronLeft />
                            </IconButton>
                        </Pagination.PrevTrigger>

                        <Pagination.Items
                            render={(item) => (
                                <IconButton key={item.value} variant={{ base: "ghost", _selected: "outline" }}>
                                    {item.value}
                                </IconButton>
                            )}
                        />

                        <Pagination.NextTrigger asChild>
                            <IconButton>
                                <LuChevronRight />
                            </IconButton>
                        </Pagination.NextTrigger>
                    </ButtonGroup>
                </Pagination.Root>
            </HStack>

            {/* ============================================
                ACTION BAR
            ============================================= */}
            <ActionBar.Root open={someSelected}>
                <Portal>
                    <ActionBar.Positioner>
                        <ActionBar.Content bgColor="gray.subtle">
                            <ActionBar.SelectionTrigger>
                                {selectedCount} đơn đã chọn
                            </ActionBar.SelectionTrigger>

                            <ActionBar.Separator />

                            {/* ---- Sắp xếp vận chuyển ---- */}
                            {(() => {
                                if (!data) return null;

                                const selectedOrders = data.filter(o => selected[o._id]);

                                const canArrange = selectedOrders.length > 0 &&
                                    selectedOrders.every(o => o.status === "pending") && selectedOrders.every(o => o.pick === "pick_home")

                                const arrangeTooltip = canArrange
                                    ? "Sắp xếp vận chuyển cho các đơn hàng đã chọn"
                                    : "Không thể sắp xếp vì có đơn hàng không ở trạng thái 'Đang xử lý' hoặc hình thức lấy hàng không phải shipper lấy";

                                return (
                                    <Tooltip content={arrangeTooltip}>
                                        <Button
                                            size="sm"
                                            variant="solid"
                                            bgColor="blue.600"
                                            _hover={{ bgColor: "blue.500" }}
                                            loading={isPending}
                                            disabled={!canArrange}
                                            onClick={() => {
                                                if (!canArrange) return;
                                                handleArrangeTransport(selectedOrders);
                                            }}
                                        >
                                            Sắp xếp vận chuyển
                                        </Button>
                                    </Tooltip>
                                );
                            })()}

                        </ActionBar.Content>
                    </ActionBar.Positioner>
                </Portal>
            </ActionBar.Root>
        </Box>
    );
}
