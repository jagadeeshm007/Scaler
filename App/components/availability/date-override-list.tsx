'use client';

import { Trash2 } from 'lucide-react';

import { TimeRangePicker } from '@/components/availability/time-range-picker';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { formatDateLabel } from '@/lib/format';
import type { DateOverrideInput } from '@bolt/types';
import { cn } from '@/lib/utils';

interface DateOverrideListProps {
  overrides: DateOverrideInput[];
  onChange: (overrides: DateOverrideInput[]) => void;
  className?: string;
}

const BLOCK_EMOJIS: { emoji: string; label: string }[] = [
  { emoji: '🔒', label: 'Busy' },
  { emoji: '✈️', label: 'OOO' },
  { emoji: '🏖️', label: 'Holiday' },
  { emoji: '🤒', label: 'Sick' },
  { emoji: '🎉', label: 'Event' },
  { emoji: '🏡', label: 'WFH' },
];

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
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
        >
          {/* Top row: toggle + date label + delete */}
          <div className="flex items-center gap-3">
            <Switch
              checked={override.is_available}
              onCheckedChange={(checked) =>
                updateOverride(index, {
                  is_available: checked,
                  emoji: checked ? null : (override.emoji ?? '🔒'),
                })
              }
            />
            <span className="flex-1 text-sm font-medium text-foreground">
              {formatDateLabel(override.date)}
            </span>
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

          {/* Bottom row: time range OR emoji picker */}
          {override.is_available ? (
            <TimeRangePicker
              startTime={override.start_time ?? '09:00'}
              endTime={override.end_time ?? '17:00'}
              onStartChange={(start_time) => updateOverride(index, { start_time })}
              onEndChange={(end_time) => updateOverride(index, { end_time })}
            />
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                Unavailable all day — pick an emoji shown to visitors on the calendar:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {BLOCK_EMOJIS.map(({ emoji, label }) => (
                  <button
                    key={emoji}
                    type="button"
                    title={label}
                    onClick={() => updateOverride(index, { emoji })}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-md border text-base transition-colors',
                      override.emoji === emoji
                        ? 'border-neutral-400 bg-neutral-700'
                        : 'border-border bg-accent hover:border-neutral-500 hover:bg-neutral-700',
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
