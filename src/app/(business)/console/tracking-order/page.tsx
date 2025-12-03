import { Box, Heading } from '@chakra-ui/react'
import React from 'react'
import OrderTableBusiness from './_components/OrderTableBusiness'

const PageTrackingOrder = () => {
    return (
        <Box w={'full'} mt={5} pr={{ base: "40px", md: 0 }}>
            <Heading size={'2xl'} fontWeight={'bold'}>
                Tra cứu đơn hàng
            </Heading>
            <Box mt={5}>
                    <OrderTableBusiness />
            </Box>
        </Box>
    )
}

export default PageTrackingOrder