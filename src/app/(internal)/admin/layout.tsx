import type { Metadata } from "next";

import { Box, Flex } from "@chakra-ui/react";
import AsideAdmin from "@/components/layoutAdmin/AsideAdmin";
import dynamic from "next/dynamic";
import { SocketProviderInternal } from "../_providers/SocketProviderInternal";
import ToasterNotifyInternal from "../_components/ToasterNotifyInternal";



const RootLayoutAdmin = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SocketProviderInternal>
      <ToasterNotifyInternal />
      <Box as={'main'}>
        <Flex mx={'auto'} maxW={'full'} position={'relative'}>
          <AsideAdmin />
          <Box w={'full'}
            pr={8}
            pl={{ base: "0", md: "332px" }}
            mt={{ base: "2.5rem", md: "0" }}>
            {children}
          </Box>
        </Flex>
      </Box>
    </SocketProviderInternal>
  )
}

export default RootLayoutAdmin