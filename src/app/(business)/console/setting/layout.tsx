import { Box, Heading, Flex } from '@chakra-ui/react'
import AsideSettingBusiness from './_components/AsideSettingBusiness';


const LayoutSetting = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <Box w={'full'} mt={5}>
            <Heading size={'2xl'} fontWeight={'bold'}>
                Cài đặt
            </Heading>
            <Flex mt={10}>
                <AsideSettingBusiness />

                {/* ==== MAIN CONTENT ==== */}
                <Box
                    flex="1"
                    w="full"
                    ml={10}
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