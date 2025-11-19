import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    secure: process.env.SMTP_SECURE === "true", // false nếu dùng port 587
    auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
    },
});


export const sendMail = async (option: any) => {
    try {
        await mailer.sendMail(option)
        return { success: true }
    } catch (error: any) {
        console.log(error)
        return { success: false };
    }
}