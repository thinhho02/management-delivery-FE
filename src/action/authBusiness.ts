'use server'

import { create, update } from "@/apis/apiCore"
import { verifyOtpAction } from "./sendOtp"

function isValidText(text: string) {
    return !text || text.trim() === ''
}

export const registerBusiness = async (payload: { email: string, name: string, password: string, verifyEmail: string, acceptTerms: boolean }): Promise<{ success: false, message: string } | { success: true }> => {
    if (!payload.acceptTerms) {
        return { success: false, message: "Bạn cần đồng ý các điều khoản trước khi đăng ký" }
    }

    if (isValidText(payload.email) || isValidText(payload.password) || isValidText(payload.verifyEmail) || isValidText(payload.name)) {
        return { success: false, message: "Nhập đầy đủ thông tin" }
    }

    const verify = await verifyOtpAction(payload.email, payload.verifyEmail)

    if (!verify.success) {
        return { success: false, message: verify.message }
    }

    return { success: true }

}
