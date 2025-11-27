'use client'

import { create } from '@/apis/apiCore'
import { originBackend } from '@/apis/wsConfig'
import { toaster } from '@/components/ui/toaster'
import { Tooltip } from '@/components/ui/tooltip'
import { Box, Button, Clipboard, Code, IconButton, Text } from '@chakra-ui/react'
import React, { useState } from 'react'


const BASE_URL = originBackend

const GenerateAPIKey = () => {
    const [apiKey, setApiKey] = useState('')
    const [maskKey, setMaskKey] = useState('')

    const handleCreateKey = async () => {
        const res = await create<{message: string, apiKey: string, maskKey: string}>("/business/api-key/create",{})

        if(!res.success){
            toaster.create({
                id: `Create-key-e-${Date.now}`,
                type: "error",
                title: "Tạo API Key không thành công",
                description: res.error
            })
            return;
        }
        setApiKey(res.result.apiKey)
        setMaskKey(res.result.maskKey)
        toaster.success({
            id: `Create-key-s-${Date.now}`,
            title: res.result.message
        })

    }

    return (
        <Box mt={10}>
            <Button colorPalette="teal" variant="solid" onClick={handleCreateKey} >
                Tạo API Key
            </Button>
            <Box maxW={'full'} mt={10}>
                <Code mb={3} display={'flex'} w={'full'} alignItems={'center'} px={0} overflow={'auto'}>
                    <Text flexShrink={0} as={'span'} px={4} py={2} h={'full'} textTransform={'uppercase'} bg={'teal.400/30'} fontWeight={'bold'}>post</Text>
                    <Box
                        flexGrow={1}
                        px={4}
                    >
                        <Text as="span" fontSize="sm"
                            dangerouslySetInnerHTML={{ __html: `${BASE_URL}/api/create/order?api_key=<b>${maskKey}</b>` }} />

                    </Box>
                    <Clipboard.Root flexShrink={0} pr={2} value={`${BASE_URL}/api/create/order?api_key=${apiKey}`}>
                        <Clipboard.Trigger asChild>
                            <IconButton variant="ghost" size="xs">
                                <Tooltip content="Copy">
                                    <Clipboard.Indicator />
                                </Tooltip>
                            </IconButton>
                        </Clipboard.Trigger>
                    </Clipboard.Root>
                </Code>
            </Box>
        </Box>
    )
}

export default GenerateAPIKey