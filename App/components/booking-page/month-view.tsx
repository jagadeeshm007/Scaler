'use client';

import { Clock } from 'lucide-react';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { format, startOfToday } from 'date-fns';
import { useState } from 'react';

import { BookingCalendar } from '@/components/booking-page/booking-calendar';
import { BookingForm } from '@/components/booking-page/booking-form';
import { SlotSkeleton } from '@/components/booking-page/slot-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSlots } from '@/hooks/queries/use-slots';
import { useBlockedDates } from '@/hooks/queries/use-blocked-dates';
import { formatDateLabel, formatTimeSlot } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { BookingLayout } from '@/components/booking-page/booking-view-switcher';
import type { PublicEventType, Slot } from '@/types';

interface MonthViewProps {
  eventType: PublicEventType;
  timezone: string;
  layout: BookingLayout;
  onLayoutChange: (l: BookingLayout) => void;
  selectedSlot: Slot | null;
  onSlotSelect: (slot: Slot | null) => void;
}

export function MonthView({
  eventType,
  timezone,
  layout,
  onLayoutChange,
  selectedSlot,
  onSlotSelect,
}: MonthViewProps) {
  const [dateStr, setDateStr] = useQueryState('date', parseAsString);
  const [fmt, setFmt] = useQueryState(
    'fmt',
    parseAsStringLiteral(['12h', '24h'] as const).withDefault('12h'),
  );
  const reducedMotion = useReducedMotion();

  const [calendarMonth, setCalendarMonth] = useState<Date>(() =>
    dateStr ? new Date(`${dateStr}T00:00:00`) : new Date(),
  );

  const selected = dateStr ? new Date(`${dateStr}T00:00:00`) : undefined;
  const use24h = fmt === '24h';

  const {
    data: slots,
    isLoading,
    isError,
  } = useSlots({
    eventTypeId: eventType.id,
    date: dateStr,
    timezone,
    enabled: Boolean(dateStr),
  });

  const { data: blockedData } = useBlockedDates({
    username: eventType.user.username,
    month: format(calendarMonth, 'yyyy-MM'),
  });
  const blockedDates = blockedData?.blocked ?? [];
  const nonWorkingDays = blockedData?.nonWorkingDays ?? [];

  const availableSlots = slots?.filter((s) => s.available) ?? [];

  return (
    <LazyMotion features={domAnimation}>
      {/* ── Calendar panel: hidden when form is open ── */}
      <AnimatePresence initial={false}>
        {!selectedSlot && (
          <m.div
            key="cal"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex flex-1 flex-col items-center border-b border-neutral-800 p-4 lg:border-b-0 lg:border-r lg:p-8"
          >
            <div className="w-full max-w-[380px]">
              <BookingCalendar
                selected={selected}
                onSelect={(date) => {
                  onSlotSelect(null);
                  if (!date) return void setDateStr(null);
                  const yyyy = date.getFullYear();
                  const mm = String(date.getMonth() + 1).padStart(2, '0');
                  const dd = String(date.getDate()).padStart(2, '0');
                  void setDateStr(`${yyyy}-${mm}-${dd}`);
                }}
                disabled={(date) => date < startOfToday()}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                blockedDates={blockedDates}
                nonWorkingDays={nonWorkingDays}
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ── Slot / Form section ── */}
      <section
        className={cn(
          'flex flex-col transition-[width] duration-300',
          selectedSlot
            ? 'w-full'
            : 'w-full overflow-hidden lg:w-[340px] lg:shrink-0',
        )}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between gap-2 border-b border-neutral-800 px-5 py-4">
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
            {dateStr ? formatDateLabel(dateStr) : 'Select a date'}
          </span>
          <ToggleGroup
            type="single"
            value={fmt}
            onValueChange={(v) => { if (v) void setFmt(v as '12h' | '24h'); }}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <ToggleGroupItem value="12h" aria-label="12-hour">12h</ToggleGroupItem>
            <ToggleGroupItem value="24h" aria-label="24-hour">24h</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Animated content: slots list (bounded) ↔ booking form (grows card) */}
        <AnimatePresence initial={false} mode="wait">
          {!selectedSlot ? (
            <m.div
              key="slots"
              initial={reducedMotion ? false : { opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
            >
              <div className="max-h-[480px] overflow-y-auto scrollbar-none p-5">
                {!dateStr && (
                  <p className="py-8 text-center text-sm text-neutral-500">
                    Select a date to see available times
                  </p>
                )}
                {dateStr && isLoading && <SlotSkeleton />}
                {dateStr && isError && (
                  <p className="py-8 text-center text-sm text-red-500">
                    Failed to load time slots
                  </p>
                )}
                {dateStr && !isLoading && !isError && availableSlots.length === 0 && (
                  <EmptyState
                    icon={Clock}
                    title="No available times"
                    description="No slots available on this date."
                  />
                )}
                {dateStr && !isLoading && !isError && availableSlots.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {availableSlots.map((slot, index) => (
                      <m.div
                        key={slot.startTime}
                        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: reducedMotion ? 0 : index * 0.03 }}
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-center border-neutral-700 bg-neutral-900 text-sm font-medium text-white transition-colors duration-150 hover:!border-white hover:!bg-neutral-900 hover:!text-white"
                          onClick={() => onSlotSelect(slot)}
                        >
                          <span className="mr-2 size-2 shrink-0 rounded-full bg-green-500" />
                          {formatTimeSlot(slot.startTime, timezone, use24h)}
                        </Button>
                      </m.div>
                    ))}
                  </div>
                )}
              </div>
            </m.div>
          ) : (
            <m.div
              key="form"
              initial={reducedMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="flex justify-center px-6 py-4 lg:px-12"
            >
              <BookingForm
                eventType={eventType}
                slot={selectedSlot}
                timezone={timezone}
                onBack={() => onSlotSelect(null)}
                className="w-full max-w-sm"
              />
            </m.div>
          )}
        </AnimatePresence>
      </section>
    </LazyMotion>
  );
}
