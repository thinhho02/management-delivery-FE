import { Box, Flex } from '@chakra-ui/react';
import React from 'react'
import { SocketProviderInternal } from '../_providers/SocketProviderInternal';
import ToasterNotifyInternal from '../_components/ToasterNotifyInternal';
import ShipperInfoProvider from './_provider/ShipperInfoProvider';
import AsideShipper from '../_components/AsideShipper';

const RootLayoutShipper = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <SocketProviderInternal>
            <ToasterNotifyInternal />
            <ShipperInfoProvider>
                <Box as={'main'}>
                    <Flex mx={'auto'} maxW={'full'} position={'relative'}>
                        <AsideShipper />
                        <Box w={'full'}
                            px={8}
                            pl={{ base: "40px", md: "332px" }}
                            mt={{ base: "2.5rem", md: "0" }}>
                            {children}
                        </Box>
                    </Flex>
                </Box>
            </ShipperInfoProvider>
        </SocketProviderInternal>
    )
}

export default RootLayoutShipper