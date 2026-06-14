'use client';

import { Link2 } from 'lucide-react';

import { SURFACE } from '@/components/shared/page-section';
import { cn } from '@/lib/utils';

/** Cal.com-style 2×3 dot drag handle */
export function EventTypeDragHandleIcon({ className }: { className?: string }) {
  return (
    <span className={cn('inline-grid grid-cols-2 gap-[3px]', className)} aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className="size-[3px] rounded-full bg-current" />
      ))}
    </span>
  );
}

/** Dotted drop slot shown while dragging */
export function EventTypeListRowPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-lg border border-dashed border-neutral-600 bg-card', className)}
      aria-hidden
    />
  );
}

/** Cal.com-style link icon — rotated 45° */
export function EventTypeLinkIcon({
  className,
  strokeWidth,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return <Link2 className={cn('-rotate-45', className)} strokeWidth={strokeWidth} />;
}

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
        'flex items-center overflow-hidden rounded-md border',
        SURFACE.actionGroup,
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
        'flex h-7 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-card-foreground',
        showDivider && 'border-r border-border last:border-r-0',
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
        variant === 'default' &&
          cn(
            'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs text-muted-foreground',
            SURFACE.input,
            SURFACE.inputBorder,
          ),
        /* hidden chip — horizontal label */
        variant === 'hidden' &&
          'inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-500',
        className,
      )}
    >
      {children}
    </span>
  );
}
