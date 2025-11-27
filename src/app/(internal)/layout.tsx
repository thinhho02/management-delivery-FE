import SWRProvider from '@/providers/SWRProvider';
import React from 'react'
import UserProviderInternal from './_providers/UserProviderInternal';

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