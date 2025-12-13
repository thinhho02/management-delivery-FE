'use client'

import { Box, Center, Spinner, Tabs } from '@chakra-ui/react'
import React from 'react'
import PickupOrderTable from './PickupOrderTable'
import { usePostInfo } from '../_providers/PostInfoProvider'

const MainPage = () => {
    const { post: postInfo } = usePostInfo()

    return (
        <Tabs.Root
            lazyMount
            unmountOnExit
            defaultValue="inbound"
            variant="plain"
            css={{
                "--tabs-indicator-bg": "colors.gray.subtle",
                "--tabs-indicator-shadow": "shadows.xs",
                "--tabs-trigger-radius": "radii.full",
            }}
        >
            <Tabs.List>
                <Tabs.Trigger value="inbound">Đơn hàng nhận</Tabs.Trigger>
                <Tabs.Trigger value="outbound">Đơn hàng giao</Tabs.Trigger>
                <Tabs.Indicator />
            </Tabs.List>

            <Tabs.Content value="inbound">
                <PickupOrderTable typeOffice='inbound' postInfo={postInfo} />
            </Tabs.Content>
            <Tabs.Content value="outbound">
                <PickupOrderTable typeOffice='outbound' postInfo={postInfo} />
            </Tabs.Content>

        </Tabs.Root>
    )
}

export default MainPage