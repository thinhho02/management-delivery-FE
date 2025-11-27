'use client'

import { get } from '@/apis/apiCore';
import { AUTH_EVENT_STORAGE_KEY } from '@/libs/tokenMemory';
import { ICheckSessionResponse } from '@/types/sessionResponse';
import { AbsoluteCenter, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import React, { createContext, useEffect } from 'react'
import useSWR from 'swr';


const CheckSessionBusinessContext = createContext<any>(undefined);


const CheckSessionBusinessProvider = ({ children }: { children: React.ReactNode }) => {
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

    if (data.result.roleName === "business") {
      router.replace("/console")
      return;
    }

  }, [data])


  // Lắng nghe sự kiện storage để đồng bộ nhiều tab
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== AUTH_EVENT_STORAGE_KEY || !e.newValue) return;

      const event = JSON.parse(e.newValue) as {
        type: "LOGIN_B" | "LOGOUT_B" | "FORCE_LOGOUT_B";
        time: number;
      };

      if (event.type === "LOGIN_B") {
        // Tab khác login → revalidate user
        router.replace("/console")
      }

    };

    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("storage", handler);
    };
  }, [data]);


  if (data?.success || isLoading || isValidating) {
    return (
      <AbsoluteCenter>
        <Spinner size="lg" color="purple.400" />
      </AbsoluteCenter>
    );
  }
  return (
    <CheckSessionBusinessContext.Provider value={undefined}>
      {children}
    </CheckSessionBusinessContext.Provider>
  )
}

export default CheckSessionBusinessProvider