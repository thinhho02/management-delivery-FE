import SWRProvider from '@/providers/SWRProvider';
import React from 'react'
import UserProviderInternal from './_providers/UserProviderInternal';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Trang quản lí",
  description: "Trang quản lí",
};


const LayoutInternal = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <SWRProvider ns="internal-cache">
            <UserProviderInternal>
                {children}
            </UserProviderInternal>
        </SWRProvider>
    )
}

export default LayoutInternal