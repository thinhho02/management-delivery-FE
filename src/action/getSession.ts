import { originBackend } from "@/apis/httpConfig";
import { cookies } from "next/headers";

export interface ISessionResponse {
    sid: string;
    isSuspicious: boolean;
    isTrusted: boolean;
    loggedIn: boolean;
    accessToken: string;
    account: {
        id: string;
        name: string;
        email: string;
        status: string;
        [key: string]: any;
    };
    roleName: string;
}

export const getSession = async () => {
    try {
        const cookieStore = await cookies();
        const refresh = cookieStore.get("refreshToken")?.value;
        console.log(refresh)
        const res = await fetch(`${originBackend}/auth/get-session`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Cookie": refresh ? `refreshToken=${refresh};` : "",
            },
            cache: "no-store", // để tránh cache SSR
        });
        if (!res.ok) {
            return { success: false };
        }
        const data: ISessionResponse = await res.json();
        console.log(data)
        return { success: true, result: data }
    } catch (error) {
        console.error(error)
        return { success: false}
    }
}