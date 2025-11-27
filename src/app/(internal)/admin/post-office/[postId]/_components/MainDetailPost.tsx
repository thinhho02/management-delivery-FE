'use client'

import React, { useEffect } from 'react'


import { Geometry } from "geojson";
import useSWR from 'swr';
import { get } from '@/apis/apiCore';
import { Box, Breadcrumb, Center, Heading, HStack, Spinner } from '@chakra-ui/react';
import { notFound } from 'next/navigation';
import LinkCustom from '@/components/ui/LinkCustom';
import dynamic from 'next/dynamic';

const FormDetailPost = dynamic(() => import('./FormDetailPost'))

interface IZone {
    _id: string;
    code: string;
    name: string;
    geometry: Geometry
}

interface ParentPost {
    _id: string;
    code: string;
    name: string;
    type: string
}


export interface ResponsePost {
    _id: string;
    code: string;
    name: string;
    type: "sorting_center" | "distribution_hub" | "delivery_office";
    address: string;
    status: boolean;
    location: Geometry;
    regionId: IZone | null;
    provinceId: IZone | null;
    wardId: IZone | null;
    parentId: ParentPost | null
}

const MainDetailPost = ({ postId }: { postId: string }) => {
    const { data, mutate, isLoading, isValidating } = useSWR(`/post-office/${postId}`, get<ResponsePost>, { revalidateOnFocus: false })


    useEffect(() => {
        if (!data) return;

        if (!data.success) {
            notFound()
        }
    }, [data])

    if (!data || !data.success || isLoading || isValidating) {
        return (
            <Box w={'full'}>
                <Center>
                    <Spinner size={'sm'} />
                </Center>
            </Box>
        )
    }

    const post = data.result
    const zoneField = post.type === 'sorting_center'
        ? "regionId"
        : post.type === "distribution_hub"
            ? "provinceId"
            : "wardId"
    if (!post[zoneField]) {
        notFound()
    }
    const zoneDataDefault = post[zoneField]
    const coordinates = post.location.type === "Point"
        ? {
            longitude: post.location.coordinates[0],
            latitude: post.location.coordinates[1]
        }: {
            longitude: 0,
            latitude: 0
        }
    const lngLatPost = JSON.stringify(coordinates)
    return (
        <Box>
            <HStack mt={10} w={'full'} justify={'space-between'}>
                <Heading size={'md'} fontWeight={'medium'}>
                    <Breadcrumb.Root>
                        <Breadcrumb.List>
                            <Breadcrumb.Item>
                                <Breadcrumb.Link asChild>
                                    <LinkCustom href={'/admin/post-office'}>
                                        Quay lại
                                    </LinkCustom>
                                </Breadcrumb.Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Separator />
                            <Breadcrumb.Item>
                                <Breadcrumb.CurrentLink>{post.name}</Breadcrumb.CurrentLink>
                            </Breadcrumb.Item>
                        </Breadcrumb.List>
                    </Breadcrumb.Root>
                </Heading>
            </HStack>
            <FormDetailPost post={post} zoneDataDefault={zoneDataDefault} onSuccess={() => mutate()} lngLatPost={lngLatPost} />
        </Box>
    )
}

export default MainDetailPost