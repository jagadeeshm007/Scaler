'use client';

import { useEffect, useMemo, useState } from 'react';

import type { DateOverrideInput, ScheduleAvailabilityInput } from '@scaler/types';

import { DateOverrideList } from '@/components/availability/date-override-list';
import { DateOverridePicker } from '@/components/availability/date-override-picker';
import { DayRow } from '@/components/availability/day-row';
import { TimezoneSelector } from '@/components/availability/timezone-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useUpdateSchedule } from '@/hooks/mutations/use-availability-mutations';
import { useSchedule } from '@/hooks/queries/use-availability';
import { DEFAULT_WORK_HOURS } from '@/lib/constants/booking';
import type { DateOverride, ScheduleAvailability } from '@/types';

interface ScheduleEditorProps {
  scheduleId: string;
}

type DayRanges = Record<number, ScheduleAvailabilityInput[]>;

function createDefaultRange(dayOfWeek: number, active = false): ScheduleAvailabilityInput {
  return {
    day_of_week: dayOfWeek,
    start_time: DEFAULT_WORK_HOURS.start,
    end_time: DEFAULT_WORK_HOURS.end,
    is_active: active,
  };
}

function buildDayRanges(availability: ScheduleAvailability[]): DayRanges {
  const ranges: DayRanges = {};
  for (let day = 0; day <= 6; day += 1) {
    const dayEntries = availability.filter((a) => a.day_of_week === day);
    ranges[day] =
      dayEntries.length > 0
        ? dayEntries.map(({ day_of_week, start_time, end_time, is_active }) => ({
            day_of_week,
            start_time,
            end_time,
            is_active,
          }))
        : [createDefaultRange(day, false)];
  }
  return ranges;
}

function mapOverrides(overrides: DateOverride[]): DateOverrideInput[] {
  return overrides.map((o) => ({
    date: o.date.slice(0, 10),
    start_time: o.start_time,
    end_time: o.end_time,
    is_available: o.is_available,
    emoji: o.emoji ?? null,
  }));
}

function flattenDayRanges(ranges: DayRanges): ScheduleAvailabilityInput[] {
  const result: ScheduleAvailabilityInput[] = [];
  for (const dayRanges of Object.values(ranges)) {
    if (dayRanges.some((r) => r.is_active)) {
      for (const r of dayRanges) {
        if (r.is_active) result.push({ ...r, is_active: true });
      }
    } else {
      const first = dayRanges[0] ?? createDefaultRange(0, false);
      result.push({ ...first, is_active: false });
    }
  }
  return result;
}

function overridesFromDates(dates: string[], existing: DateOverrideInput[]): DateOverrideInput[] {
  const existingMap = new Map(existing.map((o) => [o.date, o]));
  return dates.map(
    (date) =>
      existingMap.get(date) ?? {
        date,
        start_time: DEFAULT_WORK_HOURS.start,
        end_time: DEFAULT_WORK_HOURS.end,
        is_available: false,
        emoji: '🔒',
      },
  );
}

export function ScheduleEditor({ scheduleId }: ScheduleEditorProps) {
  const { data: schedule, isLoading } = useSchedule(scheduleId);
  const updateSchedule = useUpdateSchedule();

  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [isDefault, setIsDefault] = useState(false);
  const [dayRanges, setDayRanges] = useState<DayRanges>({});
  const [overrides, setOverrides] = useState<DateOverrideInput[]>([]);

  useEffect(() => {
    if (!schedule) return;
    queueMicrotask(() => {
      setName(schedule.name);
      setTimezone(schedule.timezone);
      setIsDefault(schedule.is_default);
      setDayRanges(buildDayRanges(schedule.availability));
      setOverrides(mapOverrides(schedule.overrides));
    });
  }, [schedule]);

  const overrideDates = useMemo(() => overrides.map((o) => o.date), [overrides]);

  const handleToggleDay = (day: number, active: boolean) => {
    setDayRanges((prev) => ({
      ...prev,
      [day]: active
        ? (prev[day] ?? [createDefaultRange(day, true)]).map((r) => ({ ...r, is_active: true }))
        : [createDefaultRange(day, false)],
    }));
  };

  const handleRangeChange = (day: number, index: number, range: ScheduleAvailabilityInput) => {
    setDayRanges((prev) => {
      const next = [...(prev[day] ?? [])];
      next[index] = range;
      return { ...prev, [day]: next };
    });
  };

  const handleAddRange = (day: number) => {
    setDayRanges((prev) => ({
      ...prev,
      [day]: [...(prev[day] ?? []), createDefaultRange(day, true)],
    }));
  };

  const handleRemoveRange = (day: number, index: number) => {
    setDayRanges((prev) => {
      const next = (prev[day] ?? []).filter((_, i) => i !== index);
      return {
        ...prev,
        [day]: next.length > 0 ? next : [createDefaultRange(day, true)],
      };
    });
  };

  const handleCopyToNext = (day: number) => {
    const nextDay = day === 6 ? 0 : day + 1;
    setDayRanges((prev) => ({
      ...prev,
      [nextDay]: (prev[day] ?? []).map((r) => ({ ...r, day_of_week: nextDay })),
    }));
  };

  const handleSave = () => {
    updateSchedule.mutate({
      id: scheduleId,
      data: {
        name,
        timezone,
        is_default: isDefault,
        availability: flattenDayRanges(dayRanges),
        overrides,
      },
    });
  };

  if (isLoading || !schedule) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full rounded-lg" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{schedule.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set your weekly hours and date-specific overrides.
          </p>
        </div>
        <Button onClick={handleSave} disabled={updateSchedule.isPending}>
          {updateSchedule.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="schedule-name">Schedule name</Label>
          <Input
            id="schedule-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-md border-border bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label>Timezone</Label>
          <TimezoneSelector value={timezone} onChange={setTimezone} className="max-w-md" />
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={isDefault} onCheckedChange={setIsDefault} id="is-default" />
          <Label htmlFor="is-default">Set as default schedule</Label>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card px-6">
        <h2 className="border-b border-border py-4 text-base font-medium text-foreground">
          Weekly hours
        </h2>
        {Array.from({ length: 7 }, (_, day) => (
          <DayRow
            key={day}
            dayOfWeek={day}
            ranges={dayRanges[day] ?? [createDefaultRange(day, false)]}
            onToggle={(active) => handleToggleDay(day, active)}
            onRangeChange={(index, range) => handleRangeChange(day, index, range)}
            onAddRange={() => handleAddRange(day)}
            onRemoveRange={(index) => handleRemoveRange(day, index)}
            onCopyToNext={() => handleCopyToNext(day)}
            isLastDay={day === 6}
          />
        ))}
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-medium text-foreground">Date overrides</h2>
            <p className="text-sm text-muted-foreground">Adjust availability for specific dates.</p>
          </div>
          <DateOverridePicker
            selectedDates={overrideDates}
            onSelectDates={(dates) => setOverrides(overridesFromDates(dates, overrides))}
          />
        </div>
        <DateOverrideList overrides={overrides} onChange={setOverrides} />
      </div>
    </div>
  );
}
