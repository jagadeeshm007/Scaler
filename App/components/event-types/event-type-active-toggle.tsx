'use client';

import { cn } from '@/lib/utils';

/** Cal.com toggle: ON = white track + near-black thumb, OFF = dark track + grey thumb */
export function EventTypeActiveToggle({
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-[18px] w-[30px] shrink-0 rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-muted',
        className,
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute top-1/2 size-3 -translate-y-1/2 rounded-full transition-transform duration-150',
          checked ? 'translate-x-[15px] bg-background' : 'translate-x-[3px] bg-neutral-400',
        )}
      />
    </button>
  );
}
