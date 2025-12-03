import { AbsoluteCenter, Box, Flex, Heading, HStack, Spinner } from '@chakra-ui/react'
import React, { Suspense } from 'react'

const LayoutManagePostOffice = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <Box w={'full'} mt={5} pr={{ base: "40px", md: 0 }}>
            <Heading size={'2xl'} fontWeight={'bold'}>
                Quản lí bưu cục
            </Heading>
            
            <Box mt={7}>
                {children}
            </Box>
        </Box>
    )
}

export default LayoutManagePostOffice