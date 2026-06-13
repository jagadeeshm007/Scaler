import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { CalendarProviderFactory } from '../lib/providers/calendar-provider.factory';
import { decrypt } from '../utils/encryption';

import type { BookingWithRelations } from '../lib/providers/calendar-provider.interface';

export class CalendarService {
  /**
   * Dispatch calendar creation event to all connected calendar providers for the host
   */
  static async createCalendarEvent(booking: BookingWithRelations): Promise<unknown> {
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
        const provider = CalendarProviderFactory.getProvider(cred.app.slug);

        if (!provider) {
          return;
        }

        try {
          return await provider.createEvent(token, booking);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`Calendar sync failed for ${cred.app.slug}: ${message}`);
        }
      });

      const results = await Promise.allSettled(promises);

      // Log failures and record them in the FailedJob table for retry
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const appSlug = credentials[index].app.slug;
          logger.error({ err: result.reason }, `Failed to sync calendar event to ${appSlug}`);

          // Fire and forget: log to database
          prisma.failedJob
            .create({
              data: {
                type: 'CALENDAR_SYNC',
                payload: JSON.stringify({ bookingId: booking.id, appSlug }),
                error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
                next_retry_at: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 mins
              },
            })
            .catch((err: unknown) => {
              logger.error({ err }, 'Failed to record failed job');
            });
        }
      });
    } catch (error) {
      logger.error({ err: error }, 'Critical error in CalendarService.createCalendarEvent');
      // Guarantee booking persistence
    }
  }
}
