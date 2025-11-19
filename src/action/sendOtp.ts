'use server'

import { mailer, sendMail } from "@/libs/nodemailer";
import { redis } from "@/libs/redis";
import axios from "axios";


function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function verifyEmail(email: string) {
    try {
        const API_KEY = process.env.API_KEY_ABSTRACTAPI
        const res = await axios.get(`https://emailreputation.abstractapi.com/v1/?api_key=${API_KEY}&email=${email}`)
        const status = res.data.email_deliverability.status
        if (status === "undeliverable" || status === "unknown") {
            return { status: false, message: "Email không tồn tại" }
        }
        return { status: true }
    } catch (error: any) {
        return { status: false, message: error.message }
    }
}


export async function sendOtpAction(email: string) {
    const otpKey = `otp:${email}`;
    const cooldownKey = `otp_cooldown:${email}`;

    // 1. Check cooldown 60s
    const cooldown = await redis.get(cooldownKey);
    if (cooldown) {
        return { success: false, message: "Vui lòng thử lại sau 60 giây." };
    }

    const otp = generateOTP();

    // 2. Save OTP 5 minutes
    await redis.set(otpKey, otp, { ex: 300 });

    // 3. Save cooldown 60 seconds
    await redis.set(cooldownKey, true, { ex: 60 });

    const res = await sendMail({
        from: `"Hệ thống giao hàng" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Mã OTP xác thực",
        html: `
      <div style="font-family:sans-serif;">
        <h2>Mã OTP của bạn</h2>
        <p>Mã xác thực Email của bạn là:</p>
        <h1 style="letter-spacing:4px;">${otp}</h1>
        <p>Mã hết hạn sau 5 phút.</p>
      </div>
    `,
    });
    if (!res.success) {
        return { success: false, message: `Không thể gửi mã OTP đến email ${email}` }
    }

    return { success: true, message: `Đã gửi OTP thành công đến email ${email}` };
}


export async function verifyOtpAction(email: string, otp: string): Promise<{ success: false, message: string } | { success: true }> {
    const otpKey = `otp:${email}`;
    const cachedOtp = await redis.get(otpKey);
    if (!cachedOtp) {
        return { success: false, message: "OTP đã hết hạn." };
    }

    if (cachedOtp != otp) {
        return { success: false, message: "OTP không chính xác." };
    }

    await redis.del(otpKey);

    return { success: true };
}