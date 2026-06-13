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
        'group flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition-colors hover:border-neutral-700 hover:bg-neutral-800/60',
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-neutral-800 transition-colors group-hover:bg-neutral-700">
        <Icon className="size-5 text-neutral-300" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
    </Link>
  );
}
