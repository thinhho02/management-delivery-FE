import LayoutUser from '@/app/(user)/layout'
import { Box } from '@chakra-ui/react';
import React from 'react'

import backgroundImage from '/public/images/background.svg'
import CheckSessionBusinessProvider from './_providers/CheckSessionBusinessProvider';


const BusinessAuthLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {

    return (
        <CheckSessionBusinessProvider>
            <LayoutUser>
                <Box w={'full'} h={'full'} mx={'auto'} bgImage={`url(${backgroundImage.src})`} bgPos={'center center'} bgRepeat={'no-repeat'} bgSize={'fill'} bgColor={'black'}>
                    <Box pt={20}>
                        {children}
                    </Box>
                </Box>
            </LayoutUser>
        </CheckSessionBusinessProvider>
    )
}

export default BusinessAuthLayout