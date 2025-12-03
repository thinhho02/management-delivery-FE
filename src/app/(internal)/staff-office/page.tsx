import { Box, Heading } from '@chakra-ui/react'
import React from 'react'
import MainPage from './_components/MainPage'

const PageDashBoardPost = () => {
  return (
    <Box w={'full'} mt={5} pr={{ base: "40px", md: 0 }}>
      <Heading size={'2xl'} fontWeight={'bold'}>
        Quản lý đơn hàng
      </Heading>
      <Box mt={5}>
        <MainPage />
      </Box>
    </Box>
  )
}

export default PageDashBoardPost