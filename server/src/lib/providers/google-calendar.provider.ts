import { logger } from '../logger';

import type { CalendarProvider, BookingWithRelations } from './calendar-provider.interface';

export class GoogleCalendarProvider implements CalendarProvider {
  async createEvent(
    _token: string,
    booking: BookingWithRelations,
  ): Promise<{ success: boolean; providerEventId?: string }> {
    await Promise.resolve();
    // Stub for Google API Call
    logger.info(`Mock: Created Google Calendar Event for Booking ${booking.id}`);
    return { success: true, providerEventId: 'mock-google-id' };
  }
}
