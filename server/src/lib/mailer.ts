import { createTransport, type Transporter } from 'nodemailer';

import { env } from '../config/env';
import { logger } from './logger';

const isSmtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

function createMailer(): Transporter {
  if (isSmtpConfigured) {
    return createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  logger.warn('[Mailer] SMTP not configured — emails will be logged to console');
  return createTransport({ jsonTransport: true });
}

export const mailer = createMailer();

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    const info = await mailer.sendMail({
      from: `"Scaler Scheduling" <${env.SMTP_FROM ?? 'no-reply@scaler.com'}>`,
      to,
      subject,
      html,
    });

    if (isSmtpConfigured) {
      logger.info({ to, messageId: info.messageId }, 'Email sent');
      return;
    }

    const preview =
      typeof info.message === 'string' ? info.message : JSON.stringify(info.message ?? info);
    logger.info({ to, subject, preview }, '[Mailer] Email logged');
  } catch (error) {
    logger.error({ err: error, to, subject }, 'Error sending email');
  }
}
