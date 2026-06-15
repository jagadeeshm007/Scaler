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
import type { Booking, PublicEventType, Slot } from '@/types';

interface MonthViewProps {
  eventType: PublicEventType;
  timezone: string;
  layout: BookingLayout;
  onLayoutChange: (l: BookingLayout) => void;
  selectedSlot: Slot | null;
  onSlotSelect: (slot: Slot | null) => void;
  rescheduleBooking?: Booking;
}

export function MonthView({
  eventType,
  timezone,
  selectedSlot,
  onSlotSelect,
  rescheduleBooking,
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
  const availableOverrides = blockedData?.availableOverrides ?? [];

  const availableSlots = slots?.filter((s) => s.available) ?? [];

  return (
    <LazyMotion features={domAnimation}>
      {/* ── Calendar panel: hidden when form is open ── */}
      <AnimatePresence initial={false}>
        {!selectedSlot && (
          <m.div
            key="cal"
            initial={reducedMotion ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
            transition={{ duration: 0.32, ease: [0, 0, 0.2, 1] }}
            className="flex flex-1 flex-col items-center border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-8"
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
                availableOverrides={availableOverrides}
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ── Slot / Form section ── */}
      <section
        className={cn(
          'flex flex-col transition-[width] duration-500 ease-[cubic-bezier(0,0,0.2,1)]',
          selectedSlot ? 'w-full' : 'w-full overflow-hidden lg:w-[340px] lg:shrink-0',
        )}
      >
        {/* Panel header — hidden when the booking form is open */}
        {!selectedSlot && (
          <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {dateStr ? formatDateLabel(dateStr) : 'Select a date'}
            </span>
            <ToggleGroup
              value={[fmt]}
              onValueChange={(v) => {
                if (v[0]) void setFmt(v[0] as '12h' | '24h');
              }}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              <ToggleGroupItem value="12h" aria-label="12-hour">
                12h
              </ToggleGroupItem>
              <ToggleGroupItem value="24h" aria-label="24-hour">
                24h
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}

        {/* Animated content: slots list (bounded) ↔ booking form (grows card) */}
        <div className="overflow-x-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            {!selectedSlot ? (
              <m.div
                key="slots"
                initial={reducedMotion ? false : { opacity: 0, x: '-60%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '-60%' }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="max-h-[480px] overflow-y-auto scrollbar-none p-5">
                  {!dateStr && (
                    <p className="py-8 text-center text-sm text-muted-foreground">
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
                            className="w-full justify-center border-border bg-card text-sm font-medium text-foreground transition-colors duration-150 hover:!border-foreground hover:!bg-card hover:!text-foreground"
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
                initial={reducedMotion ? false : { opacity: 0, x: '60%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '60%' }}
                transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
                className="flex justify-center px-6 py-4 lg:px-12"
              >
                <BookingForm
                  eventType={eventType}
                  slot={selectedSlot}
                  timezone={timezone}
                  onBack={() => onSlotSelect(null)}
                  rescheduleBooking={rescheduleBooking}
                  className="w-full max-w-sm"
                />
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </LazyMotion>
  );
}
