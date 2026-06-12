import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

export const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.ethereal.email',
  port: env.SMTP_PORT || 587,
  secure: env.SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await mailer.sendMail({
      from: `"Scaler Scheduling" <${env.SMTP_FROM || 'no-reply@scaler.com'}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error({ err: error }, `Error sending email to ${to}`);
    // We intentionally don't throw to prevent failing the main transaction
  }
}
