'use client'

import { getAccessToken } from '@/libs/tokenMemory';
import { Avatar, Badge, Box, Button, Field, Fieldset, Flex, Heading, HStack, IconButton, Input, Stack, Status, Tabs, Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import z from 'zod';
import { useUserInternal } from '../../_providers/UserProviderInternal';
import { HiUser } from 'react-icons/hi';
import FormProfileStaff from './_components/FormProfileStaff';



const PageProfile = () => {
    const { user, mutateUser } = useUserInternal()


    return (
        <Box>
            <Heading size="xl" fontWeight={'bold'} mb={6}>
                Hồ sơ tài khoản
            </Heading>

            <Flex gap={2}>
                <Badge size={'md'} variant="solid" colorPalette="blue">
                    <HiUser />
                    {user.account.roleDescription}
                </Badge>
                <Status.Root colorPalette={user.account.status ? "green" : "red"}>
                    <Status.Indicator />
                    {user.account.status ? "Tài khoản đã kích hoạt" : "Tài khoản đã bị khóa"}
                </Status.Root>
            </Flex>

            <Box divideY={'1px'}>
                <FormProfileStaff user={user} mutateUser={mutateUser} />
            </Box>
        </Box>
    )
}

export default PageProfile