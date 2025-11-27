'use client'

import { Box, Flex, Heading, VStack, Icon, Drawer, Button, Portal, HStack, Avatar } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { RiArrowDropRightFill } from 'react-icons/ri'
import { FiSidebar } from 'react-icons/fi';
import { ColorModeButton } from '../ui/color-mode'
import LinkCustom from '../ui/LinkCustom'
import { useUserInternal } from '@/app/(internal)/_providers/UserProviderInternal'
import LogoutButtonInternal from './LogoutButtonInternal'


const AsideAdmin = () => {
    const { user } = useUserInternal()
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const items = [
        { value: "1", title: "Trang chủ", href: "/admin" },
        { value: "2", title: "Khu vực hoạt động", href: "/admin/map" },
        { value: "3", title: "Quản lý bưu cục", href: "/admin/post-office" },
        { value: "4", title: "Quản lý nhân viên", href: "/admin/employee" },
    ]
    return (
        <Box>
            <Box
                as="aside"
                w="300px"
                h={'100vh'}
                position="fixed"
                top={0}
                left={0}
                display={{ base: "none", md: "block" }}
                _light={{ bgColor: 'gray.400/10' }}
                _dark={{ bgColor: 'gray.800/10' }}
            >
                <VStack justifyContent={'space-between'} h={'full'} pt={4} pb={5} px={5}>
                    <Flex direction={'column'}>
                        <HStack mb={7} w={'full'} justify={'space-between'}>
                            <Box w={'216px'}>
                                <HStack bg={'cyan.400/25'} w={'fit-content'} pr={3} borderRightRadius={'2xl'} borderTopLeftRadius={'1.5rem'} borderBottomLeftRadius={'1.5rem'}>
                                    <Avatar.Root size={'sm'}>
                                        <Avatar.Fallback name={user.account.email} />
                                        <Avatar.Image />
                                    </Avatar.Root>
                                    <Box w={'160px'}>
                                        <Heading as="h4" size="sm" fontWeight={'bold'} wordSpacing={2} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >
                                            {user.account.email}
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
                    <Box alignSelf={'start'}>
                        <LogoutButtonInternal />
                    </Box>
                </VStack>
            </Box>
            <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)} placement={'start'}>
                <Drawer.Trigger asChild>
                    <Button variant={'ghost'}
                        size="md" display={{ base: "flex", md: "none" }} position={'fixed'} left={0} top={0}>
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
                                                <Avatar.Fallback name={user.account.email} />
                                                <Avatar.Image />
                                            </Avatar.Root>
                                            <Box w={'160px'}>
                                                <Heading as="h4" size="sm" fontWeight={'bold'} wordSpacing={2} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >
                                                    {user.account.email}
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
                            <Drawer.Footer>
                                <Box alignSelf={'start'}>
                                    <LogoutButtonInternal />
                                </Box>
                            </Drawer.Footer>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>
        </Box>
    )
}

export default AsideAdmin