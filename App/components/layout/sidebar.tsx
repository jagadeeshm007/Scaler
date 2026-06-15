'use client';

import { Calendar, Clock, ExternalLink, Grid3x3, Search, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { env } from '@/lib/env';
import { EventTypeLinkIcon } from '@/components/event-types/event-type-ui';

import { TransitionLink } from '@/components/layout/transition-link';
import { UserAvatarDropdown } from '@/components/layout/user-avatar-dropdown';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import type { UserDTO } from '@/lib/dto';

const navItems = [
  { href: ROUTES.eventTypes, label: 'Event types', icon: EventTypeLinkIcon },
  { href: ROUTES.bookings, label: 'Bookings', icon: Calendar },
  { href: ROUTES.availability, label: 'Availability', icon: Clock },
  { href: ROUTES.apps, label: 'Apps', icon: Grid3x3 },
];

const bottomItems = [{ href: ROUTES.settings, label: 'Settings', icon: Settings }];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
  user: UserDTO | null;
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TransitionLink
          href={href}
          onClick={onNavigate}
          aria-label={label}
          className={cn(
            'flex items-center rounded-md text-sm font-medium transition-colors duration-100',
            /* collapsed (md): fixed square · lg+: full row with label */
            'size-9 shrink-0 justify-center lg:size-auto lg:w-full lg:justify-start lg:gap-3 lg:px-3 lg:py-2',
            active
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
          )}
        >
          <Icon className="size-[18px] shrink-0" strokeWidth={active ? 2.25 : 1.75} />
          <span className="hidden lg:inline">{label}</span>
        </TransitionLink>
      </TooltipTrigger>
      {/* Tooltip only on collapsed (md, not lg) */}
      <TooltipContent
        side="right"
        sideOffset={8}
        className="border-border bg-popover text-xs text-popover-foreground lg:hidden"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar({ className, onNavigate, user }: SidebarProps) {
  const pathname = usePathname();
  const username = user?.username ?? env.NEXT_PUBLIC_DEFAULT_USERNAME ?? '';

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          /* no right border — page bg handles separation */
          'flex w-[60px] shrink-0 flex-col bg-background py-3 lg:w-60 lg:px-3 lg:py-4',
          className,
        )}
      >
        {/* ── Header ── */}
        <div className="mb-4 flex flex-col items-center gap-3 px-1.5 lg:mb-5 lg:flex-row lg:items-center lg:justify-between lg:px-1">
          {/* Logo — "Scaler" on lg, "SA" chip on md */}
          <span className="hidden text-base font-bold tracking-tight text-foreground lg:inline">
            Scaler
          </span>
          <span className="text-sm font-bold text-foreground lg:hidden">SA</span>

          {/* Avatar dropdown */}
          <UserAvatarDropdown avatarClassName="size-7 lg:size-8" user={user} />
        </div>

        {/* ── Search (below header in collapsed, in header row on lg) ── */}
        <div className="mb-2 flex justify-center px-1 lg:hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Search"
                className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              >
                <Search className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={8}
              className="border-border bg-popover text-xs text-popover-foreground"
            >
              Search
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ── Main nav ── */}
        <nav className="flex flex-1 flex-col items-center gap-1 px-1.5 lg:items-stretch lg:gap-0.5 lg:px-0">
          {navItems.map(({ href, label, icon }) => (
            <NavItem
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={pathname.startsWith(href)}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        {/* ── Bottom nav ── */}
        <div className="mt-auto flex flex-col items-center gap-1 border-t border-border/60 px-1.5 pt-3 lg:items-stretch lg:gap-0.5 lg:px-0 lg:pt-4">
          <NavItem
            href={ROUTES.publicBooking(username, '15min')}
            label="View public page"
            icon={ExternalLink}
            active={false}
            onNavigate={onNavigate}
          />
          {bottomItems.map(({ href, label, icon }) => (
            <NavItem
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={pathname.startsWith(href)}
              onNavigate={onNavigate}
            />
          ))}
          <p className="hidden px-3 pt-3 text-xs text-muted-foreground lg:block">
            © {new Date().getFullYear()} Scaler
          </p>
        </div>
      </aside>
    </TooltipProvider>
  );
}
