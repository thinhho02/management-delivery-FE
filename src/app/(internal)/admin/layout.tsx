import type { Metadata } from "next";

import { Box, Flex } from "@chakra-ui/react";
import AsideAdmin from "@/components/layoutAdmin/AsideAdmin";

const RootLayoutAdmin = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <Box as={'main'}>
      <Flex mx={'auto'} maxW={'full'} position={'relative'}>
        <AsideAdmin />
        <Box w={{ base: "full", md: "9/12" }}
          ml={10}
          mt={{ base: "2.5rem", md: "0" }}>
          {children}
        </Box>
      </Flex>
    </Box>
  )
}

export default RootLayoutAdmin