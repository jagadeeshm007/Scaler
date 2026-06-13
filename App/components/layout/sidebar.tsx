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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

interface SidebarNavLinkProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  active: boolean;
  onNavigate?: () => void;
}

function SidebarNavLink({ href, label, icon: Icon, active, onNavigate }: SidebarNavLinkProps) {
  const link = (
    <TransitionLink
      href={href}
      onClick={onNavigate}
      aria-label={label}
      className={cn(
        'flex items-center rounded-lg text-sm font-medium transition-colors duration-150',
        'justify-center p-2.5 lg:justify-start lg:gap-3 lg:px-3 lg:py-2',
        active
          ? 'bg-neutral-800/60 text-white'
          : 'text-neutral-500 hover:bg-neutral-800/30 hover:text-neutral-200',
      )}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={active ? 2.25 : 2} />
      <span className="hidden lg:inline">{label}</span>
    </TransitionLink>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" className="border-neutral-700 bg-neutral-800 text-white lg:hidden">
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
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex w-[72px] shrink-0 flex-col bg-neutral-950 py-4 lg:w-64 lg:border-r lg:border-neutral-800/40 lg:px-3 lg:py-5',
          className,
        )}
      >
        {/* Header — icon rail on md, full row on lg */}
        <div className="mb-6 flex flex-col items-center gap-3 px-2 lg:mb-8 lg:flex-row lg:items-center lg:justify-between lg:px-2">
          <span className="hidden text-lg font-bold tracking-tight text-white lg:inline">Scaler</span>
          <span className="flex size-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-black lg:hidden">
            S
          </span>
          <div className="flex flex-col items-center gap-2 lg:flex-row">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Search"
                  className="flex size-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-800/40 hover:text-white lg:size-auto lg:p-0 lg:hover:bg-transparent"
                >
                  <Search className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="border-neutral-700 bg-neutral-800 text-white lg:hidden"
              >
                Search
              </TooltipContent>
            </Tooltip>
            {user && (
              <div className="relative">
                <AvatarFallback name={user.full_name} className="size-8" />
                <span className="absolute right-0 bottom-0 size-2 rounded-full border-2 border-neutral-950 bg-green-500" />
              </div>
            )}
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-1 lg:px-0">
          {navItems.map(({ href, label, icon }) => (
            <SidebarNavLink
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={pathname.startsWith(href)}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-0.5 border-t border-neutral-800/80 px-1 pt-3 lg:px-0 lg:pt-4">
          <SidebarNavLink
            href={ROUTES.publicBooking(username, '15min')}
            label="View public page"
            icon={ExternalLink}
            active={false}
            onNavigate={onNavigate}
          />
          {bottomItems.map(({ href, label, icon }) => (
            <SidebarNavLink
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={pathname.startsWith(href)}
              onNavigate={onNavigate}
            />
          ))}
          <p className="hidden px-3 pt-3 text-xs text-neutral-600 lg:block">
            © {new Date().getFullYear()} Scaler
          </p>
        </div>
      </aside>
    </TooltipProvider>
  );
}
