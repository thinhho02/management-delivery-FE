'use client'

import { getAccessToken } from '@/libs/tokenMemory';
import { Avatar, Box, Button, Field, Fieldset, Heading, HStack, IconButton, Input, Tabs, Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { HiPlusSm } from 'react-icons/hi';

const PageProfile = () => {
    const [tab, setTab] = useState("individual");
    const [profile, setProfile] = useState({
        fullName: "ho cong thinh",
        email: "hothinh9234@gmail.com",
    });
    const token = getAccessToken()
    console.log(token)
    return (
        <Box>
            <Heading size="xl" fontWeight={'bold'} mb={6}>
                Profile
            </Heading>

            {/* Switch Tabs: Business / Individual */}
            <Tabs.Root defaultValue={tab} mb={6} variant="plain">
                <Tabs.List
                    borderWidth="1px"
                    borderRadius="full"
                    w="fit-content"
                >
                    <Tabs.Trigger
                        value='business'
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
                        Business
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
                        Individual
                    </Tabs.Trigger>
                </Tabs.List>
            </Tabs.Root>
            <Box mt={10} divideY={'1px'}>
                <Box mb={5}>
                    <VStack align="start">
                        <Fieldset.Root>
                            <Fieldset.Content>
                                <Field.Root invalid={false} required>
                                    <Field.Label>
                                        Full Name
                                    </Field.Label>
                                    <Input name="current_password" defaultValue={'hothinh'} />
                                    <Field.ErrorText>This is an error text</Field.ErrorText>
                                </Field.Root>
                                <Field.Root invalid={false} required>
                                    <Field.Label>
                                        Email
                                    </Field.Label>
                                    <Input name="new_password" defaultValue={'hothinh@gmail.com'} />
                                    <Field.ErrorText>This is an error text</Field.ErrorText>
                                </Field.Root>
                            </Fieldset.Content>
                        </Fieldset.Root>

                        <Button
                            mt={4}
                            colorScheme="blue"
                            borderRadius="full"
                            loading={false}
                        >
                            Save changes
                        </Button>
                    </VStack>
                </Box>
                <Box mt={5}>
                    <Heading size={'lg'} fontWeight={'medium'} my={4}>
                        Hồ sơ hình ảnh
                    </Heading>
                    <HStack>
                        <Avatar.Root>
                            <Avatar.Fallback name="Segun Adebayo" />
                            <Avatar.Image src="https://bit.ly/sage-adebayo" />
                        </Avatar.Root>
                        <IconButton px={2} size={'sm'} rounded={'xl'}>
                            <HiPlusSm />
                            <Text fontSize={'12px'}>Thêm hình ảnh</Text>
                        </IconButton>
                    </HStack>
                </Box>
            </Box>
        </Box>
    )
}

export default PageProfile