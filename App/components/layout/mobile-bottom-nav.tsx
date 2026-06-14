'use client';

import { Calendar, Clock, MoreHorizontal, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { EventTypeLinkIcon } from '@/components/event-types/event-type-ui';

import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

const items = [
  { href: ROUTES.eventTypes, icon: EventTypeLinkIcon, label: 'Event types' },
  { href: ROUTES.bookings, icon: Calendar, label: 'Bookings' },
  { href: ROUTES.availability, icon: Clock, label: 'Availability' },
  { href: ROUTES.settings, icon: MoreHorizontal, label: 'More' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Floating pill nav */}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-16 md:hidden">
        <nav className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-border bg-card/95 px-1.5 py-1 shadow-2xl backdrop-blur-md">
          {items.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={cn(
                  'flex size-11 items-center justify-center rounded-full transition-colors',
                  active
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.25 : 2} />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FAB */}
      <Link
        href={ROUTES.eventTypeNew}
        aria-label="Create new event type"
        className="fixed right-4 bottom-5 z-50 flex size-[52px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform hover:scale-105 active:scale-95 md:hidden"
      >
        <Plus className="size-6" strokeWidth={2.5} />
      </Link>
    </>
  );
}
