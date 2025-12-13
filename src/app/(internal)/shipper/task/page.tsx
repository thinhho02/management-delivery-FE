import { Box, Heading } from '@chakra-ui/react'
import React from 'react'
import MainPageShipper from '../_components/MainPageShipper'

const PageTaskShipper = () => {
    return (
        <Box w={'full'} mt={5} pr={0}>
            <Heading size={'2xl'} fontWeight={'bold'}>
                Nhiệm vụ hôm nay
            </Heading>
            <Box mt={5}>
                <MainPageShipper />
            </Box>
        </Box>
    )
}

export default PageTaskShipper