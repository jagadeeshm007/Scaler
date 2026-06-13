import type { Prisma } from '@prisma/client';

import { CalendarService } from '../services/calendar.service';
import { EmailService } from '../services/email.service';
import type { BookingWithRelations } from './providers/calendar-provider.interface';
import { prisma } from './prisma';
import { logger } from './logger';

export const EVENTS = {
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_RESCHEDULED: 'BOOKING_RESCHEDULED',
} as const;

export type EventType = (typeof EVENTS)[keyof typeof EVENTS];

interface BookingCreatedPayload {
  booking: BookingWithRelations;
  timezone: string;
}

interface BookingCancelledPayload {
  booking: BookingWithRelations;
  timezone: string;
  isHost: boolean;
}

/** Persist event to DB — survives process restarts */
export async function publishEvent(type: EventType, payload: unknown): Promise<void> {
  await prisma.backgroundJob.create({
    data: {
      type,
      payload: payload as Prisma.InputJsonValue,
      status: 'PENDING',
      next_run_at: new Date(),
    },
  });
}

async function handleBookingCreated(payload: BookingCreatedPayload): Promise<void> {
  const { booking, timezone } = payload;
  logger.info(`[JobQueue] Processing BOOKING_CREATED for ${booking.id}`);

  const results = await Promise.allSettled([
    EmailService.sendBookingConfirmation(booking, timezone),
    CalendarService.createCalendarEvent(booking),
  ]);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const serviceName = index === 0 ? 'EmailService' : 'CalendarService';
      logger.error(
        { err: result.reason },
        `[JobQueue] ${serviceName} failed for booking ${booking.id}`,
      );
    }
  });
}

async function handleBookingCancelled(payload: BookingCancelledPayload): Promise<void> {
  const { booking, timezone, isHost } = payload;
  logger.info(`[JobQueue] Processing BOOKING_CANCELLED for ${booking.id}`);
  await EmailService.sendBookingCancellation(booking, timezone, isHost);
}

async function executeJob(type: string, payload: unknown): Promise<void> {
  switch (type) {
    case EVENTS.BOOKING_CREATED:
      await handleBookingCreated(payload as BookingCreatedPayload);
      return;
    case EVENTS.BOOKING_CANCELLED:
      await handleBookingCancelled(payload as BookingCancelledPayload);
      return;
    default:
      throw new Error(`Unknown background job type: ${type}`);
  }
}

/** Poll and process pending background jobs */
export async function processBackgroundJobs(batchSize = 10): Promise<number> {
  const jobs = await prisma.backgroundJob.findMany({
    where: {
      status: 'PENDING',
      next_run_at: { lte: new Date() },
    },
    orderBy: { created_at: 'asc' },
    take: batchSize,
  });

  for (const job of jobs) {
    const claimed = await prisma.backgroundJob.updateMany({
      where: { id: job.id, status: 'PENDING' },
      data: { status: 'PROCESSING' },
    });

    if (claimed.count === 0) {
      continue;
    }

    try {
      await executeJob(job.type, job.payload);
      await prisma.backgroundJob.update({
        where: { id: job.id },
        data: { status: 'COMPLETED', error: null },
      });
    } catch (error) {
      const attempts = job.attempts + 1;
      const message = error instanceof Error ? error.message : String(error);
      const failed = attempts >= job.max_attempts;

      await prisma.backgroundJob.update({
        where: { id: job.id },
        data: {
          status: failed ? 'FAILED' : 'PENDING',
          attempts,
          error: message,
          next_run_at: failed ? job.next_run_at : new Date(Date.now() + attempts * 60_000),
        },
      });

      logger.error({ err: error, jobId: job.id, type: job.type }, '[JobQueue] Job failed');
    }
  }

  return jobs.length;
}

export function startBackgroundJobWorker(intervalMs = 5_000): NodeJS.Timeout {
  logger.info('[JobQueue] Background job worker started');

  return setInterval(() => {
    void processBackgroundJobs().catch((err: unknown) => {
      logger.error({ err }, '[JobQueue] Worker tick failed');
    });
  }, intervalMs);
}

/** @deprecated Use publishEvent — kept for test compatibility */
export const eventBus = {
  emit: (type: EventType, payload: unknown): void => {
    void publishEvent(type, payload).catch((err: unknown) => {
      logger.error({ err, type }, '[JobQueue] Failed to enqueue event');
    });
  },
};

export function initEventBus(): void {
  logger.info('[JobQueue] Event publishing via durable background_jobs table');
}
