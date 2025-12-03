'use client'

import {
  Box,
  Container,
  Flex,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import ImportMap from "@/components/ImportMap";
import Header from "@/components/Header";
import RealtimeUserMap from "@/components/MapTrackingUser";
import { QrReader } from "react-qr-reader";
import { useEffect } from "react";

import { Html5QrcodeScanner } from 'html5-qrcode'

const MapVietnamTileset = dynamic(() => import("@/components/MapVietNam"));

export default function Page() {

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('render', {
      qrbox: {
        width: 250,
        height: 250
      },

      fps: 5,
    }, undefined)
    scanner.render(success, error)
    function success(result: any) {
      scanner.clear()
      console.log(result)
    }
    function error(error: any){
      console.log(error)
    }
  }, [])
  console.log('đây là page (user)')
  return (
    <Container>
      <Header />

      <Box as="main" mt={20}>
        <Flex direction={'column'}>
          <Box position="relative" w="100%" h="360px">
           <Box id="render">

           </Box>

          </Box>
          {/* Bản đồ */}
          <Container>
            <MapVietnamTileset />
            {/* <RealtimeUserMap /> */}
          </Container>

          {/* <ImportMap type="province"/> */}
        </Flex>
        {/* <ol>
          <li>
            <ColorModeButton></ColorModeButton>
            <LightMode>

              <VStack wordSpacing={12} p={6}>
                <Box p={4} colorPalette="blue"
                  bg={{ base: "colorPalette.100", _hover: "colorPalette.200" }} borderRadius="md">
                  <Text>Chế độ sáng (Light Theme)</Text>
                  <Button>Nút chính</Button>
                  <Button colorScheme="red" variant="outline">Nút phụ</Button>
                </Box>

                <Box p={4} bg="gray.800" color="white" borderRadius="md">
                  <Text>Chế độ tối (Dark Theme)</Text>
                  <Button colorScheme="blue">Nút chính</Button>
                  <Button colorScheme="red" variant="outline">Nút phụ</Button>
                </Box>
              </VStack>
            </LightMode>
          </li>
          <li>Save and see your changes instantly.</li>
        </ol> */}

      </Box>

    </Container>
  );
}
