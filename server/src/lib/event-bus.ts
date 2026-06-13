import { EventEmitter } from 'events';

import { CalendarService } from '../services/calendar.service';
import { EmailService } from '../services/email.service';
import type { BookingWithRelations } from './providers/calendar-provider.interface';
import { logger } from './logger';

class ApplicationEventBus extends EventEmitter {}

export const eventBus = new ApplicationEventBus();

// Event Definitions
export const EVENTS = {
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_RESCHEDULED: 'BOOKING_RESCHEDULED',
};

// Initialize listeners
export function initEventBus(): void {
  eventBus.on(
    EVENTS.BOOKING_CREATED,
    ({ booking, timezone }: { booking: BookingWithRelations; timezone: string }) => {
      logger.info(`[EventBus] Processing BOOKING_CREATED for ${booking.id}`);

      void Promise.allSettled([
        EmailService.sendBookingConfirmation(booking, timezone),
        CalendarService.createCalendarEvent(booking),
      ])
        .then((results) => {
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              const serviceName = index === 0 ? 'EmailService' : 'CalendarService';
              logger.error(
                { err: result.reason },
                `[EventBus] ${serviceName} failed for booking ${booking.id}`,
              );
            }
          });
        })
        .catch((err: unknown) => {
          logger.error({ err }, '[EventBus] Unhandled exception in BOOKING_CREATED handlers');
        });
    },
  );

  eventBus.on(
    EVENTS.BOOKING_CANCELLED,
    ({
      booking,
      timezone,
      isHost,
    }: {
      booking: BookingWithRelations;
      timezone: string;
      isHost: boolean;
    }) => {
      logger.info(`[EventBus] Processing BOOKING_CANCELLED for ${booking.id}`);

      void EmailService.sendBookingCancellation(booking, timezone, isHost).catch((err: unknown) => {
        logger.error({ err }, '[EventBus] EmailService failed for booking cancellation');
      });
      // In a real app, delete/cancel calendar event via CalendarService here
    },
  );

  // Additional events can be registered here...

  logger.info('Application Event Bus initialized');
}
