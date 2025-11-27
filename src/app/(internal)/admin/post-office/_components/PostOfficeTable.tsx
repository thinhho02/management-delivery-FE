"use client";

import {
    Box,
    HStack,
    Select,
    Table,
    Spinner,
    IconButton,
    ButtonGroup,
    Pagination,
    createListCollection,
    Portal,
    Center
} from "@chakra-ui/react";

import { useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    flexRender,
} from "@tanstack/react-table";

import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { usePostOffice } from "../_hooks/usePostOffice";
import { columns } from "../_libs/columns";
import AddNewFormPost from "./AddNewFormPost";



const types = createListCollection({
    items: [
        { label: "Trung tâm phân loại hàng", value: "sorting_center" },
        { label: "Kho trung chuyển", value: "distribution_hub" },
        { label: "Bưu cục giao hàng", value: "delivery_office" }
    ]
})

const PostOfficeTable = () => {


    const [page, setPage] = useState(1);
    const [value, setValue] = useState<string[]>(["sorting_center"])

    const { data, pagination, loading, mutate } = usePostOffice({
        type: value[0],
        page,
    });


    const [sorting, setSorting] = useState<SortingState>([]);
    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(), // Client-side sorting

    });

    const totalPages = pagination?.totalPages ?? 1;

    return (
        <Box my={4}>
            {/* FILTER */}
            <HStack mb={4} justify={'space-between'}>
                <Select.Root
                    value={value}
                    onValueChange={(e) => {
                        setValue(e.value)
                        setPage(1); // reset page
                        mutate();  // refresh
                    }}
                    w={'300px'}
                    collection={types}
                >
                    <Select.HiddenSelect />
                    <Select.Control>
                        <Select.Trigger>
                            <Select.ValueText placeholder="Chọn loại bưu cục" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
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
                <AddNewFormPost onSuccess={() => mutate()} />

            </HStack>

            {/* TABLE */}
            <Table.ScrollArea borderWidth="1px"  maxW={{ base: "xl", md: "full" }}>
                <Table.Root
                    native
                    variant="outline"
                    interactive
                    size={'sm'}
                    css={{
                        "& [data-sticky]": {
                            position: "sticky",
                            zIndex: 1,

                            _after: {
                                content: '""',
                                position: "absolute",
                                pointerEvents: "none",
                                top: "0",
                                bottom: "0",
                                width: "32px",
                            },
                        },

                        "& [data-sticky=end]": {
                            _after: {
                                insetInlineEnd: "0",
                                translate: "100% 0",
                                shadow: {
                                    _dark: "inset 8px 0px 8px -8px rgba(255, 255, 255, 0.16)",
                                    _light: "inset 8px 0px 8px -8px rgba(0, 0, 0, 0.16)"
                                },
                            },
                        },

                        "& [data-sticky=start]": {
                            _after: {
                                insetInlineStart: "0",
                                translate: "-100% 0",
                                shadow: {
                                    _dark: "inset 8px 0px 8px -8px rgba(255, 255, 255, 0.16)",
                                    _light: "inset 8px 0px 8px -8px rgba(0, 0, 0, 0.16)"
                                },
                            },
                        },
                    }}
                >
                    <Table.Header>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Table.Row key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Table.ColumnHeader
                                        key={header.id}
                                        data-sticky={header.column.id === "name" ? "end" : undefined}
                                        left={header.column.id === "name" ? "0" : undefined}
                                        css={{
                                            cursor: 'pointer',
                                            minWidth: header.column.id === "address" ? "250px" : undefined,
                                            bg: header.column.id === "name" ? "bg.muted" : undefined
                                        }}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}

                                        {/* FE sorting icons */}
                                        {{
                                            asc: " 🔼",
                                            desc: " 🔽",
                                        }[header.column.getIsSorted() as string] ?? ""}
                                    </Table.ColumnHeader>
                                ))}
                            </Table.Row>
                        ))}
                    </Table.Header>

                    <Table.Body>
                        {loading ? (
                            <Table.Row><Table.Cell colSpan={columns.length}><Center><Spinner size={'sm'} /></Center></Table.Cell></Table.Row>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <Table.Row><Table.Cell colSpan={columns.length} style={{ textAlign: 'center' }}>Không có dữ liệu</Table.Cell></Table.Row>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <Table.Row key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <Table.Cell
                                            key={cell.id}
                                            style={{
                                                ...(cell.column.columnDef.meta ?? {}),
                                            }}
                                            css={{
                                                bg: cell.column.id === "name" ? "bg" : undefined
                                            }}
                                            data-sticky={cell.column.id === "name" ? "end" : undefined}
                                            left={cell.column.id === "name" ? "0" : undefined}
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
                    count={totalPages}
                    pageSize={1}
                    onPageChange={(e) => {
                        setPage(e.page)
                    }}
                >
                    <ButtonGroup variant="ghost" size="sm">
                        <Pagination.PrevTrigger asChild>
                            <IconButton><LuChevronLeft /></IconButton>
                        </Pagination.PrevTrigger>

                        <Pagination.Items
                            render={(item) => (
                                <IconButton
                                    key={item.value}
                                    variant={{ base: "ghost", _selected: "outline" }}
                                >
                                    {item.value}
                                </IconButton>
                            )}
                        />

                        <Pagination.NextTrigger asChild>
                            <IconButton><LuChevronRight /></IconButton>
                        </Pagination.NextTrigger>
                    </ButtonGroup>
                </Pagination.Root>
            </HStack>

        </Box>
    );
};

export default PostOfficeTable;
