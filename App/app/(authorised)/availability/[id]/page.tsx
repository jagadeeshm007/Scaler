'use client';

import { use } from 'react';

import { ScheduleEditor } from '@/components/availability/schedule-editor';

interface AvailabilityEditPageProps {
  params: Promise<{ id: string }>;
}

export default function AvailabilityEditPage({ params }: AvailabilityEditPageProps) {
  const { id } = use(params);

  return (
    <main className="px-4 py-8 sm:px-6">
      <ScheduleEditor scheduleId={id} />
    </main>
  );
}
