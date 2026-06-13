import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { BookingPageShell } from '@/components/booking-page/booking-page-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { serverFetch } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import type { PublicEventType } from '@/types';

interface BookingPageProps {
  params: Promise<{ username: string; slug: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { username, slug } = await params;

  let eventType: PublicEventType;
  try {
    eventType = await serverFetch<PublicEventType>(ENDPOINTS.eventTypes.public(username, slug));
  } catch {
    notFound();
  }

  return (
    <Suspense fallback={<Skeleton className="min-h-screen w-full bg-neutral-950" />}>
      <BookingPageShell eventType={eventType} />
    </Suspense>
  );
}
