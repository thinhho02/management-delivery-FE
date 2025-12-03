import { Box, Heading, Flex } from '@chakra-ui/react'
import AsideSettingStaff from './_components/AsideSettingStaff';


const LayoutSetting = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <Box w={'full'} mt={5} pr={{base: "40px", md: 0}}>
            <Heading size={'2xl'} fontWeight={'bold'}>
                Cài đặt
            </Heading>
            <Flex mt={10} flexDirection={{base: "column", md: "row"}}>
                <AsideSettingStaff />

                {/* ==== MAIN CONTENT ==== */}
                <Box
                    flex="1"
                    w="full"
                    ml={{base: "0", md: 10}}
                    mt={{base: 10, md: "0"}}
                    borderRadius="2xl"
                    p={8}
                    backdropFilter="blur(20px)"
                    _light={{ boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)" }}
                    _dark={{ boxShadow: "0 4px 15px rgba(110, 106, 106, 0.2)" }}
                >
                    {children}
                </Box>
            </Flex>
        </Box>
    )
}

export default LayoutSetting