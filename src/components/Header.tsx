"use client";

import {
    Box,
    Flex,
    HStack,
    Image,
    Drawer,
    Portal,
    CloseButton,
    IconButton,
    VStack,
} from "@chakra-ui/react";
import NextImage from "next/image";
import { useState } from "react";
import { FiSidebar } from 'react-icons/fi';
import logoIcon from '/public/logo.svg'
import { ColorModeButton } from "./ui/color-mode";
import LinkCustom from "./ui/LinkCustom";

const navItems = [
    { label: "Tra cứu đơn hàng", href: "#" },
    { label: "Thông tin liên hệ", href: "#" },
    { label: "Tài liệu", href: "/docs" },
    { label: "Hợp tác", href: "/business/login" },
];

export default function Header() {
    const [open, setOpen] = useState(false)
    const [isHover, setIsHover] = useState(false);

    return (
        <Box
            as="header"
            position="fixed"
            top="0"
            left="0"
            w="100%"
            zIndex="100"
            transition="all 0.3s ease"
            _light={{ bg: isHover ? "black" : "white" }}
            _dark={{ bg: isHover ? "white" : "black" }}
            borderBottomWidth={'0.5px'}
            borderColor={'gray.500/20'}
            boxShadow={isHover ? "sm" : "none"}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
        >
            <Flex
                justify='space-between'
                align="center"
                maxW="7xl"
                mx="auto"
                px={{ base: 4, md: 6 }}

            >
                {/* Logo */}
                <HStack wordSpacing="2">
                    <LinkCustom href={'/'}>
                        <Image asChild>
                            <NextImage src={logoIcon} alt="adsa" />
                        </Image>
                    </LinkCustom>
                </HStack>

                {/* Nav */}
                <HStack divideStyle={'solid'} divideX='0.5px' ml="8" display={{ base: "none", md: "flex" }}
                    _light={{ divideColor: isHover ? "gray.600" : "gray.400" }}
                    _dark={{ divideColor: isHover ? "gray.400" : "gray.600" }}
                >
                    {navItems.map((item) => (
                        <LinkCustom
                            href={item.href}
                            key={item.label}
                            fontWeight="500"
                            fontSize="md"
                            position="relative"
                            _light={{ color: isHover ? "white" : "black" }}
                            _dark={{ color: isHover ? "black" : "white" }}
                            _hover={{
                                textDecoration: "none",
                                color: isHover ? "blue.600" : "blue.300",
                            }}
                            outline={'none'}
                            px={5}
                        >
                            {item.label}
                        </LinkCustom>
                    ))}
                </HStack>


                {/* Actions */}
                <HStack wordSpacing="5">

                    <ColorModeButton
                        _light={{ color: isHover ? "white" : "black" }}
                        _dark={{ color: isHover ? "black" : "white" }}
                        _hover={{
                            bg: "gray.600/40"
                        }}
                    />
                    <Box display={{ base: "block", md: "none" }}>
                        <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)} >
                            <Drawer.Trigger asChild>
                                <IconButton
                                    p={0}
                                    _light={{ color: isHover ? "white" : "black" }}
                                    _dark={{ color: isHover ? "black" : "white" }}
                                    _hover={{
                                        bg: "gray.600/40"
                                    }}
                                    size="sm"
                                    variant={'ghost'}
                                    css={{
                                        _icon: {
                                            width: "5",
                                            height: "5",
                                        },
                                    }}
                                >
                                    <FiSidebar />
                                </IconButton>
                            </Drawer.Trigger>
                            <Portal>
                                <Drawer.Backdrop />
                                <Drawer.Positioner>
                                    <Drawer.Content>
                                        <Drawer.Header>
                                        </Drawer.Header>
                                        <Drawer.Body>
                                            <VStack divideStyle={'solid'} divideY='0.5px' display={{ base: "flex", md: "none" }}
                                            >
                                                {navItems.map((item) => (
                                                    <LinkCustom
                                                        key={item.label}
                                                        href={item.href}
                                                        fontWeight="500"
                                                        fontSize="md"
                                                        position="relative"
                                                        w={'full'}
                                                        _hover={{
                                                            textDecoration: "none",
                                                            color: isHover ? "blue.600" : "blue.300",
                                                        }}
                                                        outline={'none'}
                                                        p={5}
                                                        onClick={() => setOpen(false)}
                                                        asChild
                                                    >
                                                        {item.label}
                                                    </LinkCustom>
                                                ))}
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
                </HStack>
            </Flex>
        </Box>
    );
}
