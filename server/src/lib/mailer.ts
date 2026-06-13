import { createTransport, type SentMessageInfo, type Transporter } from 'nodemailer';

import { env } from '../config/env';
import { logger } from './logger';

const isSmtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const DEFAULT_FROM_NAME = 'Scaler - assignment test mail conformation';

function extractEmail(from: string | undefined): string {
  if (!from) {
    return env.SMTP_USER ?? 'no-reply@scaler.com';
  }
  const bracketMatch = from.match(/<([^>]+)>/);
  if (bracketMatch?.[1]) {
    return bracketMatch[1];
  }
  if (from.includes('@')) {
    return from.trim();
  }
  return env.SMTP_USER ?? 'no-reply@scaler.com';
}

function resolveFromAddress(): string {
  const email = extractEmail(env.SMTP_FROM);
  return `"${DEFAULT_FROM_NAME}" <${email}>`;
}

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
    const info: SentMessageInfo = await mailer.sendMail({
      from: resolveFromAddress(),
      to,
      subject,
      html,
    });

    const sent = info as { messageId?: unknown; message?: unknown };

    if (isSmtpConfigured) {
      const messageId = typeof sent.messageId === 'string' ? sent.messageId : undefined;
      logger.info({ to, messageId }, 'Email sent');
      return;
    }

    const preview =
      typeof sent.message === 'string' ? sent.message : JSON.stringify(sent.message ?? info);
    logger.info({ to, subject, preview }, '[Mailer] Email logged');
  } catch (error) {
    logger.error({ err: error, to, subject }, 'Error sending email');
  }
}
