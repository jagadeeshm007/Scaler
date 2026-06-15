'use client';

import { CalendarDays, Columns3, LayoutGrid } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type BookingLayout = 'month' | 'column' | 'week';

interface BookingViewSwitcherProps {
  value: BookingLayout;
  onChange: (layout: BookingLayout) => void;
  className?: string;
}

const VIEWS: { value: BookingLayout; Icon: typeof CalendarDays; label: string }[] = [
  { value: 'month', Icon: CalendarDays, label: 'Month view' },
  { value: 'column', Icon: Columns3, label: 'Day columns view' },
  { value: 'week', Icon: LayoutGrid, label: 'Week view' },
];

export function BookingViewSwitcher({ value, onChange, className }: BookingViewSwitcherProps) {
  return (
    <TooltipProvider delay={400}>
      <div className={cn('flex items-center gap-0.5', className)}>
        {VIEWS.map(({ value: v, Icon, label }) => (
          <Tooltip key={v}>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'size-8 rounded text-muted-foreground hover:text-foreground',
                    value === v && 'bg-accent text-foreground',
                  )}
                  onClick={() => onChange(v)}
                  aria-label={label}
                  aria-pressed={value === v}
                >
                  <Icon className="size-4" />
                </Button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              {label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
