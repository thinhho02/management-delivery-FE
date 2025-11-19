import { Box, Heading, Text } from '@chakra-ui/react'
import React from 'react'

const PageToken = () => {
    return (
        <Box w={'full'} mt={5}>
            <Heading size={'2xl'} fontWeight={'bold'}>
                Mã truy cập (Access tokens)
            </Heading>
            <Text mt={3}>
                Bạn cần có API access token để cấu hình cho các dịch vụ của chúng tôi
            </Text>
        </Box>
    )
}

export default PageToken