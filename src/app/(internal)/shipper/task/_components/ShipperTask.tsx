'use client'
import { Box, createListCollection, HStack, Portal, Select } from '@chakra-ui/react';
import React, { useState } from 'react'


const tasksOrder = createListCollection({
    items: [
        { label: "Lấy hàng", value: "pickup" },
        { label: "Giao hàng", value: "delivery" },
    ],
});

const ShipperTask = () => {
    const [page, setPage] = useState(1);
    const [task, setTask] = useState<string[]>(["pickup"]);


    return (
        <Box my={6}>
            <HStack mb={4} flexWrap={'wrap'}>
                <Select.Root
                    value={task}
                    onValueChange={(e) => {
                        setTask(e.value);
                        setPage(1);
                    }}
                    size={'sm'}
                    collection={tasksOrder}
                >
                    <Select.HiddenSelect />
                    <Select.Control>
                        <Select.Trigger>
                            <Select.ValueText placeholder="Tất cả" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.Indicator />
                        </Select.IndicatorGroup>
                    </Select.Control>

                    <Portal>
                        <Select.Positioner>
                            <Select.Content>
                                {tasksOrder.items.map((s) => (
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
        </Box>
    )
}

export default ShipperTask