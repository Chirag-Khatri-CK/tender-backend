import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// simple template generator (HTML + plain)
const buildEmail = ({ name, otp, ttlMinutes }: { name?: string, otp: string, ttlMinutes: number }) => {
  const plain = `Hello ${name || ''},\n\nYour OTP code is ${otp}. It expires in ${ttlMinutes} minutes.\n\nIf you didn't request this, ignore.\n`;
  const html = `
  <div style="font-family: Arial, sans-serif; color: #222;">
    <h2 style="color:#0b5ed7">Your Tender Portal OTP</h2>
    <p>Hello ${name || ''},</p>
    <p>Your one-time passcode is:</p>
    <div style="font-size:28px; font-weight:700; letter-spacing:4px; margin:16px 0;">${otp}</div>
    <p>This code will expire in <strong>${ttlMinutes} minutes</strong>.</p>
    <hr/>
    <p style="font-size:12px; color:#666">If you did not request this code, please contact support.</p>
  </div>
  `;
  return { plain, html };
};

export const sendOtp = async ({ method, to, otp, name }: { method: 'email'|'sms', to: string, otp: string, name?: string }) => {
  if (method === 'email') {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    const ttl = Number(process.env.OTP_TTL_MINUTES || 5);
    const { plain, html } = buildEmail({ name, otp, ttlMinutes: ttl });
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: 'Your Tender Portal OTP',
      text: plain,
      html
    });
    logger.info('Sent OTP email: %s', info.messageId || '(no-id)');
    return info;
  }

  // SMS path: if TWILIO_ENABLED is true, you can integrate Twilio here.
  if (process.env.TWILIO_ENABLED === 'true') {
    // implement Twilio client send here (left as exercise with your credentials)
    logger.info('TWILIO enabled but not implemented in skeleton - please add Twilio client.');
    return { sid: 'sms-mock' };
  }

  // fallback: dev-mode console log
  logger.info('[SMS-MOCK] Sending OTP to %s: %s', to, otp);
  return { mock: true };
};
