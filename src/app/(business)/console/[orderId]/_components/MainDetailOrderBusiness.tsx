'use client'

import { get } from '@/apis/apiCore'
import LinkCustom from '@/components/ui/LinkCustom'
import { Box, Breadcrumb, Center, Heading, HStack, Spinner } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import useSWR from 'swr'
import { ResponseDetailOrder } from '../_types/responseDetailOrder'
import { notFound } from 'next/navigation'
import InfoOrderDetailBusiness from './InfoOrderDetailBusiness'
import { useSocketBusiness } from '@/app/(business)/_providers/SocketProviderBusiness'

const MainDetailOrderBusiness = ({ orderId }: { orderId: string }) => {
    const { data, mutate, isLoading } = useSWR(`/order/business/${orderId}`, get<{ order: ResponseDetailOrder }>, { revalidateOnFocus: false })
    const { socket, emitEvent, isConnected } = useSocketBusiness()

    useEffect(() => {
        if (!data) return;

        if (!data.success) {
            notFound()
        }


    }, [data])

    useEffect(() => {
        if (!data || !isConnected) return;
        emitEvent("join:order_join", { orderId })
        const orderUpdate = (payload: ResponseDetailOrder) => {
            mutate(prev => {
                if (!prev?.success) return prev;

                return {
                    ...prev,
                    result: {
                        ...prev.result,
                        order: {
                            ...prev.result.order,
                            ...payload
                        }
                    }
                };
            }, false);
        }
        socket.on("order:update", orderUpdate)

        return () => {
            emitEvent("leave:order_join", { orderId })
            socket.off("order:update", orderUpdate)
        }
    }, [isConnected, data])



    if (!data || !data.success || isLoading) {
        return (
            <Box w={'full'}>
                <Center>
                    <Spinner size={'sm'} />
                </Center>
            </Box>
        )
    }
    const order = data.result.order
    return (
        <Box>
            <HStack mt={10} w={'full'} justify={'space-between'}>
                <Heading size={'md'} fontWeight={'medium'}>
                    <Breadcrumb.Root>
                        <Breadcrumb.List>
                            <Breadcrumb.Item>
                                <Breadcrumb.Link asChild>
                                    <LinkCustom href={'/console/tracking-order'}>
                                        Quay lại
                                    </LinkCustom>
                                </Breadcrumb.Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Separator />
                            <Breadcrumb.Item>
                                <Breadcrumb.CurrentLink>{order.shipment.trackingCode}</Breadcrumb.CurrentLink>
                            </Breadcrumb.Item>
                        </Breadcrumb.List>
                    </Breadcrumb.Root>
                </Heading>
            </HStack>
            <InfoOrderDetailBusiness order={order} onSuccess={() => mutate()} />
        </Box>
    )
}

export default MainDetailOrderBusiness