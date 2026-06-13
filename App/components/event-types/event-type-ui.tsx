'use client';

import { cn } from '@/lib/utils';

interface EventTypeActionGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function EventTypeActionGroup({ children, className }: EventTypeActionGroupProps) {
  return (
    <div
      className={cn(
        'flex items-center overflow-hidden rounded-md border border-neutral-800 bg-[#1a1a1a]',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface EventTypeActionGroupButtonProps {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  showDivider?: boolean;
}

export function EventTypeActionGroupButton({
  label,
  onClick,
  children,
  className,
  showDivider = true,
}: EventTypeActionGroupButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'flex h-8 w-9 items-center justify-center text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-300',
        showDivider && 'border-r border-neutral-800 last:border-r-0',
        className,
      )}
    >
      {children}
    </button>
  );
}

interface EventTypeBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'hidden';
  className?: string;
}

export function EventTypeBadge({ children, variant = 'default', className }: EventTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
        variant === 'default' && 'border border-neutral-800 bg-[#1a1a1a] text-neutral-400',
        variant === 'hidden' &&
          'border border-amber-500/30 bg-amber-500/10 text-amber-500',
        className,
      )}
    >
      {children}
    </span>
  );
}
