import {
  Box,
  Container,
  Flex,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import ImportMap from "@/components/ImportMap";
import Header from "@/components/Header";
import RealtimeUserMap from "@/components/MapTrackingUser";

const MapVietnamTileset = dynamic(() => import("@/components/MapVietNam"));

export default function Page() {
  console.log('đây là page (user)')
  return (
    <Container>
      <Header />

      <Box as="main" mt={20}>
        <Flex direction={'column'}>

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
