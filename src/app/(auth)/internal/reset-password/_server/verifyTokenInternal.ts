'use server'

import { originBackend } from "@/apis/wsConfig"
import axios from "axios"

export const verifyResetTokenInternal = async (token: string) => {
    try {
        console.log(`${originBackend}/api/internal/verify-token?token=${token}`)
        const res = await axios.get<{ valid: boolean }>(`${originBackend}/api/employee/verify-token?token=${token}`, { withCredentials: true })
        return { success: true, result: res.data }
    } catch (error: any) {
        return { success: false, error: error.response?.data.message || "Mã xác thực không hợp lệ" }
    }

}