import { isPast, parseISO } from 'date-fns';

import type { BookingStatusTab } from '@/lib/constants';
import type { Booking } from '@/types';

export function filterBookingsByTab(bookings: Booking[], tab: BookingStatusTab): Booking[] {
  const now = new Date();

  switch (tab) {
    case 'upcoming':
      return bookings.filter(
        (b) =>
          (b.status === 'CONFIRMED' || b.status === 'PENDING') && !isPast(parseISO(b.end_time)),
      );
    case 'unconfirmed':
      return bookings.filter((b) => b.status === 'PENDING' && !isPast(parseISO(b.end_time)));
    case 'recurring':
      return [];
    case 'past':
      return bookings.filter((b) => b.status !== 'CANCELLED' && isPast(parseISO(b.end_time)));
    case 'cancelled':
      return bookings.filter((b) => b.status === 'CANCELLED');
    default:
      return bookings;
  }
}
