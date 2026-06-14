'use client';

import { CalendarClock } from 'lucide-react';

import { ScheduleCard } from '@/components/availability/schedule-card';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAvailability } from '@/hooks/queries/use-availability';

export function ScheduleList() {
  const { data: schedules, isLoading, isError } = useAvailability();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Failed to load schedules"
        description="Something went wrong while fetching your availability schedules."
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Availability"
        description="Configure times when you are available for bookings."
      />

      {!schedules?.length ? (
        <EmptyState
          icon={CalendarClock}
          title="No schedules yet"
          description="Create a schedule to define when you're available for meetings."
        />
      ) : (
        <Card className="overflow-hidden border-border bg-card p-0">
          {schedules.map((schedule) => (
            <ScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </Card>
      )}
    </>
  );
}
