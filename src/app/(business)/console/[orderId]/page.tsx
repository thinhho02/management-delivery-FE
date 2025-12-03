import { Box } from '@chakra-ui/react'
import React from 'react'
import MainDetailOrderBusiness from './_components/MainDetailOrderBusiness'

const PageDetailOrderBusiness = async ({
    params,
}: {
    params: Promise<{ orderId: string }>
}) => {
    const { orderId } = await params

    return (
        <Box position={'relative'}>
            <MainDetailOrderBusiness orderId={orderId} />
        </Box>
    )
}

export default PageDetailOrderBusiness