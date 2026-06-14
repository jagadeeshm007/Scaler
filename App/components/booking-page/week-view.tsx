'use client';

import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  getHours,
  getMinutes,
  isToday,
  parseISO,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useWeekSlots } from '@/hooks/queries/use-week-slots';
import {
  formatColumnDayHeader,
  formatHourLabel,
  formatTimeSlot,
  formatWeekRange,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import type { BookingLayout } from '@/components/booking-page/booking-view-switcher';
import type { PublicEventType, Slot } from '@/types';

const GRID_START_HOUR = 5;
const GRID_END_HOUR = 22;
const HOUR_HEIGHT = 56; // px per hour

function dateToStr(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function slotToGridPosition(slot: Slot): { top: number; height: number } {
  const start = parseISO(slot.startTime);
  const end = parseISO(slot.endTime);
  const startH = getHours(start) + getMinutes(start) / 60;
  const endH = getHours(end) + getMinutes(end) / 60;
  const top = (startH - GRID_START_HOUR) * HOUR_HEIGHT;
  const height = Math.max((endH - startH) * HOUR_HEIGHT, 20);
  return { top, height };
}

interface WeekViewProps {
  eventType: PublicEventType;
  timezone: string;
  layout: BookingLayout;
  onLayoutChange: (l: BookingLayout) => void;
  onSlotSelect: (slot: Slot) => void;
}

export function WeekView({
  eventType,
  timezone,
  layout,
  onLayoutChange,
  onSlotSelect,
}: WeekViewProps) {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [fmt, setFmt] = useQueryState(
    'fmt',
    parseAsStringLiteral(['12h', '24h'] as const).withDefault('12h'),
  );
  const use24h = fmt === '24h';
  const gridRef = useRef<HTMLDivElement>(null);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dateStrs = weekDates.map(dateToStr);

  const { slotsByDate, isLoading } = useWeekSlots({
    eventTypeId: eventType.id,
    dates: dateStrs,
    timezone,
  });

  const today = startOfWeek(new Date(), { weekStartsOn: 1 });
  const isCurrentWeek = dateToStr(weekStart) === dateToStr(today);
  const totalHours = GRID_END_HOUR - GRID_START_HOUR;
  const gridHeight = totalHours * HOUR_HEIGHT;

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

      {/* Week grid */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Day headers */}
        <div className="flex border-b border-border">
          {/* Time gutter */}
          <div className="w-14 shrink-0" />
          {weekDates.map((date, i) => {
            const { abbr, day } = formatColumnDayHeader(date);
            const todayDay = isToday(date);
            return (
              <div
                key={dateStrs[i]}
                className="flex flex-1 flex-col items-center border-l border-border py-2"
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
            );
          })}
        </div>

        {/* Scrollable grid body */}
        <div className="flex min-h-0 flex-1 overflow-y-auto" ref={gridRef}>
          <div className="relative flex w-full" style={{ height: gridHeight }}>
            {/* Hour labels */}
            <div className="sticky left-0 z-10 w-14 shrink-0 bg-background">
              {Array.from({ length: totalHours }, (_, h) => (
                <div
                  key={h}
                  className="relative border-b border-border/50"
                  style={{ height: HOUR_HEIGHT }}
                >
                  <span className="absolute -top-2 right-2 text-xs text-neutral-600">
                    {formatHourLabel(GRID_START_HOUR + h, use24h)}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDates.map((date, i) => {
              const dateStr = dateStrs[i]!;
              const daySlots = slotsByDate[dateStr] ?? [];

              return (
                <div
                  key={dateStr}
                  className="relative flex-1 border-l border-border"
                  style={{ height: gridHeight }}
                >
                  {/* Hour grid lines */}
                  {Array.from({ length: totalHours }, (_, h) => (
                    <div
                      key={h}
                      className="absolute inset-x-0 border-b border-border/50"
                      style={{ top: h * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    />
                  ))}

                  {/* Hatched unavailable background */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.015) 4px, rgba(255,255,255,0.015) 5px)',
                    }}
                  />

                  {/* Loading shimmer */}
                  {isLoading && (
                    <div className="absolute inset-x-1 top-4 h-20 animate-pulse rounded bg-accent/60" />
                  )}

                  {/* Available slot blocks */}
                  {!isLoading &&
                    daySlots.map((slot) => {
                      const { top, height } = slotToGridPosition(slot);
                      if (top < 0 || top > gridHeight) return null;
                      return (
                        <button
                          key={slot.startTime}
                          onClick={() => onSlotSelect(slot)}
                          className="absolute inset-x-1 z-10 overflow-hidden rounded bg-green-900/50 px-1.5 py-0.5 text-left transition-colors hover:bg-green-800/70"
                          style={{ top, height: Math.max(height, 18) }}
                          title={formatTimeSlot(slot.startTime, timezone, use24h)}
                        >
                          <span className="block truncate text-[10px] font-medium text-green-300">
                            {formatTimeSlot(slot.startTime, timezone, use24h)}
                          </span>
                        </button>
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
