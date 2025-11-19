import LayoutUser from '@/app/(user)/layout'
import { Box, Container } from '@chakra-ui/react';
import React from 'react'

import backgroundImage from '/public/images/background.svg'
import { redirect } from 'next/navigation';
import { getSession } from '@/action/getSession';

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const BusinessAuthLayout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await getSession()
    if (session.success && session.result && session.result.roleName === "business") {
        redirect("/console")
    }
    return (
        <LayoutUser>
            <Box w={'full'} mx={'auto'} bgImage={`url(${backgroundImage.src})`} bgPos={'center center'} bgRepeat={'no-repeat'} bgSize={'fill'} bgColor={'black'}>
                <Box py={20}>
                    {children}
                </Box>
            </Box>
        </LayoutUser>
    )
}

export default BusinessAuthLayout