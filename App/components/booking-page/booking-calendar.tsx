'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, useDayPicker, type DayButton, type CalendarMonth, type Matcher } from 'react-day-picker';

import { cn } from '@/lib/utils';
import type { BlockedDate } from '@/types';

/* ─── Contexts ───────────────────────────────────────────────────────── */

const BlockedDatesContext = React.createContext<Map<string, string>>(new Map());
/** Set of day_of_week numbers (0=Sun…6=Sat) that have no schedule */
const NonWorkingDaysContext = React.createContext<Set<number>>(new Set());

/* ─── Month caption with integrated < > navigation ─────────────────── */

function BookingMonthCaption({ calendarMonth }: { calendarMonth: CalendarMonth }) {
  const { goToMonth, previousMonth, nextMonth } = useDayPicker();

  return (
    <div className="mb-5 flex items-center justify-between px-1">
      <p className="text-base">
        <span className="font-semibold text-white">{format(calendarMonth.date, 'MMMM')}</span>
        {' '}
        <span className="font-normal text-neutral-400">{format(calendarMonth.date, 'yyyy')}</span>
      </p>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          aria-label="Go to previous month"
          disabled={!previousMonth}
          onClick={() => previousMonth && goToMonth(previousMonth)}
          className={cn(
            'flex size-7 items-center justify-center rounded-md',
            'text-neutral-400 transition-colors',
            'hover:bg-neutral-800 hover:text-white',
            'disabled:pointer-events-none disabled:opacity-30',
          )}
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Go to next month"
          disabled={!nextMonth}
          onClick={() => nextMonth && goToMonth(nextMonth)}
          className={cn(
            'flex size-7 items-center justify-center rounded-md',
            'text-neutral-400 transition-colors',
            'hover:bg-neutral-800 hover:text-white',
            'disabled:pointer-events-none disabled:opacity-30',
          )}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Per-day button ─────────────────────────────────────────────────── */

function BookingDayButton({
  className,
  day,
  modifiers,
  children,
  ...rest
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const blockedMap = React.useContext(BlockedDatesContext);
  const nonWorkingSet = React.useContext(NonWorkingDaysContext);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  if (modifiers.outside) return <span className="block aspect-square w-full" />;

  const dateStr = format(day.date, 'yyyy-MM-dd');
  const blockedEmoji = blockedMap.get(dateStr);
  const isHoliday = Boolean(blockedEmoji);
  // Non-working weekdays get transparent bg; past/other disabled dates get dark box
  const isNonWorkingWeekday = !isHoliday && nonWorkingSet.has(day.date.getDay());

  return (
    <button
      ref={ref}
      {...rest}
      className={cn(
        'relative flex aspect-square w-full min-h-[44px] select-none items-center justify-center rounded-lg text-[15px] font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
        // Default: interactive working day
        'cursor-pointer bg-neutral-800 text-neutral-200 hover:bg-white hover:text-neutral-900',
        // Non-working weekday: transparent, faded — no box at all
        isNonWorkingWeekday &&
          'cursor-default bg-transparent text-neutral-600 hover:bg-transparent hover:text-neutral-600 pointer-events-none',
        // Past dates (not non-working weekday): dark box, greyed out
        modifiers.disabled && !isNonWorkingWeekday && !isHoliday &&
          'cursor-not-allowed bg-neutral-900 text-neutral-600 hover:bg-neutral-900 hover:text-neutral-600',
        // Holiday: show emoji, subtle dark bg, no hover
        isHoliday &&
          'cursor-default bg-neutral-900 hover:bg-neutral-900 pointer-events-none',
        // Today ring (not selected)
        modifiers.today && !modifiers.selected && 'ring-1 ring-inset ring-neutral-400',
        // Selected
        modifiers.selected && 'bg-white font-semibold text-neutral-900 hover:bg-neutral-100',
        className,
      )}
    >
      {isHoliday ? (
        <span aria-label={`Holiday: ${blockedEmoji}`} className="text-xl leading-none">
          {blockedEmoji}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/* ─── Public component ───────────────────────────────────────────────── */

interface BookingCalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: React.ComponentProps<typeof DayPicker>['disabled'];
  /** Controlled month (for syncing with blocked-dates fetch) */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  /** Array of { date: 'YYYY-MM-DD', emoji: string } — blocked by host config */
  blockedDates?: BlockedDate[];
  /** day_of_week numbers (0=Sun … 6=Sat) with no active schedule slots */
  nonWorkingDays?: number[];
  className?: string;
}

export function BookingCalendar({
  selected,
  onSelect,
  disabled,
  month,
  onMonthChange,
  blockedDates = [],
  nonWorkingDays = [],
  className,
}: BookingCalendarProps) {
  const blockedMap = React.useMemo(
    () => new Map(blockedDates.map(({ date, emoji }) => [date, emoji])),
    [blockedDates],
  );

  const nonWorkingSet = React.useMemo(
    () => new Set(nonWorkingDays),
    [nonWorkingDays],
  );

  // Combine all disabled matchers: past dates, non-working weekdays, holiday dates
  const disabledMatchers = React.useMemo<Matcher[]>(() => {
    const matchers: Matcher[] = [];
    if (disabled) matchers.push(disabled as Matcher);
    if (nonWorkingDays.length > 0) matchers.push({ dayOfWeek: nonWorkingDays });
    blockedDates.forEach(({ date }) => matchers.push(new Date(`${date}T12:00:00`)));
    return matchers;
  }, [disabled, nonWorkingDays, blockedDates]);

  return (
    <NonWorkingDaysContext.Provider value={nonWorkingSet}>
    <BlockedDatesContext.Provider value={blockedMap}>
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={disabledMatchers}
        month={month}
        onMonthChange={onMonthChange}
        showOutsideDays={false}
        captionLayout="label"
        className={cn('w-full select-none p-0', className)}
        classNames={{
          months: 'w-full',
          month: 'w-full',
          nav: 'hidden',
          month_caption: '',
          caption_label: 'hidden',
          month_grid: 'w-full',
          weekdays: 'flex',
          weekday:
            'flex-1 pb-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-500 select-none',
          week: 'mt-2 flex gap-2',
          day: 'flex-1 p-0',
          outside: 'pointer-events-none',
          disabled: '',
          selected: '',
          today: '',
        }}
        components={{
          MonthCaption: BookingMonthCaption,
          DayButton: BookingDayButton,
        }}
      />
    </BlockedDatesContext.Provider>
    </NonWorkingDaysContext.Provider>
  );
}
