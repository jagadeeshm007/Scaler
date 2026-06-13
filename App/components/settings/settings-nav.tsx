'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: ROUTES.settingsProfile, label: 'Profile' },
  { href: ROUTES.settingsGeneral, label: 'General' },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
