'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

import { BookingForm } from '@/components/booking-page/booking-form';
import { SlotSkeleton } from '@/components/booking-page/slot-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSlots } from '@/hooks/queries/use-slots';
import { useTimezone } from '@/hooks/use-timezone';
import { formatDateLabel, formatTimeSlot } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PublicEventType, Slot } from '@/types';

interface TimeSlotListProps {
  eventType: PublicEventType;
  className?: string;
}

export function TimeSlotList({ eventType, className }: TimeSlotListProps) {
  const [date] = useQueryState('date', parseAsString);
  const [fmt, setFmt] = useQueryState(
    'fmt',
    parseAsStringLiteral(['12h', '24h'] as const).withDefault('12h'),
  );
  const { timezone } = useTimezone(eventType.user.timezone);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const reducedMotion = useReducedMotion();

  const {
    data: slots,
    isLoading,
    isError,
  } = useSlots({
    eventTypeId: eventType.id,
    date,
    timezone,
    enabled: Boolean(date),
  });

  const availableSlots = slots?.filter((slot) => slot.available) ?? [];
  const use24h = fmt === '24h';

  if (selectedSlot && date) {
    return (
      <BookingForm
        eventType={eventType}
        slot={selectedSlot}
        timezone={timezone}
        onBack={() => setSelectedSlot(null)}
        className={className}
      />
    );
  }

  return (
    <section className={cn('flex w-full flex-col lg:w-[280px]', className)}>
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <span className="text-sm font-medium text-white">
          {date ? formatDateLabel(date) : 'Select a date'}
        </span>
        <ToggleGroup
          type="single"
          value={fmt}
          onValueChange={(value) => {
            if (value) void setFmt(value as '12h' | '24h');
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="12h" aria-label="12-hour format">
            12h
          </ToggleGroupItem>
          <ToggleGroupItem value="24h" aria-label="24-hour format">
            24h
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-4">
        {!date && (
          <p className="py-8 text-center text-sm text-neutral-500">
            Select a date to see available times
          </p>
        )}

        {date && isLoading && <SlotSkeleton />}

        {date && isError && (
          <p className="py-8 text-center text-sm text-red-500">Failed to load time slots</p>
        )}

        {date && !isLoading && !isError && availableSlots.length === 0 && (
          <EmptyState
            icon={Clock}
            title="No available times"
            description="No slots available on this date. Please select another day."
          />
        )}

        {date && !isLoading && !isError && availableSlots.length > 0 && (
          <LazyMotion features={domAnimation}>
            <div className="flex flex-col gap-2">
              {availableSlots.map((slot, index) => (
                <m.div
                  key={slot.startTime}
                  initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: reducedMotion ? 0 : index * 0.03 }}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-neutral-700 bg-transparent hover:bg-neutral-800"
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <span className="size-2 shrink-0 rounded-full bg-green-500" />
                    {formatTimeSlot(slot.startTime, timezone, use24h)}
                  </Button>
                </m.div>
              ))}
            </div>
          </LazyMotion>
        )}
      </div>
    </section>
  );
}
