import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, verificationToken: string) {
  const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  await transporter.sendMail({
    from: env.SMTP_USER,
    to,
    subject: 'Confirm your email - StaffAway',
    html: `
      <p>Welcome to StaffAway! Confirm your email address to activate your organization.</p>
      <p><a href="${verifyUrl}">Click here to confirm your email</a></p>
      <p>The link expires in 24 hours. If you did not sign up, you can ignore this email.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: env.SMTP_USER,
    to,
    subject: 'Password reset - StaffAway',
    html: `
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a></p>
      <p>The link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `,
  });
}
