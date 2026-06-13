import { CalendarService } from '../services/calendar.service';
import { EmailService } from '../services/email.service';
import type { BookingWithRelations } from './providers/calendar-provider.interface';
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

interface BookingRescheduledPayload {
  previousBooking: BookingWithRelations;
  newBooking: BookingWithRelations;
  timezone: string;
  reason?: string | null;
}

async function handleBookingCreated(payload: BookingCreatedPayload): Promise<void> {
  const { booking, timezone } = payload;
  logger.info(`[EventBus] Sending BOOKING_CREATED emails for ${booking.id}`);

  const results = await Promise.allSettled([
    EmailService.sendBookingConfirmation(booking, timezone),
    CalendarService.createCalendarEvent(booking),
  ]);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const serviceName = index === 0 ? 'EmailService' : 'CalendarService';
      logger.error(
        { err: result.reason },
        `[EventBus] ${serviceName} failed for booking ${booking.id}`,
      );
    }
  });
}

async function handleBookingCancelled(payload: BookingCancelledPayload): Promise<void> {
  const { booking, timezone, isHost } = payload;
  logger.info(`[EventBus] Sending BOOKING_CANCELLED emails for ${booking.id}`);
  await EmailService.sendBookingCancellation(booking, timezone, isHost);
}

async function handleBookingRescheduled(payload: BookingRescheduledPayload): Promise<void> {
  const { previousBooking, newBooking, timezone, reason } = payload;
  logger.info(
    `[EventBus] Sending BOOKING_RESCHEDULED emails for ${previousBooking.id} -> ${newBooking.id}`,
  );
  await EmailService.sendBookingReschedule(previousBooking, newBooking, timezone, reason);
}

async function executeEvent(type: EventType, payload: unknown): Promise<void> {
  switch (type) {
    case EVENTS.BOOKING_CREATED:
      await handleBookingCreated(payload as BookingCreatedPayload);
      return;
    case EVENTS.BOOKING_CANCELLED:
      await handleBookingCancelled(payload as BookingCancelledPayload);
      return;
    case EVENTS.BOOKING_RESCHEDULED:
      await handleBookingRescheduled(payload as BookingRescheduledPayload);
      return;
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unknown event type: ${String(_exhaustive)}`);
    }
  }
}

/** Dispatch booking side-effects immediately (emails, calendar sync). */
export const eventBus = {
  emit: (type: EventType, payload: unknown): void => {
    void executeEvent(type, payload).catch((err: unknown) => {
      logger.error({ err, type }, '[EventBus] Failed to process event');
    });
  },
};

export function initEventBus(): void {
  logger.info('[EventBus] Immediate dispatch enabled for booking notifications');
}

/** @deprecated Background worker removed — kept for server startup compatibility */
export function startBackgroundJobWorker(_intervalMs = 5_000): NodeJS.Timeout {
  return setInterval(() => undefined, 60_000);
}

/** @deprecated Use eventBus.emit */
export function publishEvent(_type: EventType, _payload: unknown): void {
  logger.warn('[EventBus] publishEvent is deprecated — use eventBus.emit');
}

/** @deprecated Background worker removed */
export function processBackgroundJobs(_batchSize = 10): number {
  return 0;
}
