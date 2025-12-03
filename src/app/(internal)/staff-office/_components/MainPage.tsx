'use client'

import { Tabs } from '@chakra-ui/react'
import React from 'react'
import PickupOrderTable from './PickupOrderTable'

const MainPage = () => {
    return (
        <Tabs.Root
            defaultValue="pick"
            variant="plain"
            css={{
                "--tabs-indicator-bg": "colors.gray.subtle",
                "--tabs-indicator-shadow": "shadows.xs",
                "--tabs-trigger-radius": "radii.full",
            }}
        >
            <Tabs.List>
                <Tabs.Trigger value="pick">Đơn hàng nhận</Tabs.Trigger>
                <Tabs.Trigger value="delivery">Đơn hàng giao</Tabs.Trigger>
                <Tabs.Indicator />
            </Tabs.List>
            <Tabs.Content value="pick">
                <PickupOrderTable typeOffice='pickup-office' />
            </Tabs.Content>
            <Tabs.Content value="delivery">
                <PickupOrderTable typeOffice='delivery-office' />
            </Tabs.Content>
        </Tabs.Root>
    )
}

export default MainPage