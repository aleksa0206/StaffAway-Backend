import nodemailer from 'nodemailer';
import { env } from '../config/env';

const from = env.SMTP_FROM ?? env.SMTP_USER;

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// Colors match the frontend's design tokens (src/styles/_tokens.scss).
const COLORS = {
  bg: '#f4f5f8',
  surface: '#ffffff',
  border: '#e2e5eb',
  text: '#171b24',
  textSecondary: '#545d6c',
  textTertiary: '#7b8493',
  accent: '#3654d1',
};
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

type EmailContent = {
  subject: string;
  // Shown next to the subject in the inbox list.
  preheader: string;
  heading: string;
  paragraphs: string[];
  button: { label: string; url: string };
  footnote: string;
};

// Mail clients ignore <style> blocks and modern CSS, so the layout is tables with inline styles.
function renderHtml(content: EmailContent) {
  const paragraphs = content.paragraphs
    .map(
      (text) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:${COLORS.textSecondary};">${text}</p>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${content.subject}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:${FONT};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${content.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
    <tr><td style="padding:0 4px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:middle;"><img src="${env.FRONTEND_URL}/logo-mark.png" width="32" height="32" alt="" style="display:block;border:0;"></td>
        <td style="vertical-align:middle;padding-left:10px;font-size:18px;font-weight:700;color:${COLORS.text};">StaffAway</td>
      </tr></table>
    </td></tr>
    <tr><td style="background:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:12px;padding:40px 36px;">
      <h1 style="margin:0 0 16px;font-size:22px;line-height:30px;font-weight:700;color:${COLORS.text};">${content.heading}</h1>
      ${paragraphs}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 28px;"><tr>
        <td style="border-radius:8px;background:${COLORS.accent};">
          <a href="${content.button.url}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${content.button.label}</a>
        </td>
      </tr></table>
      <p style="margin:0 0 6px;font-size:13px;line-height:20px;color:${COLORS.textTertiary};">If the button doesn't work, copy this link into your browser:</p>
      <p style="margin:0 0 28px;font-size:13px;line-height:20px;word-break:break-all;"><a href="${content.button.url}" style="color:${COLORS.accent};">${content.button.url}</a></p>
      <hr style="border:0;border-top:1px solid ${COLORS.border};margin:0 0 20px;">
      <p style="margin:0;font-size:13px;line-height:20px;color:${COLORS.textTertiary};">${content.footnote}</p>
    </td></tr>
    <tr><td align="center" style="padding:24px 16px 0;font-size:12px;line-height:18px;color:${COLORS.textTertiary};">
      StaffAway &middot; Leave management for teams<br>
      <a href="${env.FRONTEND_URL}" style="color:${COLORS.textTertiary};">${env.FRONTEND_URL.replace(/^https?:\/\//, '')}</a>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

// Mail without a plain-text part is more likely to be marked as spam.
function renderText(content: EmailContent) {
  return [
    content.heading,
    '',
    ...content.paragraphs.flatMap((text) => [text, '']),
    `${content.button.label}: ${content.button.url}`,
    '',
    content.footnote,
    '',
    '-- StaffAway',
  ].join('\n');
}

async function send(to: string, content: EmailContent) {
  await transporter.sendMail({
    from,
    to,
    subject: content.subject,
    html: renderHtml(content),
    text: renderText(content),
  });
}

export async function sendVerificationEmail(to: string, verificationToken: string) {
  await send(to, {
    subject: 'Confirm your email - StaffAway',
    preheader: 'One click to activate your organization on StaffAway.',
    heading: 'Welcome to StaffAway!',
    paragraphs: [
      'Your organization is almost ready. Confirm your email address to activate your account and sign in.',
      "After that you can invite your team, set up leave types and start tracking who's away.",
    ],
    button: {
      label: 'Confirm email',
      url: `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
    },
    footnote:
      "This link expires in 24 hours. If you didn't sign up for StaffAway, you can safely ignore this email.",
  });
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  await send(to, {
    subject: 'Reset your password - StaffAway',
    preheader: 'Set a new password for your StaffAway account.',
    heading: 'Reset your password',
    paragraphs: [
      'We received a request to reset the password for your StaffAway account.',
      'Click the button below to choose a new one. For your security, all devices will be signed out afterwards.',
    ],
    button: {
      label: 'Set a new password',
      url: `${env.FRONTEND_URL}/reset-password?token=${resetToken}`,
    },
    footnote:
      "This link expires in 1 hour. If you didn't request a password reset, you can ignore this email; your password stays the same.",
  });
}
