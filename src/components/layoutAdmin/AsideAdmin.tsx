'use client'

import { Box, Flex, Heading, VStack, Icon, Drawer, Button, Portal, HStack, Avatar } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { RiArrowDropRightFill } from 'react-icons/ri'
import { FiSidebar } from 'react-icons/fi';
import { ColorModeButton } from '../ui/color-mode'
import LinkCustom from '../ui/LinkCustom'


const AsideAdmin = () => {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const items = [
        { value: "1", title: "Trang chủ", href: "/admin" },
        { value: "2", title: "Khu vực hoạt động", href: "/admin/map" },
        { value: "3", title: "Đơn hàng", href: "/admin/order" },
    ]
    return (
        <Box
            _light={{ bgColor: 'gray.400/10' }}
            _dark={{ bgColor: 'gray.800/10' }}
        >
            <Box
                as="aside"
                w="300px"
                h="fit-content"
                position="sticky"
                top={0}
                left={0}
                display={{ base: "none", md: "block" }}
                pt={'1rem'}
            >
                <Flex px={5} direction={'column'}>
                    <HStack mb={7} w={'full'} justify={'space-between'}>
                        <Box w={'216px'}>
                            <HStack bg={'cyan.400/25'} w={'fit-content'} pr={3} borderRightRadius={'2xl'} borderTopLeftRadius={'1.5rem'} borderBottomLeftRadius={'1.5rem'}>
                                <Avatar.Root size={'sm'}>
                                    <Avatar.Fallback name='my-name' />
                                    <Avatar.Image />
                                </Avatar.Root>
                                <Box w={'160px'}>
                                    <Heading as="h4" size="sm" fontWeight={'bold'} wordSpacing={2} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >
                                        ho
                                    </Heading>
                                </Box>
                            </HStack>
                        </Box>
                        <Box>
                            <ColorModeButton

                                _hover={{
                                    bg: "gray.600/40"
                                }}
                            />
                        </Box>
                    </HStack>

                    <VStack align="start">
                        {items.map((item) => {
                            // const lastPathname = pathname.split("/").filter(Boolean).at(-1) as string;
                            // const lastItemHref = item.href.split("/").filter(Boolean).at(-1) as string
                            // const isActive = lastPathname === lastItemHref
                            const isActive =
                                (item.href === '/admin' && pathname === '/admin') || // chỉ sáng khi đúng trang index
                                (item.href !== '/admin' && pathname.startsWith(item.href));
                            return (
                                <LinkCustom
                                    key={item.value}
                                    href={item.href}
                                    display={'flex'}
                                    alignItems={'center'}
                                    justifyContent={'space-between'}
                                    w={'full'}
                                    rounded={'xl'}
                                    pl={3}
                                    py={1}
                                    textDecoration={'none'}
                                    _hover={{
                                        bg: 'blue.400/50'
                                    }}
                                    outline={'none'}
                                    bg={isActive ? 'blue.400/50' : undefined}
                                    _light={{}}
                                    _dark={{}}
                                >
                                    {item.title}
                                    <Icon size={'lg'}>
                                        <RiArrowDropRightFill />
                                    </Icon>
                                </LinkCustom>
                            )
                        })}
                    </VStack>
                </Flex>
            </Box>
            <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)} placement={'start'}>
                <Drawer.Trigger asChild>
                    <Button variant={'ghost'}
                        size="md" display={{ base: "flex", md: "none" }} position={'absolute'} left={0}>
                        <FiSidebar />
                        Mở thanh menu
                    </Button>
                </Drawer.Trigger>
                <Portal>
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                        <Drawer.Content>
                            <Drawer.Header pt={'16px'}>
                                <HStack mb={7} w={'full'} justify={'space-between'}>
                                    <Box w={'216px'}>
                                        <HStack bg={'cyan.400/25'} flexShrink={1} w={'fit-content'} pr={3} borderRightRadius={'2xl'} borderTopLeftRadius={'1.5rem'} borderBottomLeftRadius={'1.5rem'}>
                                            <Avatar.Root size={'sm'}>
                                                <Avatar.Fallback name='my-name' />
                                                <Avatar.Image />
                                            </Avatar.Root>
                                            <Box w={'160px'}>
                                                <Heading as="h4" size="sm" fontWeight={'bold'} wordSpacing={2} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >
                                                    hothindffasfdsffadafssdfậnndsjkdnsajkdnjsa
                                                </Heading>
                                            </Box>
                                        </HStack>
                                    </Box>
                                    <Box>
                                        <ColorModeButton

                                            _hover={{
                                                bg: "gray.600/40"
                                            }}
                                        />
                                    </Box>
                                </HStack>
                            </Drawer.Header>
                            <Drawer.Body>
                                <VStack align="start" spaceY={1} >
                                    {items.map((item) => {
                                        const isActive = pathname.includes(item.href)
                                        return (
                                            <LinkCustom
                                                key={item.value}
                                                href={item.href}
                                                display={'flex'}
                                                alignItems={'center'}
                                                justifyContent={'space-between'}
                                                w={'full'}
                                                rounded={'xl'}
                                                pl={3}
                                                py={1}
                                                textDecoration={'none'}
                                                _hover={{
                                                    bg: 'blue.400/50'
                                                }}
                                                outline={'none'}
                                                bg={isActive ? 'blue.400/50' : undefined}
                                                _light={{}}
                                                _dark={{}}
                                                onClick={() => setOpen(false)}
                                            >
                                                {item.title}
                                                <Icon size={'lg'}>
                                                    <RiArrowDropRightFill />
                                                </Icon>
                                            </LinkCustom>
                                        )
                                    })}
                                </VStack>
                            </Drawer.Body>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>
        </Box>
    )
}

export default AsideAdmin