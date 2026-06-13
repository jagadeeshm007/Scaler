'use client';

import {
  Calendar,
  Clock,
  ExternalLink,
  Grid3x3,
  Link2,
  Search,
  Settings,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import { TransitionLink } from '@/components/layout/transition-link';
import { AvatarFallback } from '@/components/shared/avatar-fallback';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const navItems = [
  { href: ROUTES.eventTypes, label: 'Event types', icon: Link2 },
  { href: ROUTES.bookings, label: 'Bookings', icon: Calendar },
  { href: ROUTES.availability, label: 'Availability', icon: Clock },
  { href: ROUTES.apps, label: 'Apps', icon: Grid3x3 },
];

const bottomItems = [
  { href: ROUTES.settings, label: 'Settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const username = user?.username ?? process.env.NEXT_PUBLIC_DEFAULT_USERNAME ?? '';

  return (
    <aside
      className={cn(
        'flex w-64 shrink-0 flex-col border-r border-neutral-800/80 bg-neutral-950 px-3 py-5',
        className,
      )}
    >
      {/* Logo + search + avatar row — matches ref */}
      <div className="mb-8 flex items-center justify-between px-2">
        <span className="text-lg font-bold tracking-tight text-white">Scaler</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            className="text-neutral-500 transition-colors hover:text-white"
          >
            <Search className="size-4" />
          </button>
          {user && (
            <div className="relative">
              <AvatarFallback name={user.full_name} className="size-8" />
              <span className="absolute right-0 bottom-0 size-2 rounded-full border-2 border-neutral-950 bg-green-500" />
            </div>
          )}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <TransitionLink
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                active
                  ? 'bg-neutral-800/60 text-white'
                  : 'text-neutral-500 hover:bg-neutral-800/30 hover:text-neutral-200',
              )}
            >
              <Icon className="size-[18px]" strokeWidth={active ? 2.25 : 2} />
              {label}
            </TransitionLink>
          );
        })}
      </nav>

      <div className="mt-auto space-y-0.5 border-t border-neutral-800/80 pt-4">
        <TransitionLink
          href={ROUTES.publicBooking(username, '15min')}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-800/30 hover:text-neutral-200"
        >
          <ExternalLink className="size-[18px]" />
          View public page
        </TransitionLink>
        {bottomItems.map(({ href, label, icon: Icon }) => (
          <TransitionLink
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
              pathname.startsWith(href)
                ? 'bg-neutral-800/60 text-white'
                : 'text-neutral-500 hover:bg-neutral-800/30 hover:text-neutral-200',
            )}
          >
            <Icon className="size-[18px]" />
            {label}
          </TransitionLink>
        ))}
        <p className="px-3 pt-3 text-xs text-neutral-600">
          © {new Date().getFullYear()} Scaler
        </p>
      </div>
    </aside>
  );
}
