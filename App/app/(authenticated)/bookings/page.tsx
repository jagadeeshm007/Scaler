import { verifySession } from '@/lib/dal';
import { BookingList } from '@/components/bookings/booking-list';

export default async function BookingsPage() {
  await verifySession();
  return <BookingList />;
}
