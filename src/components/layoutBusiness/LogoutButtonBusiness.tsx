import { create } from '@/apis/apiCore';
import { broadcastAuthEvent, clearAccessToken } from '@/libs/tokenMemory';
import { useUserBusiness } from '@/app/(business)/_providers/UserProviderBusiness';
import { Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation';
import React from 'react'
import { RiLogoutBoxLine } from 'react-icons/ri'
import { toaster } from '../ui/toaster';
import { useSocketBusiness } from '@/app/(business)/_providers/SocketProviderBusiness';

const LogoutButtonBusiness = () => {
    const router = useRouter();
    const { disconnectManually } = useSocketBusiness()
    const { mutateUser } = useUserBusiness();

    const handleLogout = async () => {
        const res = await create("/auth/business/logout", {})
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
        router.replace("/business/login");
    }
    return (
        <Button colorPalette="teal" variant="solid" onClick={handleLogout}>
            <RiLogoutBoxLine /> Đăng xuất
        </Button>
    )
}

export default LogoutButtonBusiness