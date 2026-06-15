import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 px-6 text-center',
        className,
      )}
    >
      <div className="mb-5 flex items-center justify-center">
        <div className="relative flex size-14 items-center justify-center rounded-2xl bg-muted/40 ring-1 ring-inset ring-border/40">
          <div className="absolute inset-0 m-auto flex size-10 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
            <Icon className="size-5 text-foreground" />
          </div>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
