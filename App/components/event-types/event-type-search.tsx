'use client';

import { forwardRef } from 'react';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';

interface EventTypeSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const EventTypeSearch = forwardRef<HTMLInputElement, EventTypeSearchProps>(
  function EventTypeSearch({ value, onChange, className }, ref) {
    return (
      <div className={cn('relative', className)}>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={ref}
          id="event-type-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search event type..."
          className="h-10 w-full rounded-xl border border-border bg-muted py-2 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none"
        />
      </div>
    );
  },
);
