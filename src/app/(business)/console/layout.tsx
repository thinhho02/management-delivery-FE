import { Box, Flex } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import React from 'react'
import { SocketProviderBusiness } from '../_providers/SocketProviderBusiness';


const ToasterNotifyBusiness = dynamic(() => import('@/app/(business)/_components/ToasterNotifyBusiness'));
const AsideBusiness = dynamic(() => import('@/app/(business)/_components/AsideBusiness'));

const RootLayoutConsole = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SocketProviderBusiness>
      <ToasterNotifyBusiness />
      <Box as={'main'}>
        <Flex mx={'auto'} maxW={'full'} position={'relative'}>
          <AsideBusiness />
          <Box w={'full'}
            pr={8}
            pl={{ base: "40px", md: "332px" }}
            mt={{ base: "2.5rem", md: "0" }}>
            {children}
          </Box>
        </Flex>
      </Box>
    </SocketProviderBusiness>
  )
}

export default RootLayoutConsole