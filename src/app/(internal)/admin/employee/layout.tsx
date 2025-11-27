import { Box, Heading, HStack } from '@chakra-ui/react'
import React, { Suspense } from 'react'

const LayoutManageEmployee = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <Box w={'full'} mt={5}>
            <Heading size={'2xl'} fontWeight={'bold'}>
                Quản lí nhân viên
            </Heading>
            <HStack mt={10} w={'full'} justify={'space-between'}>
                <Heading size={'lg'} fontWeight={'medium'}>
                    Danh sách nhân viên
                </Heading>
                <Suspense>
                    {/* <AddNewFormPost /> */}
                </Suspense>
            </HStack>
            <Box mt={7}>
                {children}
            </Box>
        </Box>
    )
}

export default LayoutManageEmployee