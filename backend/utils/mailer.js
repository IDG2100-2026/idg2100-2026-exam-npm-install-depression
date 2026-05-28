import nodemailer from "nodemailer";

function createTransport() {
    return nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

const FROM = process.env.SMTP_FROM || '"Spanish Poker Dice" <noreply@pokerdice.no>';
const CLIENT = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

export async function sendVerificationEmail(to, token) {
    const link = `${CLIENT}/verify-email?token=${token}`;
    await createTransport().sendMail({
        from: FROM,
        to,
        subject: 'Verify your Spanish Poker Dice account',
        html: `
            <h2>Welcome to Spanish Poker Dice!</h2>
            <p>Click the link below to verify your email address.
               The link expires in <strong>15 minutes</strong>.</p>
            <a href="${link}">${link}</a>
            <p>If you did not create an account, you can ignore this email.</p>
        `
    });
}

export async function sendPasswordResetEmail(to, token) {
    const link = `${CLIENT}/reset-password?token=${token}`;
    await createTransport().sendMail({
        from: FROM,
        to,
        subject: 'Reset your Spanish Poker Dice password',
        html: `
            <h2>Password reset request</h2>
            <p>Click the link below to set a new password.
               The link expires in <strong>15 minutes</strong>.</p>
            <a href="${link}">${link}</a>
            <p>If you did not request a password reset, you can ignore this email.</p>
        `
    });
}
