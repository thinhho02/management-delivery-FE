"use client"

import { get } from '@/apis/apiCore';
import { AUTH_EVENT_STORAGE_KEY } from '@/libs/tokenMemory';
import { ICheckSessionResponse } from '@/types/sessionResponse';
import { AbsoluteCenter, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import React, { createContext, useEffect } from 'react'
import useSWR from 'swr';



const CheckSessioInternalContext = createContext<any>(undefined);


const CheckSessionInternalProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const { data, error, isValidating, isLoading } = useSWR(
        "/auth/check-session",
        get<ICheckSessionResponse>,
        {
            revalidateOnFocus: false,
        }
    );

    useEffect(() => {
        if (error) return;
        if (!data?.success) return;

        const roleName = data.result.roleName
        if (roleName === "admin") {
            router.replace("/admin")
        } else if (roleName === "shipper") {
            router.replace("/shipper")
        } else if (roleName === "staffOffice") {
            router.replace("/staff-office")
        }

    }, [data])


    if (data?.success || isLoading || isValidating) {
        return (
            <AbsoluteCenter>
                <Spinner size="lg" color="purple.400" />
            </AbsoluteCenter>
        );
    }
    return (
        <CheckSessioInternalContext.Provider value={undefined}>
            {children}
        </CheckSessioInternalContext.Provider>
    )
}

export default CheckSessionInternalProvider