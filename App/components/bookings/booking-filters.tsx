'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useEffect } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BOOKING_STATUS_TABS, type BookingStatusTab } from '@/lib/constants/booking';
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

  useEffect(() => {
    // Small delay to ensure the DOM is fully updated with the active state
    const timeoutId = setTimeout(() => {
      const activeTab = document
        .getElementById('booking-tabs-list')
        ?.querySelector('[data-state="active"]');
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [status]);

  return (
    <div className={cn('relative w-full max-w-full md:w-auto', className)}>
      {/* Right fade mask for scrollable area on mobile */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent md:hidden" />
      <Tabs
        value={status}
        onValueChange={(value) => void setStatus(value as BookingStatusTab)}
        className="w-full max-w-full"
      >
        <TabsList
          id="booking-tabs-list"
          className="flex h-auto w-full max-w-full justify-start gap-1 overflow-x-auto overflow-y-hidden bg-transparent p-0 pr-8 [&::-webkit-scrollbar]:hidden md:pr-0"
        >
          {BOOKING_STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-md border border-transparent px-3 py-1.5 text-sm font-medium transition-colors data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-muted/50 hover:text-foreground text-muted-foreground after:hidden"
            >
              {TAB_LABELS[tab]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

export function useBookingFilter() {
  return useQueryState('status', statusParser);
}
