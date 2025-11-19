import { Box, Container, Flex } from '@chakra-ui/react'
import React from 'react'
import AsideDocs from '../../../components/layoutUser/AsideDocs';

const LayoutDocs = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <Flex mx={'auto'} maxW={'11/12'} position={'relative'}>
      <AsideDocs />
      <Box
        maxW={{ base: "full", md: "10/12" }}
        mx={'auto'}
        mt={{ base: "2.5rem", md: "auto" }}>
        {children}
      </Box>
    </Flex>
  )
}

export default LayoutDocs