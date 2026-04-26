import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  // Always create fresh — env vars may have changed on restart
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

const maskEmail = (email = '') => {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 0))}@${domain}`;
};

export const sendEmailOtp = async (email, otp, context = 'verification') => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Email service not configured. Set SMTP_USER and SMTP_PASS in .env');
  }

  const transport = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const subject = context === 'login'
    ? 'Your Virtual login code'
    : 'Verify your Virtual account';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 12px;">
      <h2 style="color: #111; margin-bottom: 8px;">Virtual</h2>
      <p style="color: #555; font-size: 15px; margin-bottom: 24px;">
        ${context === 'login' ? 'Use this code to complete your login.' : 'Use this code to verify your account.'}
      </p>
      <div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #111;">${otp}</span>
      </div>
      <p style="color: #888; font-size: 13px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #bbb; font-size: 11px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  await transport.sendMail({
    from: `"Virtual" <${from}>`,
    to: email,
    subject,
    html,
    text: `Your Virtual ${context} code is: ${otp}\n\nExpires in 10 minutes.`,
  });

  console.log(`✅ [Email OTP] ${context} code sent to ${maskEmail(email)}`);

  return {
    delivered: true,
    provider: 'email',
    destination: maskEmail(email),
  };
};
