'use server'

import { originBackend } from "@/apis/wsConfig"
import axios from "axios"

export const verifyToken = async (token: string) => {
    try {
        const res = await axios.get<{valid: boolean}>(`${originBackend}/api/business/verify-token?token=${token}`, { withCredentials: true })
        return {success: true, result: res.data}
    } catch (error: any) {
        return {success: false, error: error.response?.data.message || "Mã xác thực không hợp lệ"}
    }

}