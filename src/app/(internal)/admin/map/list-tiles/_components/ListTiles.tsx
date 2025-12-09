'use client'

import { get } from '@/apis/apiCore'
import { toaster } from '@/components/ui/toaster'
import LoadingListTile from './LoadingListTile'
import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import { AbsoluteCenter, Box, Button, For, Grid, Heading, HStack, IconButton, Menu, Portal, Spinner, VStack } from '@chakra-ui/react'
import { HiDotsVertical, HiOutlineEye, HiOutlineTrash } from 'react-icons/hi';
import ImageCustom from '@/components/ui/ImageCustom'
import { generateStaticMapURL } from '@/utils/generateStaticMapURL'

import { formatDateVN } from '@/utils/formatDateVN'
import LinkCustom from '@/components/ui/LinkCustom'
import { zones } from '@/types/constantsNameZone'

interface ITileset {
    center: [number, number, number],
    created: string;
    created_by_client: string
    cu: number
    description: string
    filesize: number
    id: string
    modified: string
    name: string
    status: string
    tileset_precisions: {}
    type: string
    visibility: string
}

const ListTiles = () => {
    const [mapImages, setMapImages] = useState<Record<string, string>>({});
    const { data: tileset, isValidating, isLoading } = useSWR("/mapbox/list-tileset", get<ITileset[]>, {
        onError: (err) => {
            toaster.create({
                id: `list-tileset-${Date.now()}`,
                type: "error",
                title: err.message || "Error loading tileset",
            });
        },
        onSuccess: (data) => {
            if (data.success) {
            } else {
                toaster.create({
                    id: `list-tileset-${Date.now()}`,
                    type: "error",
                    title: data.error || "Error loading tileset",
                });
            }
        },
        revalidateOnFocus: false,
    })

    useEffect(() => {
        if (!tileset?.success) return;

        const fetchImages = async () => {
            const newImages: Record<string, string> = {};
            for (const tile of tileset.result) {
                const url = await generateStaticMapURL({
                    sourceLayer: tile.name,
                    tileID: tile.id,
                    height: 200,
                    width: 300,
                });
                newImages[tile.id] = url;
            }
            setMapImages(newImages);
        };

        fetchImages();



    }, [tileset])
    if (isValidating || isLoading) {
        return (<LoadingListTile />)
    }
    return (
        <VStack gap={2}>
            {tileset?.success &&
                (<For each={tileset.result}>
                    {(tile) => {
                        const tileName = zones.find(item => item.name.includes(tile.name))
                        const date = formatDateVN(tile.created)
                        return (
                            <Box
                                w={'full'}
                                key={tile.id}
                                _hover={{
                                    bgColor: 'gray.muted/25'
                                }}
                                p={2}
                            >
                                <HStack>
                                    <Box w={'65px'} flexShrink={0} h={'65px'} position={'relative'}>
                                        {mapImages[tile.id] ? (
                                            <ImageCustom fill priority src={mapImages[tile.id]} alt={tile.name} rounded={'lg'} />
                                        ) : (
                                            <AbsoluteCenter>
                                                <Spinner
                                                    size="sm"
                                                    color="purple.400"
                                                // transformOrigin="translate(-50%, -50%)"
                                                />
                                            </AbsoluteCenter>
                                        )}
                                    </Box>
                                    <Box flex={1}>
                                        <LinkCustom href={`/admin/map/list-tiles/${tileName?.name}`} textDecoration={'none'}>
                                            <Heading fontWeight="medium" color="fg" size={'sm'}>
                                                {tileName && tileName.label}
                                            </Heading>
                                        </LinkCustom>
                                        <Heading size={'sm'} color={'gray.focusRing'}>
                                            {date}
                                        </Heading>
                                    </Box>
                                    <Box w={'1/12'} flexShrink={0}>
                                        <Menu.Root>
                                            <Menu.Trigger asChild>
                                                <IconButton variant="ghost" outline={'none'} size="sm">
                                                    <HiDotsVertical />
                                                </IconButton>
                                            </Menu.Trigger>
                                            <Portal>
                                                <Menu.Positioner>
                                                    <Menu.Content px={1}>
                                                        <Menu.Item value="view" pl={1} bg={'transparent'}>
                                                            <LinkCustom pl={'2px'} href={`/admin/map/list-tiles/${tileName?.name}`} textDecoration={'none'} _hover={{ color: "orange.600" }} gap={2}>
                                                                <HiOutlineEye /> View
                                                            </LinkCustom>
                                                        </Menu.Item>
                                                        <Menu.Item value="detele" p={0} pl={1} bg={'transparent'}>
                                                            <Button
                                                                outline={'none'}
                                                                _hover={{ color: "orange.600" }}
                                                                bg={'transparent'}
                                                                p={0}
                                                                size={'sm'}
                                                                transition={'unset'}
                                                                color={'red'}

                                                            >
                                                                <HiOutlineTrash /> Delete
                                                            </Button>
                                                        </Menu.Item>
                                                    </Menu.Content>
                                                </Menu.Positioner>
                                            </Portal>
                                        </Menu.Root>
                                    </Box>
                                </HStack>
                            </Box>
                        )
                    }}
                </For>
                )}
        </VStack>
    )
}

export default ListTiles