import { notFound } from 'next/navigation'
import React from 'react'
import { verifyResetTokenInternal } from './_server/verifyTokenInternal'
import { Box, Heading } from '@chakra-ui/react'
import FormChangePasswordInter from './_components/FormChangePasswordInter'

const PageResetTokenPassword = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) => {

    const token = (await searchParams).token
    if (!token) {
        notFound()
    }
    const verify = await verifyResetTokenInternal(token)
    if (!verify.success) {
        return (
            <Box rounded={'xl'} bgColor={'white'} color={'black'} w={80}>
                <Box p={6}>
                    <Heading size={'2xl'} textAlign='center' fontWeight={'medium'}>
                        {verify.error}
                    </Heading>

                </Box>
            </Box>
        )
    }
    return (
        <Box rounded={'xl'} bgColor={'white'} color={'black'} w={80}>
            <Box p={6}>
                <Heading size={'2xl'} textAlign='center' fontWeight={'medium'}>
                    Đặt lại mật khẩu
                </Heading>
                <FormChangePasswordInter token={token} />
            </Box>
        </Box>
    )
}

export default PageResetTokenPassword