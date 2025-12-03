import { Box, Heading } from '@chakra-ui/react'
import React from 'react'
import ChatBoxBusiness from './_components/ChatBoxBusiness'

const PageChatBusiness = () => {
    return (
        <Box w={'full'} mt={5} pr={{ base: "40px", md: 0 }}>
            <Heading size={'2xl'} fontWeight={'bold'}>
                Trò chuyện hoặc khiếu nại
            </Heading>
            <Box mt={5}>
                <ChatBoxBusiness />
            </Box>
        </Box>
    )
}

export default PageChatBusiness