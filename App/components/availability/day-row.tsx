'use client';

import { Copy, Plus, Trash2 } from 'lucide-react';

import { TimeRangePicker } from '@/components/availability/time-range-picker';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DAY_NAMES } from '@/lib/constants';
import type { ScheduleAvailabilityInput } from '@scaler/types';
import { cn } from '@/lib/utils';

interface DayRowProps {
  dayOfWeek: number;
  ranges: ScheduleAvailabilityInput[];
  onToggle: (active: boolean) => void;
  onRangeChange: (index: number, range: ScheduleAvailabilityInput) => void;
  onAddRange: () => void;
  onRemoveRange: (index: number) => void;
  onCopyToNext: () => void;
  isLastDay?: boolean;
  className?: string;
}

export function DayRow({
  dayOfWeek,
  ranges,
  onToggle,
  onRangeChange,
  onAddRange,
  onRemoveRange,
  onCopyToNext,
  isLastDay,
  className,
}: DayRowProps) {
  const isActive = ranges.some((r) => r.is_active);

  return (
    <div className={cn('flex flex-col gap-3 border-b border-neutral-800 py-4 sm:flex-row sm:items-start', className)}>
      <div className="flex w-full items-center gap-3 sm:w-36">
        <Switch checked={isActive} onCheckedChange={onToggle} />
        <span className="text-sm font-medium text-white">{DAY_NAMES[dayOfWeek]}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {isActive ? (
          ranges.map((range, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2">
              <TimeRangePicker
                startTime={range.start_time}
                endTime={range.end_time}
                onStartChange={(start_time) =>
                  onRangeChange(index, { ...range, start_time, is_active: true })
                }
                onEndChange={(end_time) =>
                  onRangeChange(index, { ...range, end_time, is_active: true })
                }
              />
              {ranges.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  onClick={() => onRemoveRange(index)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Remove range</span>
                </Button>
              ) : null}
              {index === ranges.length - 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  onClick={onAddRange}
                >
                  <Plus className="size-4" />
                  <span className="sr-only">Add range</span>
                </Button>
              ) : null}
            </div>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">Unavailable</span>
        )}
      </div>

      {!isLastDay ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground"
          onClick={onCopyToNext}
          title="Copy to next day"
        >
          <Copy className="size-4" />
          <span className="sr-only">Copy to next day</span>
        </Button>
      ) : (
        <div className="hidden size-8 sm:block" />
      )}
    </div>
  );
}
