import { AbsoluteCenter, Box, Center, Heading, HStack, Spinner } from '@chakra-ui/react'
import React, { Suspense } from 'react'
import PostOfficeTable from './_components/PostOfficeTable'
import AddNewFormPost from './_components/AddNewFormPost'

const PageManagePostOffice = () => {
  return (
    <Box position={'relative'}>
      <HStack mt={10} w={'full'} justify={'space-between'}>
        <Heading size={'lg'} fontWeight={'medium'}>
          Danh sách bưu cục
        </Heading>
      </HStack>
      <PostOfficeTable />
    </Box>
  )
}

export default PageManagePostOffice