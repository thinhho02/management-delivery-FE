"use client";

import { APIResponse, get } from '@/apis/apiCore';
import { AUTH_EVENT_STORAGE_KEY, clearAccessToken, setAccessToken } from '@/libs/tokenMemory';
import { ISessionResponse } from '@/types/sessionResponse';
import { AbsoluteCenter, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useMemo } from 'react'
import useSWR, { KeyedMutator } from 'swr';


export interface UserContextState {
    user: ISessionResponse;
    mutateUser: KeyedMutator<APIResponse<ISessionResponse>>
}

const UserContextInternal = createContext<UserContextState | undefined>(undefined);

const UserProviderInternal = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    const { data: swrData, error, mutate, isValidating, isLoading } = useSWR(
        "/auth/get-session",
        get<ISessionResponse>,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            revalidateOnMount: true
        }
    );


    useEffect(() => {
        if (!swrData?.success) return;

        // cập nhật accessToken mới từ SWR (BE refresh)
        setAccessToken(swrData.result.accessToken);
    }, [swrData]);

    // Nếu SWR báo hết phiên → đẩy user về login
    useEffect(() => {
        if (error) return;

        if (swrData && !swrData.success) {
            router.replace("/internal/login");
        }
    }, [swrData, error, router]);

    // Lắng nghe sự kiện storage để đồng bộ nhiều tab
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key !== AUTH_EVENT_STORAGE_KEY || !e.newValue) return;

            const event = JSON.parse(e.newValue) as {
                type: "LOGIN" | "LOGOUT" | "FORCE_LOGOUT";
                time: number;
            };

            if (event.type === "LOGOUT" || event.type === "FORCE_LOGOUT") {
                clearAccessToken();
                mutate(undefined, false);
                // redirect về /login
                router.replace("/internal/login");
            }

        };

        window.addEventListener("storage", handler);

        return () => {
            window.removeEventListener("storage", handler);
        };
    }, [mutate]);

    const finalUser = useMemo(() => {
        if (swrData?.success) return swrData.result;
    }, [swrData]);

    if (!finalUser || isLoading || isValidating) {
        return (
            <AbsoluteCenter>
                <Spinner size="lg" color="purple.400" />
            </AbsoluteCenter>
        );
    }

    return (
        <UserContextInternal.Provider value={{ user: finalUser, mutateUser: mutate }}>
            {children}
        </UserContextInternal.Provider>
    );
}

export function useUserInternal() {
    const u = useContext(UserContextInternal)
    if (!u) {
        throw new Error("UserContext must be used inside <UserProviderInternal>");
    }
    return u;
}

export default UserProviderInternal