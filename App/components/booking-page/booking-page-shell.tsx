'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { BookingFormDialog } from '@/components/booking-page/booking-form-dialog';
import { BookingViewSwitcher } from '@/components/booking-page/booking-view-switcher';
import { ColumnView } from '@/components/booking-page/column-view';
import { EventInfoPanel } from '@/components/booking-page/event-info-panel';
import { MonthView } from '@/components/booking-page/month-view';
import { WeekView } from '@/components/booking-page/week-view';
import { useTimezone } from '@/hooks/use-timezone';
import type { BookingLayout } from '@/components/booking-page/booking-view-switcher';
import type { PublicEventType, Slot } from '@/types';

interface BookingPageShellProps {
  eventType: PublicEventType;
}

export function BookingPageShell({ eventType }: BookingPageShellProps) {
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

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-end px-6 py-4">
        {/* Hidden on mobile — only desktop shows the view icons */}
        <div className="hidden lg:flex">
          <BookingViewSwitcher value={layout} onChange={handleLayoutChange} />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-6">
        {layout === 'month' ? (
          /* Centered card for month view */
          <div className={cn(
            'w-full overflow-hidden lg:rounded-2xl lg:border lg:border-neutral-800 transition-[max-width] duration-300 ease-in-out',
            selectedSlot ? 'lg:max-w-2xl' : 'lg:max-w-6xl',
          )}>
            <div className="flex flex-col lg:flex-row">
              <EventInfoPanel
                eventType={eventType}
                host={eventType.user}
                timezone={timezone}
                onTimezoneChange={setTimezone}
                selectedSlot={selectedSlot}
                selectedDuration={selectedDuration}
                onDurationChange={setSelectedDuration}
              />
              <MonthView
                eventType={eventType}
                timezone={timezone}
                layout={layout}
                onLayoutChange={handleLayoutChange}
                selectedSlot={selectedSlot}
                onSlotSelect={setSelectedSlot}
              />
            </div>
          </div>
        ) : (
          /* Full-width for column / week views */
          <div className="flex w-full flex-1 flex-col lg:flex-row">
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
          </div>
        )}
      </main>

      {/* ── Footer branding ── */}
      <footer className="py-6 text-center">
        <span className="text-sm font-semibold tracking-widest text-neutral-500">Scaler</span>
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
  );
}
