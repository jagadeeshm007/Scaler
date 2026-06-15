import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/constants/api';
import { bookingSchema, type Booking } from '@bolt/types';
import { z } from 'zod';

export async function fetchBookings() {
  return api
    .get<Booking[]>(ENDPOINTS.bookings.list)
    .then((res) => z.array(bookingSchema).parse(res));
}

export async function fetchBooking(id: string) {
  return api.get<Booking>(ENDPOINTS.bookings.byId(id)).then((res) => bookingSchema.parse(res));
}

export async function fetchPublicBooking(uid: string) {
  return api
    .get<Booking>(ENDPOINTS.publicBookings.byUid(uid))
    .then((res) => bookingSchema.parse(res));
}

export async function createBooking(data: unknown, idempotencyKey: string) {
  return api
    .post<Booking>(ENDPOINTS.bookings.create, data, { idempotencyKey })
    .then((res) => bookingSchema.parse(res));
}

export async function updateBookingStatus(
  id: string,
  data: { status: string; cancellation_reason?: string | null },
  timezone?: string,
) {
  const url = timezone
    ? `${ENDPOINTS.bookings.status(id)}?timezone=${encodeURIComponent(timezone)}`
    : ENDPOINTS.bookings.status(id);
  return api.patch<Booking>(url, data).then((res) => bookingSchema.parse(res));
}

export async function updatePublicBookingStatus(
  uid: string,
  data: { status: string; cancellation_reason?: string | null },
  timezone?: string,
) {
  const url = timezone
    ? `${ENDPOINTS.publicBookings.status(uid)}?timezone=${encodeURIComponent(timezone)}`
    : ENDPOINTS.publicBookings.status(uid);
  return api.patch<Booking>(url, data).then((res) => bookingSchema.parse(res));
}
