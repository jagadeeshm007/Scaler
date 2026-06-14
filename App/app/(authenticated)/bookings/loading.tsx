import { BookingSkeleton } from '@/components/bookings/booking-skeleton';

export default function BookingsLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-32 animate-pulse rounded-md bg-neutral-800" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-neutral-800" />
      </div>
      <div className="mb-6 flex gap-4 border-b border-border pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 w-20 animate-pulse rounded-md bg-neutral-800" />
        ))}
      </div>
      <BookingSkeleton />
    </main>
  );
}
