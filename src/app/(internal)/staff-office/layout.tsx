import { Box, Flex } from '@chakra-ui/react';
import React from 'react'
import { SocketProviderInternal } from '../_providers/SocketProviderInternal';
import ToasterNotifyInternal from '../_components/ToasterNotifyInternal';
import AsidePost from '../_components/AsidePost';
import PostInfo from './_providers/PostInfoProvider';

const RootLayoutPostOffice = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <SocketProviderInternal>
            <ToasterNotifyInternal />
            <PostInfo>
                <Box as={'main'}>
                    <Flex mx={'auto'} maxW={'full'} position={'relative'}>
                        <AsidePost />
                        <Box w={'full'}
                            pr={8}
                            pl={{ base: "0", md: "332px" }}
                            mt={{ base: "2.5rem", md: "0" }}>
                            {children}
                        </Box>
                    </Flex>
                </Box>
            </PostInfo>
        </SocketProviderInternal>
    )
}

export default RootLayoutPostOffice