import { Box, Grid, HStack, Skeleton, SkeletonCircle, SkeletonText, Stack, VStack } from '@chakra-ui/react'
import React from 'react'

const LoadingListTile = () => {
    return (
        <VStack gap={5}>
            <HStack gap="6" w={'full'}>
                <Skeleton w={'65px'} height="65px" />
                <HStack flex={1}>
                    <SkeletonText noOfLines={3} gap={2} />
                </HStack>
            </HStack>
            <HStack gap="6" w={'full'}>
                <Skeleton w={'65px'} height="65px" />
                <HStack flex={1}>
                    <SkeletonText noOfLines={3} gap={2} />
                </HStack>
            </HStack>
            <HStack gap="6" w={'full'}>
                <Skeleton w={'65px'} height="65px" />
                <HStack flex={1}>
                    <SkeletonText noOfLines={3} gap={2} />
                </HStack>
            </HStack>
        </VStack>

    )
}

export default LoadingListTile