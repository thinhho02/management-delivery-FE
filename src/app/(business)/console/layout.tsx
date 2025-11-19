import { SocketProvider } from '@/providers/SocketProvider';
import { Box, Flex } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import React from 'react'


const ToasterNotify = dynamic(() => import('@/components/ui/ToasterNotify'));
const AsideBusiness = dynamic(() => import('@/components/layoutBusiness/AsideBusiness'));

const RootLayoutConsole = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SocketProvider>
      <ToasterNotify />
      <Box as={'main'}>
        <Flex mx={'auto'} maxW={'full'} position={'relative'}>
          <AsideBusiness />
          <Box w={{ base: "full", md: "9/12" }}
            pl={10}
            ml={{ base: "0", md: "300px" }}
            mt={{ base: "2.5rem", md: "0" }}>
            {children}
          </Box>
        </Flex>
      </Box>
    </SocketProvider>
  )
}

export default RootLayoutConsole