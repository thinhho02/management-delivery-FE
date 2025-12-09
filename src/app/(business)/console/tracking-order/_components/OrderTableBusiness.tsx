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
    Dialog,
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

import { IOrder, useBusinessOrders } from "../_hooks/useBusinessOrders";
import { OrderColumns } from "../_libs/columnsOrder";
import { Tooltip } from "@/components/ui/tooltip";
import { create, update } from "@/apis/apiCore";
import { toaster } from "@/components/ui/toaster";
import { useSocketBusiness } from "@/app/(business)/_providers/SocketProviderBusiness";



export interface ISkippedOrder {
    _id: string;
    status: string;
}

export interface ICancelOrderResult {
    cancelled: string[];      // danh sách orderId đã được hủy
    skipped: ISkippedOrder[]; // danh sách order không thể hủy
}

export interface ResponseOrderCancel {
    message: string;
    result: ICancelOrderResult;
}


const types = createListCollection({
    items: [
        { label: "Đang xử lý", value: "pending" },
        { label: "Đang vận chuyển", value: "in_transit" },
        { label: "Giao thành công", value: "delivered" },
        { label: "Đã hủy", value: "cancelled" },

    ]
})

const printedOptions = createListCollection({
    items: [
        { label: "Tất cả", value: "all" },
        { label: "Đã in", value: "printed" },
        { label: "Chưa in", value: "not_printed" },
    ],
});

const pickOptions = createListCollection({
    items: [
        { label: "Shipper lấy hàng", value: "pick_home" },
        { label: "Gửi tại bưu cục", value: "pick_post" },
    ],
});


const OrderTableBusiness = () => {
    const [page, setPage] = useState(1);
    const [isPending, startTransition] = useTransition();
    const [isPendingCancel, startTransitionCancel] = useTransition();
    const [isPendingTransport, startTransitionTransport] = useTransition();
    const [valuePick, setValuePick] = useState<string[]>([]);

    const [value, setValue] = useState<string[]>([])
    const [printed, setPrinted] = useState<string[]>(["all"])
    const [searchText, setSearchText] = useState("");
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [sorting, setSorting] = useState<SortingState>([]);
    const { contains } = useFilter({ sensitivity: "base" });
    const { socket, isConnected } = useSocketBusiness()


    const { data, pagination, loading, mutate } = useBusinessOrders({ page, pick: valuePick[0], status: value[0], printed: printed[0] });

    // Clear selection khi filter / page thay đổi
    useEffect(() => {
        setSelected({});
    }, [value, printed, page]);

    useEffect(() => {
        if (!isConnected) return;
        const updateOrder = (payload: IOrder) => {
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

    const toggleOne = useCallback((id: string, v: boolean) => {
        setSelected((cur) => ({ ...cur, [id]: v }));
    }, []);

    const selectedCount = useMemo(
        () => Object.values(selected).filter(Boolean).length,
        [selected]
    );

    const someSelected = selectedCount > 0;

    const columns = useMemo(
        () => OrderColumns(selected, toggleOne),
        [selected, toggleOne]
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

    const handleArrangeTransport = (selectedOrders: any[]) => {
        startTransitionTransport(async () => {
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

            setSelected({});


            toaster.success({
                id: `Arrange-${Date.now()}`,
                title: "Sắp xếp vận chuyển thành công"
            });

        });
    };


    const handlePrintBulk = (selectedOrders: any[], canPrint: boolean) => {
        if (!canPrint) return;
        startTransition(async () => {
            const ids = selectedOrders.map((o) => o._id);
            const res = await create<any>(`/order/print-bulk`, { orderIds: ids, size: "A6" }, { responseType: 'blob' })

            if (!res.success) {
                console.log(res.error)
                toaster.error({
                    id: `Error-Print-${Date.now}`,
                    title: "In thất bại",
                    description: res.error
                })
                return;
            }

            const url = URL.createObjectURL(res.result);

            const newWindow = window.open("", "_blank");
            if (newWindow) newWindow.location.href = url;

            // 👉 Refresh lại bảng để update trạng thái printed
            mutate();
        })
    }

    const handleCancel = (selectedOrders: any[], canCancel: boolean) => {
        if (!canCancel) return;
        startTransitionCancel(async () => {
            const ids = selectedOrders.map((o) => o._id)

            const res = await create<ResponseOrderCancel>("/order/bulk-cancel", { orderIds: ids })
            if (!res.success) {
                toaster.error({
                    id: `Error-Print-${Date.now}`,
                    title: "Hủy đơn hàng thất bại",
                    description: res.error
                })
                return;
            }

            toaster.success({
                id: `Cancel-Order-${Date.now}`,
                title: res.result.message
            })

            mutate(
                (prev) => {
                    if (!prev?.success) return prev;

                    const cancelledIds = res.result.result.cancelled;

                    return {
                        ...prev,
                        result: {
                            ...prev.result,
                            orders: prev.result.orders.map((o) =>
                                cancelledIds.includes(o._id)
                                    ? { ...o, status: "cancelled" }
                                    : o
                            ),
                        },
                    };
                },
                false // không re-fetch từ backend
            );
            setSelected({})
        })
    }


    return (
        <Box my={6}>
            <HStack mb={4}>
                <Select.Root
                    value={value}
                    onValueChange={(e) => {
                        setValue(e.value)
                        setPage(1); // reset page
                    }}
                    w={'250px'}
                    size={'xs'}
                    collection={types}
                >
                    <Select.HiddenSelect />
                    <Select.Control>
                        <Select.Trigger>
                            <Select.ValueText placeholder="Chọn trạng thái đơn hàng" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.ClearTrigger />
                            <Select.Indicator />
                        </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                        <Select.Positioner>
                            <Select.Content>
                                {types.items.map((type) => (
                                    <Select.Item item={type} key={type.value}>
                                        {type.label}
                                        <Select.ItemIndicator />
                                    </Select.Item>)
                                )}
                            </Select.Content>
                        </Select.Positioner>
                    </Portal>
                </Select.Root>
                {/* select print */}
                <Select.Root
                    value={printed}
                    onValueChange={(e) => {
                        setPrinted(e.value)
                        setPage(1); // reset page
                    }}
                    w={'100px'}
                    size={'xs'}
                    collection={printedOptions}
                >
                    <Select.HiddenSelect />
                    <Select.Control>
                        <Select.Trigger>
                            <Select.ValueText placeholder="Chọn trạng thái in" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.ClearTrigger />
                            <Select.Indicator />
                        </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                        <Select.Positioner>
                            <Select.Content>
                                {printedOptions.items.map((type) => (
                                    <Select.Item item={type} key={type.value}>
                                        {type.label}
                                        <Select.ItemIndicator />
                                    </Select.Item>)
                                )}
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
                    w={'200px'}
                    size={'xs'}
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
            <Box>
                <Input
                    placeholder="Nhập mã vận đơn"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    w="300px"
                    mb={4}
                />
            </Box>
            <Table.ScrollArea borderWidth="1px">
                <Table.Root
                    variant="outline"
                    size="sm"
                    textStyle={'xs'}
                    native
                    interactive
                    css={{
                        "& [data-sticky]": {
                            position: "sticky",
                            zIndex: 1,


                        },
                    }}
                >
                    <Table.Header>
                        {table.getHeaderGroups().map(hg => (
                            <Table.Row key={hg.id}>
                                {hg.headers.map(header => (
                                    <Table.ColumnHeader
                                        key={header.id}
                                        data-sticky={(header.column.columnDef.meta as any)?.sticky ?? undefined}
                                        left={(header.column.columnDef.meta as any)?.left}
                                        css={{
                                            bg: (header.column.columnDef.meta as any)?.bg,
                                            minWidth: (header.column.columnDef.meta as any)?.width,
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
                                    <Center py={4}><Spinner size="sm" /></Center>
                                </Table.Cell>
                            </Table.Row>
                        ) : data && data.length === 0 ? (
                            <Table.Row>
                                <Table.Cell colSpan={columns.length} textAlign="center">
                                    Không có dữ liệu
                                </Table.Cell>
                            </Table.Row>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <Table.Row key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <Table.Cell
                                            key={cell.id}
                                            data-sticky={(cell.column.columnDef.meta as any)?.sticky ?? undefined}
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

            {/* PAGINATION */}
            <HStack justify="center" mt={4}>
                <Pagination.Root
                    page={page}
                    count={pagination?.totalPages || 1}
                    pageSize={1}
                    onPageChange={e => setPage(e.page)}
                >
                    <ButtonGroup variant="ghost" size="sm">
                        <Pagination.PrevTrigger asChild>
                            <IconButton><LuChevronLeft /></IconButton>
                        </Pagination.PrevTrigger>

                        <Pagination.Items render={item => (
                            <IconButton key={item.value} variant={{ base: "ghost", _selected: "outline" }}>
                                {item.value}
                            </IconButton>
                        )} />

                        <Pagination.NextTrigger asChild>
                            <IconButton><LuChevronRight /></IconButton>
                        </Pagination.NextTrigger>
                    </ButtonGroup>
                </Pagination.Root>
            </HStack>
            {/* ACTION BAR */}
            <ActionBar.Root open={someSelected}>
                <Portal>
                    <ActionBar.Positioner>
                        <ActionBar.Content bgColor={'gray.subtle'}>
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
                                            loading={isPendingTransport}
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

                            {/* ==========================
                                NÚT PRINT PDF (A6/A5)
                            =========================== */}
                            {(() => {
                                if (!data) return;
                                const selectedOrders: any[] = data.filter((o: any) => selected[o._id]);

                                // ❌ Nếu có đơn đã in → không được in lại
                                const canPrint = selectedOrders.every((o: any) => !o.printed);

                                return (
                                    <Tooltip
                                        content={
                                            canPrint
                                                ? "In nhãn đơn vận chuyển"
                                                : "Có đơn đã được in → Không thể in lại"
                                        }
                                    >
                                        <Button
                                            size="sm"
                                            variant="solid"
                                            bgColor="orange.600"
                                            _hover={{ bgColor: "orange.500" }}
                                            loading={isPending}
                                            disabled={!canPrint}
                                            onClick={() => handlePrintBulk(selectedOrders, canPrint)}
                                        >
                                            <LuSquarePlus />
                                            In PDF (A6/A5)
                                        </Button>
                                    </Tooltip>
                                );
                            })()}

                            {(() => {
                                if (!data) return;

                                const selectedOrders = data.filter((o: any) => selected[o._id]);
                                const canCancel = selectedOrders.every((o: any) => o.status === "pending");

                                return (
                                    <Tooltip
                                        content={
                                            canCancel
                                                ? "Hủy các đơn hàng đã chọn"
                                                : "Chỉ được hủy đơn khi tất cả đơn đều ở trạng thái đang xử lý"
                                        }
                                    >
                                        <Button
                                            variant="surface"
                                            colorPalette="red"
                                            size="sm"
                                            loading={isPendingCancel}
                                            disabled={!canCancel}
                                            onClick={() => {
                                                if (!canCancel) return;
                                                // xử lý API hủy hàng loạt
                                                handleCancel(selectedOrders, canCancel)
                                            }}
                                        >
                                            <LuTrash2 />
                                            Hủy đơn
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
};

export default OrderTableBusiness;
