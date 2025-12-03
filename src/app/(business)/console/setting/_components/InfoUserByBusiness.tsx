'use client'

import { get } from '@/apis/apiCore'
import { Box, Center, Heading, Spinner } from '@chakra-ui/react'
import React from 'react'
import useSWR from 'swr'
import FormSetDefaultUser from './FormSetDefaultUser'
import { IUserDefault } from '../../new-order/_hooks/useUserDefault'

const InfoUserByBusiness = () => {
    const { data, isLoading, isValidating, mutate } = useSWR(`/user/default`, get<IUserDefault>, { revalidateOnFocus: false })


    return (
        <Box mt={5}>
            <Heading size={'lg'} fontWeight={'medium'} my={4}>
                Thông tin mặc định của shop
            </Heading>
            {(!data || isLoading || isValidating)
                ? (
                    <Box w={'full'}>
                        <Center>
                            <Spinner size={'sm'} />
                        </Center>
                    </Box>
                )
                : (
                    <FormSetDefaultUser data={data} onSuccess={() => mutate()} />
                )}
        </Box>
    )
}

export default InfoUserByBusiness