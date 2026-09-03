import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Resetovanje lozinke - StaffAway',
    html: `
      <p>Primili smo zahtev za resetovanje lozinke.</p>
      <p><a href="${resetUrl}">Kliknite ovde da postavite novu lozinku</a></p>
      <p>Link istice za 1 sat. Ako niste vi trazili ovo, ignorisite ovaj email.</p>
    `,
  });
}