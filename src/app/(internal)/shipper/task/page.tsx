import { Box, Heading } from '@chakra-ui/react'
import React from 'react'

const PageTaskShipper = () => {
    return (
        <Box w={'full'} mt={5} pr={{ base: "40px", md: 0 }}>
            <Heading size={'2xl'} fontWeight={'bold'}>
                Nhiệm vụ hôm nay
            </Heading>
            <Box mt={5}>
                {/* <OrderTableBusiness /> */}
            </Box>
        </Box>
    )
}

export default PageTaskShipper