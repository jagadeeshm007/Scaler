'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TimeRangePickerProps {
  startTime: string;
  endTime: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TimeRangePicker({
  startTime,
  endTime,
  onStartChange,
  onEndChange,
  disabled,
  className,
}: TimeRangePickerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Input
        type="time"
        value={startTime}
        onChange={(e) => onStartChange(e.target.value)}
        disabled={disabled}
        className="w-[7.5rem] border-border bg-card"
      />
      <span className="text-sm text-muted-foreground">–</span>
      <Input
        type="time"
        value={endTime}
        onChange={(e) => onEndChange(e.target.value)}
        disabled={disabled}
        className="w-[7.5rem] border-border bg-card"
      />
    </div>
  );
}
