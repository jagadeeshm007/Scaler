'use client';

import * as React from 'react';
import { useThemeTransition } from '@/hooks/use-theme-transition';
import { AnimatePresence, motion } from 'motion/react';
import { formatInTimeZone } from 'date-fns-tz';
import { User, Settings, LogOut, Plane } from 'lucide-react';
import { Classic } from '@/components/ui/theme-toggle';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { logoutAction } from '@/actions/auth.actions';
import { useAvailability } from '@/hooks/queries/use-availability';
import { useUpdateSchedule } from '@/hooks/mutations/use-availability-mutations';
import { useIsMdUp } from '@/hooks/use-media-query';
import { ROUTES } from '@/lib/constants/routes';
import { formatThemeModeLabel } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { TransitionLink } from '@/components/layout/transition-link';

import type { UserDTO } from '@/lib/dto';

interface UserAvatarDropdownProps {
  avatarClassName?: string;
  user: UserDTO | null;
}

export function UserAvatarDropdown({ avatarClassName, user }: UserAvatarDropdownProps) {
  const { toggleTheme, theme, resolvedTheme } = useThemeTransition();
  const isMdUp = useIsMdUp();
  const [open, setOpen] = React.useState(false);

  const { data: schedules } = useAvailability();
  const updateSchedule = useUpdateSchedule();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted || !user) {
    return (
      <div className={cn('relative rounded-full bg-accent animate-pulse', avatarClassName)}>
        <div className="size-full rounded-full bg-accent/80" />
        <span className="absolute right-0 bottom-0 size-2.5 rounded-full border border-background bg-accent" />
      </div>
    );
  }

  const defaultSchedule = schedules?.find((s) => s.is_default);
  const timezone = defaultSchedule?.timezone || user.timezone || 'UTC';

  // Compute availability status
  const now = new Date();
  const dateStr = formatInTimeZone(now, timezone, 'yyyy-MM-dd');
  const isoDayString = formatInTimeZone(now, timezone, 'i'); // 1 (Mon) to 7 (Sun)
  const dayOfWeek = parseInt(isoDayString, 10) % 7; // Mon=1..Sat=6, Sun=0
  const timeStr = formatInTimeZone(now, timezone, 'HH:mm');

  // Check overrides first
  const overrideForToday = defaultSchedule?.overrides?.find((o) => o.date === dateStr);

  let isAvailable = true; // Default to true while schedules are loading
  if (schedules) {
    if (overrideForToday) {
      if (overrideForToday.is_available) {
        if (overrideForToday.start_time && overrideForToday.end_time) {
          isAvailable =
            timeStr >= overrideForToday.start_time && timeStr <= overrideForToday.end_time;
        } else {
          isAvailable = true;
        }
      } else {
        isAvailable = false;
      }
    } else if (defaultSchedule) {
      const dayAvails = defaultSchedule.availability?.filter(
        (a) => a.day_of_week === dayOfWeek && a.is_active,
      );
      if (dayAvails && dayAvails.length > 0) {
        isAvailable = dayAvails.some((a) => timeStr >= a.start_time && timeStr <= a.end_time);
      } else {
        isAvailable = false;
      }
    }
  }

  // Quick OOO status
  const isTodayOOO =
    Boolean(overrideForToday) &&
    !overrideForToday?.is_available &&
    overrideForToday?.emoji === '✈️';

  const handleToggleOOO = () => {
    if (!defaultSchedule) return;

    const cleanOverrides = (defaultSchedule.overrides ?? []).filter((o) => o.date !== dateStr);

    if (isTodayOOO) {
      // Turn OOO off (remove today's override)
      updateSchedule.mutate({
        id: defaultSchedule.id,
        data: { overrides: cleanOverrides },
      });
    } else {
      // Turn OOO on (add today's override as unavailable with plane emoji)
      const newOverride = {
        date: dateStr,
        is_available: false,
        emoji: '✈️',
        start_time: null,
        end_time: null,
      };
      updateSchedule.mutate({
        id: defaultSchedule.id,
        data: { overrides: [...cleanOverrides, newOverride] },
      });
    }
  };

  const initial = user.name.charAt(0).toUpperCase();

  const triggerButton = (
    <button
      type="button"
      className="relative rounded-full transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
      aria-label="User menu"
    >
      <Avatar className={avatarClassName}>
        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} className="object-cover" />
        <AvatarFallback className="bg-pink-600 font-medium text-foreground">
          {initial}
        </AvatarFallback>
      </Avatar>
      <AnimatePresence>
        {schedules !== undefined && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.5 }}
            className={cn(
              'absolute right-0 bottom-0 size-2.5 rounded-full border border-background transition-colors duration-200',
              isAvailable ? 'bg-green-500 border-2' : 'bg-background border border-foreground',
            )}
          />
        )}
      </AnimatePresence>
    </button>
  );

  if (!isMdUp) {
    // Mobile View: Bottom Sheet
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="rounded-t-2xl border-t border-border bg-popover pb-6 text-popover-foreground"
        >
          <div className="flex flex-col">
            {/* Grabber bar for bottom sheet indication */}
            <div className="mx-auto my-3 h-1 w-10 rounded-full bg-neutral-700" />

            {/* Profile info */}
            <div className="flex items-center gap-3 px-5 py-3">
              <Avatar className="size-10">
                <AvatarImage
                  src={user.avatarUrl ?? undefined}
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-pink-600 font-medium text-foreground">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="my-2 h-px bg-border" />

            {/* Toggle Actions */}
            <div className="space-y-0.5 px-2">
              <Classic
                duration={400}
                onClick={(e) => toggleTheme(e)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-popover-foreground transition-colors hover:bg-accent active:bg-accent focus:outline-none"
              >
                <span>Theme Mode</span>
                <span className="ml-auto text-xs capitalize text-muted-foreground">
                  {formatThemeModeLabel(theme, resolvedTheme)}
                </span>
              </Classic>

              <button
                type="button"
                onClick={handleToggleOOO}
                disabled={!defaultSchedule}
                className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm text-popover-foreground transition-colors hover:bg-accent active:bg-accent disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Plane
                    className={cn('size-5 text-muted-foreground', isTodayOOO && 'text-primary')}
                  />
                  <span>Quick OOO</span>
                </div>
                <div className="pointer-events-none" onClick={(e) => e.stopPropagation()}>
                  <Switch checked={isTodayOOO} disabled={!defaultSchedule} />
                </div>
              </button>
            </div>

            <div className="my-2 h-px bg-border" />

            {/* Nav Links */}
            <div className="space-y-0.5 px-2">
              <TransitionLink
                href={ROUTES.settingsProfile}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-popover-foreground transition-colors hover:bg-accent active:bg-accent"
              >
                <User className="size-5 text-muted-foreground" />
                <span>My profile</span>
              </TransitionLink>

              <TransitionLink
                href={ROUTES.settingsGeneral}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-popover-foreground transition-colors hover:bg-accent active:bg-accent"
              >
                <Settings className="size-5 text-muted-foreground" />
                <span>My settings</span>
              </TransitionLink>
            </div>

            <div className="my-2 h-px bg-border" />

            {/* Logout */}
            <div className="px-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void logoutAction();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-400 transition-colors hover:bg-red-950/20 active:bg-red-950/20"
              >
                <LogOut className="size-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop View: Right-Bottom DropdownMenu
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 border-border bg-popover text-popover-foreground"
        side="bottom"
        align="start"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuGroup>
          {/* Theme mode toggle */}
          <DropdownMenuItem
            asChild
            className="flex cursor-pointer items-center gap-2 focus:bg-accent focus:text-foreground"
          >
            <Classic
              duration={400}
              onClick={(e) => {
                e.preventDefault();
                toggleTheme(e);
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-foreground focus:outline-none"
            >
              <span>Theme Mode</span>
              <span className="ml-auto text-xs capitalize text-muted-foreground">
                {formatThemeModeLabel(theme, resolvedTheme)}
              </span>
            </Classic>
          </DropdownMenuItem>

          {/* Quick OOO toggle */}
          <DropdownMenuItem
            className="flex cursor-pointer items-center justify-between focus:bg-accent focus:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              handleToggleOOO();
            }}
            disabled={!defaultSchedule}
          >
            <div className="flex items-center gap-2">
              <Plane className={cn('size-4 text-muted-foreground', isTodayOOO && 'text-primary')} />
              <span>Quick OOO</span>
            </div>
            <div className="pointer-events-none" onClick={(e) => e.stopPropagation()}>
              <Switch checked={isTodayOOO} disabled={!defaultSchedule} />
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuGroup>
          {/* My profile */}
          <DropdownMenuItem
            asChild
            className="cursor-pointer focus:bg-accent focus:text-foreground"
          >
            <TransitionLink
              href={ROUTES.settingsProfile}
              className="flex w-full items-center gap-2"
            >
              <User className="size-4 text-muted-foreground" />
              <span>My profile</span>
            </TransitionLink>
          </DropdownMenuItem>

          {/* My settings */}
          <DropdownMenuItem
            asChild
            className="cursor-pointer focus:bg-accent focus:text-foreground"
          >
            <TransitionLink
              href={ROUTES.settingsGeneral}
              className="flex w-full items-center gap-2"
            >
              <Settings className="size-4 text-muted-foreground" />
              <span>My settings</span>
            </TransitionLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border" />

        {/* Logout */}
        <DropdownMenuItem
          onClick={() => {
            void logoutAction();
          }}
          className="flex cursor-pointer items-center gap-2 text-red-400 focus:bg-red-950/30 focus:text-red-400"
        >
          <LogOut className="size-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
