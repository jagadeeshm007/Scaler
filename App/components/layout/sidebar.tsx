'use client';

import { Calendar, Clock, ExternalLink, Grid3x3, Link2, Search, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { TransitionLink } from '@/components/layout/transition-link';
import { AvatarFallback } from '@/components/shared/avatar-fallback';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const navItems = [
  { href: ROUTES.eventTypes, label: 'Event types', icon: Link2 },
  { href: ROUTES.bookings, label: 'Bookings', icon: Calendar },
  { href: ROUTES.availability, label: 'Availability', icon: Clock },
  { href: ROUTES.apps, label: 'Apps', icon: Grid3x3 },
];

const bottomItems = [{ href: ROUTES.settings, label: 'Settings', icon: Settings }];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
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
            /* collapsed: icon-only centered; full: left-aligned with label */
            'justify-center p-2 lg:justify-start lg:gap-3 lg:px-3 lg:py-2',
            active
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200',
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
        className="border-neutral-700 bg-neutral-900 text-xs text-neutral-200 lg:hidden"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const username = user?.username ?? process.env.NEXT_PUBLIC_DEFAULT_USERNAME ?? '';

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          /* no right border — page bg handles separation */
          'flex w-[60px] shrink-0 flex-col bg-neutral-950 py-3 lg:w-60 lg:px-3 lg:py-4',
          className,
        )}
      >
        {/* ── Header ── */}
        <div className="mb-4 flex flex-col items-center gap-3 px-1.5 lg:mb-5 lg:flex-row lg:items-center lg:justify-between lg:px-1">
          {/* Logo — "Scaler" text on lg, "Cal" text chip on md */}
          <span className="hidden text-base font-bold tracking-tight text-white lg:inline">
            Scaler
          </span>
          <span className="text-sm font-bold text-white lg:hidden">Cal</span>

          {/* Avatar — always visible */}
          {user ? (
            <div className="relative">
              <AvatarFallback name={user.full_name} className="size-7 text-xs lg:size-8" />
              <span className="absolute right-0 bottom-0 size-2 rounded-full border-2 border-neutral-950 bg-green-500" />
            </div>
          ) : (
            /* placeholder so layout doesn't jump before auth hydration */
            <div className="size-7 rounded-full bg-neutral-800 lg:size-8" />
          )}
        </div>

        {/* ── Search (below header in collapsed, in header row on lg) ── */}
        <div className="mb-2 flex justify-center px-1 lg:hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Search"
                className="flex size-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-200"
              >
                <Search className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={8}
              className="border-neutral-700 bg-neutral-900 text-xs text-neutral-200"
            >
              Search
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ── Main nav ── */}
        <nav className="flex flex-1 flex-col gap-0.5 px-1.5 lg:px-0">
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
        <div className="mt-auto flex flex-col gap-0.5 border-t border-neutral-800/60 px-1.5 pt-3 lg:px-0 lg:pt-4">
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
          <p className="hidden px-3 pt-3 text-xs text-neutral-700 lg:block">
            © {new Date().getFullYear()} Scaler
          </p>
        </div>
      </aside>
    </TooltipProvider>
  );
}
