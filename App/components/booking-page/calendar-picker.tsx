'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { startOfToday } from 'date-fns';

import { Calendar } from '@/components/ui/calendar';

export function CalendarPicker() {
  const [dateStr, setDateStr] = useQueryState('date', parseAsString);

  const selected = dateStr ? new Date(`${dateStr}T00:00:00`) : undefined;

  return (
    <div className="border-b border-neutral-800 p-6 lg:border-b-0 lg:border-r">
      <Calendar
        mode="single"
        selected={selected}
        onSelect={(date) => {
          if (!date) return void setDateStr(null);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          void setDateStr(`${yyyy}-${mm}-${dd}`);
        }}
        disabled={(date) => date < startOfToday()}
        className="mx-auto"
      />
    </div>
  );
}
