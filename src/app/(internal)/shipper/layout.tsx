import { Box, Flex } from '@chakra-ui/react';
import React from 'react'
import { SocketProviderInternal } from '../_providers/SocketProviderInternal';
import ToasterNotifyInternal from '../_components/ToasterNotifyInternal';
import ShipperInfoProvider from './_provider/ShipperInfoProvider';

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
                        <Box w={'full'}
                            px={8}
                            // pl={{ base: "0", md: "332px" }}
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