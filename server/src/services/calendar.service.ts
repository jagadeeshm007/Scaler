import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { Booking, EventType, User } from '@prisma/client';
import { decrypt } from '../utils/encryption';

type BookingWithRelations = Booking & {
  event_type: EventType;
  host: User;
};

export class CalendarService {
  /**
   * Dispatch calendar creation event to all connected calendar providers for the host
   */
  static async createCalendarEvent(booking: BookingWithRelations) {
    try {
      const credentials = await prisma.credential.findMany({
        where: { user_id: booking.host_id },
        include: { app: true },
      });

      if (credentials.length === 0) {
        return; // No connected calendars
      }

      // We wrap calendar dispatches in a Promise.allSettled so one failure doesn't block others
      const promises = credentials.map(async (cred) => {
        const token = decrypt(cred.access_token_encrypted);

        switch (cred.app.slug) {
          case 'google':
            return this.createGoogleEvent(token, booking);
          case 'microsoft':
            return this.createMicrosoftEvent(token, booking);
          default:
            logger.warn(`Unsupported calendar provider: ${cred.app.slug}`);
        }
      });

      const results = await Promise.allSettled(promises);

      // Log failures but do not throw, as we guarantee booking persistence even if APIs fail
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          logger.error(
            { err: result.reason },
            `Failed to sync calendar event to ${credentials[index].app.slug}`,
          );
        }
      });
    } catch (error) {
      logger.error({ err: error }, 'Critical error in CalendarService.createCalendarEvent');
      // Guarantee booking persistence
    }
  }

  private static async createGoogleEvent(accessToken: string, booking: BookingWithRelations) {
    // Stub for Google API Call
    // In reality, we'd use axios or googleapis to POST to https://www.googleapis.com/calendar/v3/calendars/primary/events
    logger.info(`Mock: Created Google Calendar Event for Booking ${booking.id}`);
    return { success: true, providerEventId: 'mock-google-id' };
  }

  private static async createMicrosoftEvent(accessToken: string, booking: BookingWithRelations) {
    // Stub for MS Graph API Call
    // POST https://graph.microsoft.com/v1.0/me/events
    logger.info(`Mock: Created MS Outlook Event for Booking ${booking.id}`);
    return { success: true, providerEventId: 'mock-ms-id' };
  }
}
