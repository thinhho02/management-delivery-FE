import { Box, Heading, HStack } from '@chakra-ui/react'
import React, { Suspense } from 'react'

const LayoutManageEmployee = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <Box w={'full'} mt={5} pr={{ base: "40px", md: 0 }}>
            <Heading size={'2xl'} fontWeight={'bold'}>
                Quản lí nhân viên
            </Heading>

            <Box mt={7}>
                {children}
            </Box>
        </Box>
    )
}

export default LayoutManageEmployee