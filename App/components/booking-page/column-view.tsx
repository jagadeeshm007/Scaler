'use client';

import { addWeeks, format, startOfWeek, addDays, endOfWeek, isToday, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useState } from 'react';

import { SlotSkeleton } from '@/components/booking-page/slot-skeleton';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useWeekSlots } from '@/hooks/queries/use-week-slots';
import { formatColumnDayHeader, formatTimeSlot, formatWeekRange } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { BookingLayout } from '@/components/booking-page/booking-view-switcher';
import type { PublicEventType, Slot } from '@/types';

interface ColumnViewProps {
  eventType: PublicEventType;
  timezone: string;
  layout: BookingLayout;
  onLayoutChange: (l: BookingLayout) => void;
  onSlotSelect: (slot: Slot) => void;
}

function dateToStr(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function ColumnView({
  eventType,
  timezone,
  layout,
  onLayoutChange,
  onSlotSelect,
}: ColumnViewProps) {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [fmt, setFmt] = useQueryState(
    'fmt',
    parseAsStringLiteral(['12h', '24h'] as const).withDefault('12h'),
  );
  const use24h = fmt === '24h';

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const dateStrs = weekDates.map(dateToStr);

  const { slotsByDate, isLoading } = useWeekSlots({
    eventTypeId: eventType.id,
    dates: dateStrs,
    timezone,
  });

  const today = startOfWeek(new Date(), { weekStartsOn: 1 });
  const isCurrentWeek = dateToStr(weekStart) === dateToStr(today);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Navigation bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={() => setWeekStart((d) => subWeeks(d, 1))}
            aria-label="Previous week"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={() => setWeekStart((d) => addWeeks(d, 1))}
            aria-label="Next week"
          >
            <ChevronRight className="size-4" />
          </Button>
          <span className="text-sm font-medium text-foreground">
            {formatWeekRange(weekStart, weekEnd)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isCurrentWeek && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 border-border text-xs"
              onClick={() => setWeekStart(today)}
            >
              Today
            </Button>
          )}
          <ToggleGroup
            type="single"
            value={fmt}
            onValueChange={(v) => {
              if (v) void setFmt(v as '12h' | '24h');
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="12h" aria-label="12h">
              12h
            </ToggleGroupItem>
            <ToggleGroupItem value="24h" aria-label="24h">
              24h
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Day columns */}
      <div className="flex min-h-0 flex-1 overflow-x-auto">
        <div className="flex min-w-full divide-x divide-border">
          {weekDates.map((date, i) => {
            const dateStr = dateStrs[i]!;
            const daySlots = slotsByDate[dateStr] ?? [];
            const { abbr, day } = formatColumnDayHeader(date);
            const todayDay = isToday(date);

            return (
              <div key={dateStr} className="flex min-w-[120px] flex-1 flex-col">
                {/* Day header */}
                <div
                  className={cn(
                    'border-b border-border px-3 py-2 text-center',
                    todayDay && 'bg-card',
                  )}
                >
                  <p className="text-xs font-medium text-muted-foreground">{abbr}</p>
                  <p
                    className={cn(
                      'mt-0.5 inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold',
                      todayDay ? 'bg-neutral-100 text-neutral-900' : 'text-foreground',
                    )}
                  >
                    {day}
                  </p>
                </div>

                {/* Slots */}
                <div className="flex flex-col gap-1.5 overflow-y-auto p-2">
                  {isLoading && (
                    <div className="flex flex-col gap-1.5">
                      {Array.from({ length: 4 }).map((_, k) => (
                        <div key={k} className="h-8 animate-pulse rounded-md bg-accent" />
                      ))}
                    </div>
                  )}
                  {!isLoading && daySlots.length === 0 && (
                    <p className="py-4 text-center text-xs text-neutral-600">No slots</p>
                  )}
                  {!isLoading &&
                    daySlots.map((slot) => (
                      <button
                        key={slot.startTime}
                        onClick={() => onSlotSelect(slot)}
                        className="flex w-full items-center gap-1.5 rounded-md border border-border bg-transparent px-2 py-1.5 text-xs text-card-foreground transition-colors hover:border-neutral-500 hover:bg-accent"
                      >
                        <span className="size-1.5 shrink-0 rounded-full bg-green-500" />
                        {formatTimeSlot(slot.startTime, timezone, use24h)}
                      </button>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
