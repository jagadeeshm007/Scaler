'use client';

import { cn } from '@/lib/utils';

interface EventTypeActiveToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/** Cal.com active toggle — white thumb when on, muted when off */
export function EventTypeActiveToggle({
  checked,
  onCheckedChange,
  disabled,
  className,
}: EventTypeActiveToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-[18px] w-8 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-neutral-600' : 'bg-neutral-800',
        className,
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full transition-transform duration-200',
          checked ? 'translate-x-[14px] bg-white' : 'translate-x-0.5 bg-neutral-500',
        )}
      />
    </button>
  );
}
