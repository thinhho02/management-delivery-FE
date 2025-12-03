import { create } from '@/apis/apiCore';
import { useUserInternal } from '@/app/(internal)/_providers/UserProviderInternal';
import { useRouter } from 'next/navigation';
import React from 'react'
import { toaster } from '@/components/ui/toaster';
import { broadcastAuthEvent, clearAccessToken } from '@/libs/tokenMemory';
import { Button } from '@chakra-ui/react';
import { RiLogoutBoxLine } from 'react-icons/ri';
import { useSocketInternal } from '@/app/(internal)/_providers/SocketProviderInternal';

const LogoutButtonInternal = () => {
    const router = useRouter();
    const { disconnectManually } = useSocketInternal()
    const { mutateUser } = useUserInternal();
    const handleLogout = async () => {
        const res = await create("/auth/internal/logout", {})
        if (!res.success) {
            toaster.error({
                id: `error-logout-${Date.now}`,
                title: "Đăng xuất thất bại",
                description: res.error
            })
            return;
        }
        // Xoá token trong RAM
        clearAccessToken();

        // Xoá cache user của SWR
        await mutateUser(undefined, false);

        // Broadcast logout cho tất cả TAB
        broadcastAuthEvent("LOGOUT");

        // disconnect Socket
        disconnectManually()
        // Chuyển hướng
        router.replace("/internal/login");
    }
    return (
        <Button colorPalette="teal" variant="solid" onClick={handleLogout}>
            <RiLogoutBoxLine /> Đăng xuất
        </Button>
    )
}

export default LogoutButtonInternal