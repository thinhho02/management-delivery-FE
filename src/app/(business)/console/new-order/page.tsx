import { Box, Heading } from '@chakra-ui/react'
import React from 'react'
import FormNewOrder from './_components/FormNewOrder'
import UserDefaultProvider from './_hooks/useUserDefault'

const PageCreateNewOrder = () => {
    return (
        <Box w={'full'} mt={5} pr={{ base: "40px", md: 0 }}>
            <Heading size={'2xl'} fontWeight={'bold'}>
                Tạo đơn hàng
            </Heading>
            <Box mt={5}>
                <UserDefaultProvider>
                    <FormNewOrder />
                </UserDefaultProvider>
            </Box>
        </Box>
    )
}

export default PageCreateNewOrder