'use client'

import { Box, Flex, Heading, VStack, Icon, Drawer, Button, Portal, CloseButton } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { RiArrowDropRightFill } from 'react-icons/ri'
import { FiSidebar } from 'react-icons/fi';
import LinkCustom from '../ui/LinkCustom'


const AsideDocs = () => {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const items = [
        { value: "1", title: "Hướng dẫn", href: "/docs/guides" },
        { value: "2", title: "Tạo đơn hàng", href: "/docs/orders" }
    ]
    return (
        <Box>
            <Box
                as="aside"
                w="240px"
                h="fit-content"
                top={20}
                position="sticky"
                display={{ base: "none", md: "block" }}
            >
                <Flex px={5} direction={'column'}>

                    <Heading as="h3" size="xl" fontWeight={'bold'} mb={7} wordSpacing={2}>
                        API Docs
                    </Heading>

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
                            <Drawer.Header>
                                <Heading size="xl" fontWeight={'bold'} mb={7} wordSpacing={2}>
                                    API Docs
                                </Heading>
                            </Drawer.Header>
                            <Drawer.Body>
                                <VStack align="start" spaceY={1} >
                                    {items.map((item) => {
                                        const lastPathname = pathname.split("/").filter(Boolean).at(-1) as string;
                                        const lastItemHref = item.href.split("/").filter(Boolean).at(-1) as string
                                        const isActive = lastPathname === lastItemHref
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
                            <Drawer.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Drawer.CloseTrigger>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>
        </Box>
    )
}

export default AsideDocs