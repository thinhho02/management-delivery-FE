'use client'

import { Tabs } from '@chakra-ui/react'
import React from 'react'
import DeliveryTab from './DeliveryTab'
import { useShipperInfo } from '../_provider/ShipperInfoProvider'

const MainPageShipper = () => {
    const { shipper } = useShipperInfo()
    return (
        <Tabs.Root
            lazyMount
            unmountOnExit
            defaultValue="pickup"
            variant="plain"
            css={{
                "--tabs-indicator-bg": "colors.gray.subtle",
                "--tabs-indicator-shadow": "shadows.xs",
                "--tabs-trigger-radius": "radii.full",
            }}
        >
            <Tabs.List>
                <Tabs.Trigger value="pickup">Lấy hàng</Tabs.Trigger>
                <Tabs.Trigger value="delivered">Giao hàng</Tabs.Trigger>
                <Tabs.Indicator />
            </Tabs.List>

            <Tabs.Content value="pickup">
                <DeliveryTab typeShip='pickup' shipper={shipper} />
            </Tabs.Content>
            <Tabs.Content value="delivered">
                <DeliveryTab typeShip='delivered' shipper={shipper} />
            </Tabs.Content>

        </Tabs.Root>
    )
}

export default MainPageShipper