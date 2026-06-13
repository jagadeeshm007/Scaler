'use client';

import { Trash2 } from 'lucide-react';

import { TimeRangePicker } from '@/components/availability/time-range-picker';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { formatDateLabel } from '@/lib/format';
import type { DateOverrideInput } from '@scaler/types';
import { cn } from '@/lib/utils';

interface DateOverrideListProps {
  overrides: DateOverrideInput[];
  onChange: (overrides: DateOverrideInput[]) => void;
  className?: string;
}

export function DateOverrideList({ overrides, onChange, className }: DateOverrideListProps) {
  if (overrides.length === 0) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        No date overrides. Add specific dates when your availability differs from your weekly
        schedule.
      </p>
    );
  }

  const sorted = [...overrides].sort((a, b) => a.date.localeCompare(b.date));

  const updateOverride = (index: number, patch: Partial<DateOverrideInput>) => {
    const next = [...sorted];
    const current = next[index];
    if (!current) return;
    next[index] = { ...current, ...patch };
    onChange(next);
  };

  const removeOverride = (index: number) => {
    onChange(sorted.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-3', className)}>
      {sorted.map((override, index) => (
        <div
          key={override.date}
          className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 sm:flex-row sm:items-center"
        >
          <div className="flex min-w-[7rem] items-center gap-3">
            <Switch
              checked={override.is_available}
              onCheckedChange={(checked) => updateOverride(index, { is_available: checked })}
            />
            <span className="text-sm font-medium text-white">{formatDateLabel(override.date)}</span>
          </div>

          {override.is_available ? (
            <TimeRangePicker
              startTime={override.start_time ?? '09:00'}
              endTime={override.end_time ?? '17:00'}
              onStartChange={(start_time) => updateOverride(index, { start_time })}
              onEndChange={(end_time) => updateOverride(index, { end_time })}
              className="flex-1"
            />
          ) : (
            <span className="flex-1 text-sm text-muted-foreground">Unavailable all day</span>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground hover:text-red-500"
            onClick={() => removeOverride(index)}
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Remove override</span>
          </Button>
        </div>
      ))}
    </div>
  );
}
