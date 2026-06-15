import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SettingsCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function SettingsCard({
  href,
  icon: Icon,
  title,
  description,
  className,
}: SettingsCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-border hover:bg-accent/60',
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-accent transition-colors group-hover:bg-neutral-700">
        <Icon className="size-5 text-neutral-300" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
