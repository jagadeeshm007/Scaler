'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { ArrowLeft } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { BookingFormDialog } from '@/components/booking-page/booking-form-dialog';
import { BookingViewSwitcher } from '@/components/booking-page/booking-view-switcher';
import { ColumnView } from '@/components/booking-page/column-view';
import { EventInfoPanel } from '@/components/booking-page/event-info-panel';
import { MonthView } from '@/components/booking-page/month-view';
import { WeekView } from '@/components/booking-page/week-view';
import { usePublicBooking } from '@/hooks/queries/use-bookings';
import { useTimezone } from '@/hooks/use-timezone';
import type { BookingLayout } from '@/components/booking-page/booking-view-switcher';
import type { PublicEventType, Slot } from '@/types';

interface BookingPageShellProps {
  eventType: PublicEventType;
}

export function BookingPageShell({ eventType }: BookingPageShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rescheduleUid = searchParams.get('rescheduleUid') ?? searchParams.get('reschedule') ?? '';
  const { data: rescheduleBooking } = usePublicBooking(rescheduleUid);

  const [isExiting, setIsExiting] = useState(false);

  const [layout, setLayout] = useQueryState(
    'layout',
    parseAsStringLiteral(['month', 'column', 'week'] as const).withDefault('month'),
  );
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(eventType.duration_mins);

  const { timezone, setTimezone } = useTimezone(eventType.user.timezone);

  function handleLayoutChange(next: BookingLayout) {
    setSelectedSlot(null);
    void setLayout(next);
  }

  const isDialogOpen = selectedSlot !== null && layout !== 'month';

  const handleKeepSchedule = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!rescheduleBooking) return;

    setIsExiting(true);

    setTimeout(() => {
      router.push(`/booking/${rescheduleBooking.uid}`);
    }, 250);
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex min-h-screen flex-col bg-background">
        {/* ── Top bar ── */}
        <header className="flex items-center justify-end px-6 py-4">
          {/* Hidden on mobile — only desktop shows the view icons */}
          <div className="hidden lg:flex">
            <BookingViewSwitcher value={layout} onChange={handleLayoutChange} />
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-6">
          {rescheduleBooking && (
            <m.div
              initial={false}
              animate={{ opacity: isExiting ? 0 : 1 }}
              transition={{ duration: 0.15 }}
              className={cn('w-full mb-4 flex', selectedSlot ? 'lg:max-w-2xl' : 'lg:max-w-6xl')}
            >
              <button onClick={handleKeepSchedule} className="w-fit cursor-pointer">
                <m.div
                  whileHover={{ x: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Keep Current Schedule
                </m.div>
              </button>
            </m.div>
          )}

          {layout === 'month' ? (
            /* Centered card for month view */
            <m.div
              initial={false}
              animate={{
                opacity: isExiting ? 0 : 1,
                y: isExiting ? 16 : 0,
                scale: isExiting ? 0.96 : 1,
              }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                'w-full overflow-hidden lg:rounded-2xl lg:border lg:border-border transition-[max-width] duration-500 ease-[cubic-bezier(0,0,0.2,1)]',
                selectedSlot ? 'lg:max-w-2xl' : 'lg:max-w-6xl',
              )}
            >
              <div className="flex flex-col lg:flex-row">
                <EventInfoPanel
                  eventType={eventType}
                  host={eventType.user}
                  timezone={timezone}
                  onTimezoneChange={setTimezone}
                  selectedSlot={selectedSlot}
                  selectedDuration={selectedDuration}
                  onDurationChange={setSelectedDuration}
                  rescheduleBooking={rescheduleBooking}
                />
                <MonthView
                  eventType={eventType}
                  timezone={timezone}
                  layout={layout}
                  onLayoutChange={handleLayoutChange}
                  selectedSlot={selectedSlot}
                  onSlotSelect={setSelectedSlot}
                  rescheduleBooking={rescheduleBooking}
                />
              </div>
            </m.div>
          ) : (
            /* Full-width for column / week views */
            <m.div
              initial={false}
              animate={{
                opacity: isExiting ? 0 : 1,
                y: isExiting ? 16 : 0,
                scale: isExiting ? 0.98 : 1,
              }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="flex w-full flex-1 flex-col lg:flex-row"
            >
              <EventInfoPanel
                eventType={eventType}
                host={eventType.user}
                timezone={timezone}
                onTimezoneChange={setTimezone}
                selectedDuration={selectedDuration}
                onDurationChange={setSelectedDuration}
              />

              <div className="flex flex-1 flex-col overflow-hidden">
                {layout === 'column' && (
                  <ColumnView
                    eventType={eventType}
                    timezone={timezone}
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
                    onSlotSelect={setSelectedSlot}
                  />
                )}
                {layout === 'week' && (
                  <WeekView
                    eventType={eventType}
                    timezone={timezone}
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
                    onSlotSelect={setSelectedSlot}
                  />
                )}
              </div>
            </m.div>
          )}
        </main>

        {/* ── Footer branding ── */}
        <footer className="py-6 text-center">
          <span className="text-sm font-semibold tracking-widest text-muted-foreground">
            Scaler
          </span>
        </footer>

        {isDialogOpen && selectedSlot && (
          <BookingFormDialog
            open={isDialogOpen}
            onClose={() => setSelectedSlot(null)}
            eventType={eventType}
            slot={selectedSlot}
            timezone={timezone}
          />
        )}
      </div>
    </LazyMotion>
  );
}
