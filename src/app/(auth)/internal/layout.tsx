import { Box } from '@chakra-ui/react';

import React from 'react'
import CheckSessionInternalProvider from './_providers/CheckSessionInternalProvider';

const InternalAuthLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <CheckSessionInternalProvider>
            <Box w={'full'} h={'100vh'} mx={'auto'} bgImage={`url(${'/images/background.svg'})`} bgPos={'center center'} bgRepeat={'no-repeat'} bgSize={'fill'} bgColor={'black'}>
                <Box pt={20}>
                    {children}
                </Box>
            </Box>
        </CheckSessionInternalProvider>
    )
}

export default InternalAuthLayout