'use client';

import { CalendarClock } from 'lucide-react';

import { ScheduleCard } from '@/components/availability/schedule-card';
import { EmptyState } from '@/components/shared/empty-state';
import { PageSection, SURFACE } from '@/components/shared/page-section';
import { Skeleton } from '@/components/ui/skeleton';
import { useAvailability } from '@/hooks/queries/use-availability';
import { cn } from '@/lib/utils';

export function ScheduleList() {
  const { data: schedules, isLoading, isError } = useAvailability();

  if (isLoading) {
    return (
      <PageSection className="flex min-h-full flex-1 flex-col pb-24 md:pb-6">
        <div className="space-y-3 px-4 pt-6 md:px-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </PageSection>
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
    <PageSection className="flex min-h-full flex-1 flex-col pb-24 md:pb-6">
      <div className="hidden shrink-0 items-start justify-between gap-4 px-6 pt-6 pb-5 md:flex">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Availability</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Configure times when you are available for bookings.
          </p>
        </div>
      </div>

      {/* Mobile Title */}
      <div className="shrink-0 px-4 pt-4 pb-3 md:hidden">
        <h1 className="text-xl font-semibold text-foreground">Availability</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Configure times when you are available for bookings.
        </p>
      </div>

      <div
        className={cn(
          'mx-4 mb-4 shrink-0 overflow-hidden rounded-xl border transition-all duration-300 ease-in-out md:mx-6 md:mb-6',
          SURFACE.sectionBorder,
          SURFACE.innerList,
        )}
      >
        {!schedules?.length ? (
          <EmptyState
            icon={CalendarClock}
            title="No schedules yet"
            description="Create a schedule to define when you're available for meetings."
          />
        ) : (
          <div className="divide-y divide-border">
            {schedules.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        )}
      </div>
    </PageSection>
  );
}
