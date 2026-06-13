'use client';

import { ScheduleList } from '@/components/availability/schedule-list';

export default function AvailabilityPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <ScheduleList />
    </main>
  );
}
