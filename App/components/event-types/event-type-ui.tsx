'use client';

import { cn } from '@/lib/utils';

/* ── Action button group ── */
export function EventTypeActionGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center overflow-hidden rounded-md border border-neutral-800 bg-neutral-950',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EventTypeActionGroupButton({
  label,
  onClick,
  children,
  className,
  showDivider = true,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  showDivider?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'flex h-7 w-8 items-center justify-center text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-200',
        showDivider && 'border-r border-neutral-800 last:border-r-0',
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ── Metadata badges ── */
export function EventTypeBadge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'hidden';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 text-xs',
        /* duration chips — small box-rounded */
        variant === 'default' && 'rounded-md border border-neutral-800 bg-neutral-950 text-neutral-400',
        /* hidden chip — slightly wider box-rounded, amber */
        variant === 'hidden' && 'rounded-md border border-amber-500/40 bg-amber-500/10 font-medium text-amber-500',
        className,
      )}
    >
      {children}
    </span>
  );
}
