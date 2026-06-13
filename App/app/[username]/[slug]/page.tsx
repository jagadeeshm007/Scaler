import { notFound } from 'next/navigation';

import { CalendarPicker } from '@/components/booking-page/calendar-picker';
import { EventInfoPanel } from '@/components/booking-page/event-info-panel';
import { TimeSlotList } from '@/components/booking-page/time-slot-list';
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
    <div className="flex min-h-screen flex-col bg-neutral-950 lg:flex-row">
      <EventInfoPanel
        eventType={eventType}
        host={eventType.user}
        timezone={eventType.user.timezone}
      />
      <CalendarPicker />
      <TimeSlotList eventType={eventType} />
    </div>
  );
}
