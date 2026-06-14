'use client';

import { BookingList } from '@/components/bookings/booking-list';

export default function BookingsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <BookingList />
    </main>
  );
}
