import type { Booking, EventType, User } from '@prisma/client';

export type BookingWithRelations = Booking & {
  event_type: EventType;
  host: User;
};

export interface CalendarProvider {
  createEvent(
    token: string,
    booking: BookingWithRelations,
  ): Promise<{ success: boolean; providerEventId?: string }>;
}
