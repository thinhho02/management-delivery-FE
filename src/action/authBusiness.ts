'use server'

import { create } from "@/apis/apiCore"
import { verifyOtpAction } from "./sendOtp"

type ResponseRegister = {
    success: boolean, 
}

function isValidText(text: string) {
    return !text || text.trim() === ''
}

export const registerBusiness = async (payload: { email: string, password: string, verifyEmail: string, acceptTerms: boolean }): Promise<{ success: false, message: string } | { success: true }> => {
    if (!payload.acceptTerms) {
        return { success: false, message: "Bạn cần đồng ý các điều khoản trước khi đăng ký" }
    }

    if (isValidText(payload.email) || isValidText(payload.password) || isValidText(payload.verifyEmail)) {
        return { success: false, message: "Nhập đầy đủ thông tin" }
    }

    const verify = await verifyOtpAction(payload.email, payload.verifyEmail)

    if (!verify.success) {
        return { success: false, message: verify.message }
    }
    const data = {
        email: payload.email,
        password: payload.password,
        verify: verify.success
    }
    const res = await create<ResponseRegister>("/auth/business/register", data)
    console.log(res)
    if (!res.success) {
        return { success: false, message: res.error }
    }

    return { success: true }

}
