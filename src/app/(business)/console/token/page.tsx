import LinkCustom from '@/components/ui/LinkCustom'
import { Box, Heading, List, Text } from '@chakra-ui/react'
import React from 'react'
import GenerateAPIKey from './_components/GenerateAPIKey'

const PageToken = () => {
    return (
        <Box w={'full'} mt={5} pr={{ base: "40px", md: 0 }}>
            <Heading size={'2xl'} fontWeight={'bold'}>
                Mã truy cập (API Key)
            </Heading>
            <Text mt={3}>
                Bạn cần có API Key để cấu hình cho các đường dẫn API endpoint để sử dụng các dịch vụ của chúng tôi như:
            </Text>
            <List.Root ps={5}>
                <List.Item>
                    Tạo mới đơn hàng - xem chi tiết <LinkCustom href={'/docs/orders'} color={'blue'} target='_blank' _hover={{color: "blue.600"}}> tại đây</LinkCustom>
                </List.Item>
                {/* <List.Item>
                    Assumenda, quia temporibus eveniet a libero incidunt suscipit
                </List.Item>
                <List.Item>
                    Quidem, ipsam illum quis sed voluptatum quae eum fugit earum
                </List.Item> */}
            </List.Root>
            <GenerateAPIKey />
        </Box>
    )
}

export default PageToken