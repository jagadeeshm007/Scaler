'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BOOKING_STATUS_TABS, type BookingStatusTab } from '@/lib/constants';
import { cn } from '@/lib/utils';

const statusParser = parseAsStringLiteral(BOOKING_STATUS_TABS).withDefault('upcoming');

const TAB_LABELS: Record<BookingStatusTab, string> = {
  upcoming: 'Upcoming',
  unconfirmed: 'Unconfirmed',
  recurring: 'Recurring',
  past: 'Past',
  cancelled: 'Cancelled',
};

interface BookingFiltersProps {
  className?: string;
}

export function BookingFilters({ className }: BookingFiltersProps) {
  const [status, setStatus] = useQueryState('status', statusParser);

  return (
    <Tabs
      value={status}
      onValueChange={(value) => void setStatus(value as BookingStatusTab)}
      className={cn('w-full', className)}
    >
      <TabsList className="h-auto w-full justify-start gap-0 border-b border-border bg-transparent p-0">
        {BOOKING_STATUS_TABS.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            {TAB_LABELS[tab]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export function useBookingFilter() {
  return useQueryState('status', statusParser);
}
