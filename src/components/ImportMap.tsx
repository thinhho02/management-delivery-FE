'use client'

import React from 'react'
import { Box, FileUpload, Icon, type UseFileUploadReturn } from '@chakra-ui/react';
import { LuUpload } from 'react-icons/lu';

type ImportMapProps = {
    fileUpload: UseFileUploadReturn;
}

const ImportMap = ({ fileUpload }: ImportMapProps) => {

    return (
        <Box w="520px" mx="auto" p={6} rounded="xl" shadow="md" borderWidth="1px">
            <FileUpload.RootProvider value={fileUpload} mb={3} alignItems="stretch">
                <FileUpload.HiddenInput />

                <FileUpload.Dropzone>
                    <Icon size="md" color="fg.muted">
                        <LuUpload />
                    </Icon>
                    <FileUpload.DropzoneContent>
                        <Box>Drag and drop files here</Box>
                    </FileUpload.DropzoneContent>
                </FileUpload.Dropzone>
                <FileUpload.List clearable showSize />
            </FileUpload.RootProvider>
        </Box>
    )
}

export default ImportMap