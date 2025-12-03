'use client'

import LinkCustom from '@/components/ui/LinkCustom';
import { Box, Heading, VStack, Flex } from '@chakra-ui/react'
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import Loading from './list-tiles/_components/LoadingListTile';


const LayoutMap = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const pathname = usePathname()
    const sidebarItems = [
        { label: "Thêm mới khu vực", href: "/admin/map" },
        { label: "Danh sách khu vực", href: "/admin/map/list-tiles" },
    ];
    return (
        <Box w={'full'} mt={5} pr={{ base: "40px", md: 0 }}>
            <Heading size={'2xl'} fontWeight={'bold'}>
                Quản lí khu vực hoạt động
            </Heading>
            <Flex mt={10}>
                <Box
                    as="nav"
                    w={{ base: "180px", md: "220px" }}
                    pr={4}
                >
                    <VStack align="start">
                        {sidebarItems.map((item) => {
                            const isActive =
                                (item.href === '/admin/map' && pathname === '/admin/map') || // chỉ sáng khi đúng trang index
                                (item.href !== '/admin/map' && pathname.startsWith(item.href));
                            return (
                                <LinkCustom
                                    key={item.href}
                                    href={item.href}
                                    fontWeight="medium"
                                    textDecoration={'none'}
                                    _light={{
                                        color: isActive ? "orange.600" : "black"
                                    }}
                                    _dark={{
                                        color: isActive ? "orange.600" : "white"
                                    }}
                                    _hover={{
                                        color: "orange.600"
                                    }}
                                    outline={'none'}
                                >

                                    {item.label}
                                </LinkCustom>
                            )
                        })}
                    </VStack>
                </Box>

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
                    <Suspense fallback={<Loading />}>
                        {children}
                    </Suspense>
                </Box>
            </Flex>
        </Box>
    )
}

export default LayoutMap