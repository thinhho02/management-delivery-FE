'use client'

import { getAccessToken } from '@/libs/tokenMemory';
import { useUserBusiness } from '@/app/(business)/_providers/UserProviderBusiness';
import { Avatar, Box, Button, Field, Fieldset, Heading, HStack, IconButton, Input, Tabs, Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { HiPlusSm } from 'react-icons/hi';
import FormProfileBusiness from './_components/FormProfileBusiness';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import z from 'zod';
import InfoUserByBusiness from './_components/InfoUserByBusiness';

const PageProfile = () => {
    const { user, mutateUser } = useUserBusiness()


    return (
        <Box>
            <Heading size="xl" fontWeight={'bold'} mb={6}>
                Hồ sơ doanh nghiệp
            </Heading>

            {/* Switch Tabs: marketplace / individual */}
            <Tabs.Root defaultValue={user.account.type} mb={6} variant="plain" >
                <Tabs.List
                    borderWidth="1px"
                    borderRadius="full"
                    w="fit-content"
                >
                    <Tabs.Trigger
                        value='marketplace'
                        borderRadius="full"
                        px={4}
                        py={1}
                        fontSize="sm"
                        _light={{
                            _selected: {
                                bgColor: 'gray.100',
                                boxShadow: "sm"
                            }
                        }}
                        _dark={{
                            _selected: {
                                bgColor: "gray.800",
                                boxShadow: "sm",
                            }
                        }}
                        disabled
                    >
                        Sàn TMĐT
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value='individual'
                        borderRadius="full"
                        px={4}
                        py={1}
                        fontSize="sm"
                        _light={{
                            _selected: {
                                bgColor: 'gray.100',
                                boxShadow: "sm"
                            }
                        }}
                        _dark={{
                            _selected: {
                                bgColor: "gray.800",
                                boxShadow: "sm",
                            }
                        }}
                    >
                        Cá nhân
                    </Tabs.Trigger>
                </Tabs.List>
            </Tabs.Root>
            <Box divideY={'1px'}>
                <FormProfileBusiness user={user} mutateUser={mutateUser} />
                <InfoUserByBusiness />
            </Box>
        </Box>
    )
}

export default PageProfile