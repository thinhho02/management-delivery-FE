import { Box, Heading, HStack } from '@chakra-ui/react'
import React from 'react'
import EmployeeTable from './_components/EmployeeTable'

const PageManageEmployee = () => {
  return (
    <Box position={'relative'}>
      <HStack mt={10} w={'full'} justify={'space-between'}>
        <Heading size={'lg'} fontWeight={'medium'}>
          Danh sách bưu cục
        </Heading>
      </HStack>
      <EmployeeTable />
    </Box>
  )
}

export default PageManageEmployee