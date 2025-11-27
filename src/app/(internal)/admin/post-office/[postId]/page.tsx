import { Box } from '@chakra-ui/react'
import React from 'react'

import MainDetailPost from './_components/MainDetailPost';

const PageDetailPostOffice = async ({
    params,
}: {
    params: Promise<{ postId: string }>
}) => {
    const { postId } = await params

    return (
        <Box position={'relative'}>
            <MainDetailPost postId={postId} />
        </Box>
    )
}

export default PageDetailPostOffice