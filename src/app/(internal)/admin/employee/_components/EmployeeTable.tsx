'use client'

import { Box, createListCollection, HStack, Portal, Select } from '@chakra-ui/react'
import React from 'react'
import DialogFormEmployee from './DialogFormEmployee'


const types = createListCollection({
    items: [
        { label: "Trung tâm phân loại hàng", value: "sorting_center" },
        { label: "Kho trung chuyển", value: "distribution_hub" },
        { label: "Bưu cục giao hàng", value: "delivery_office" }
    ]
})

const EmployeeTable = () => {
    return (
        <Box my={4}>
            <HStack mb={4} gap={5} justify={'space-between'}>
                <Select.Root
                    // value={value}
                    // onValueChange={(e) => {
                    //     setValue(e.value)
                    //     setPage(1); // reset page
                    //     mutate();  // refresh
                    // }}
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
                <DialogFormEmployee />

            </HStack>
        </Box>
    )
}

export default EmployeeTable