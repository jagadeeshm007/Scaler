import { logger } from '../logger';

import type { CalendarProvider, BookingWithRelations } from './calendar-provider.interface';

export class MicrosoftCalendarProvider implements CalendarProvider {
  async createEvent(
    _token: string,
    booking: BookingWithRelations,
  ): Promise<{ success: boolean; providerEventId?: string }> {
    await Promise.resolve();
    // Stub for Microsoft API Call
    logger.info(`Mock: Created Microsoft Calendar Event for Booking ${booking.id}`);
    return { success: true, providerEventId: 'mock-microsoft-id' };
  }
}
