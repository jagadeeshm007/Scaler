'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateOverridePickerProps {
  selectedDates: string[];
  onSelectDates: (dates: string[]) => void;
  className?: string;
}

function toDateStrings(range: DateRange | undefined): string[] {
  if (!range?.from) return [];
  const dates: string[] = [];
  const current = new Date(range.from);
  const end = range.to ? new Date(range.to) : new Date(range.from);

  while (current <= end) {
    dates.push(format(current, 'yyyy-MM-dd'));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function DateOverridePicker({
  selectedDates,
  onSelectDates,
  className,
}: DateOverridePickerProps) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();

  const handleApply = () => {
    const newDates = toDateStrings(range);
    if (newDates.length === 0) return;
    const merged = Array.from(new Set([...selectedDates, ...newDates])).sort();
    onSelectDates(merged);
    setRange(undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('gap-2 border-neutral-800 bg-neutral-900', className)}>
          <CalendarIcon className="size-4" />
          Add date override
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-neutral-800 bg-neutral-950 p-0" align="start">
        <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={1} />
        <div className="border-t border-neutral-800 p-3">
          <Button size="sm" className="w-full" onClick={handleApply} disabled={!range?.from}>
            Add selected dates
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
