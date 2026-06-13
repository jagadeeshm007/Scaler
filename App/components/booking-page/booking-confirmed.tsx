'use client';

import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Check, ExternalLink, Flag, Loader2, X } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { usePublicCancelBooking } from '@/hooks/mutations/use-booking-mutations';
import { useTimezone } from '@/hooks/use-timezone';
import { formatBookingTimeRange } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Booking } from '@/types';

/* ── helpers ────────────────────────────────────────────────────── */

const LOCATION_LABELS: Record<string, string> = {
  GOOGLE_MEET: 'Google Meet',
  ZOOM: 'Zoom',
  MS_TEAMS: 'Microsoft Teams',
  CAL_VIDEO: 'Cal Video',
  IN_PERSON: 'In Person',
  CUSTOM: 'Custom location',
};

function formatFullDate(iso: string, tz: string): string {
  return formatInTimeZone(parseISO(iso), tz, 'EEEE, MMMM d, yyyy');
}

function tzLongName(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZoneName: 'long',
      timeZone: tz,
    }).formatToParts(new Date());
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? tz;
  } catch {
    return tz;
  }
}

function googleCalUrl(booking: Booking, tz: string): string {
  const fmt = (iso: string) => formatInTimeZone(parseISO(iso), tz, "yyyyMMdd'T'HHmmss");
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: booking.event_type.title,
    dates: `${fmt(booking.start_time)}/${fmt(booking.end_time)}`,
    ctz: tz,
    details: booking.meeting_url ?? '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function outlookUrl(booking: Booking, tz: string): string {
  const fmt = (iso: string) => formatInTimeZone(parseISO(iso), tz, "yyyy-MM-dd'T'HH:mm:ss");
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: booking.event_type.title,
    startdt: fmt(booking.start_time),
    enddt: fmt(booking.end_time),
    body: booking.meeting_url ?? '',
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/* ── sub-components ─────────────────────────────────────────────── */

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 border-b border-neutral-800/60 py-4 last:border-0">
      <span className="pt-0.5 text-sm text-neutral-500">{label}</span>
      <div className="text-sm text-white">{children}</div>
    </div>
  );
}

function CalIconButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 transition-colors hover:border-neutral-500 hover:bg-neutral-700"
    >
      {children}
    </a>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.233 17.64 11.925 17.64 9.2Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

function OutlookIcon() {
  return (
    <svg viewBox="0 0 18 18" className="size-4" aria-hidden>
      <rect width="18" height="18" rx="2" fill="#0078D4" />
      <text x="9" y="13" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
        O
      </text>
    </svg>
  );
}

function ICalIcon() {
  return (
    <svg viewBox="0 0 18 18" className="size-4" aria-hidden>
      <rect width="18" height="18" rx="2" fill="#fff" />
      <rect y="0" width="18" height="5" rx="2" fill="#F05138" />
      <text x="9" y="14" textAnchor="middle" fontSize="8" fontWeight="600" fill="#1C1C1E">
        iCal
      </text>
    </svg>
  );
}

function TeamsIcon() {
  return (
    <svg viewBox="0 0 18 18" className="size-4" aria-hidden>
      <rect width="18" height="18" rx="2" fill="#5059C9" />
      <text x="9" y="13" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">
        T
      </text>
    </svg>
  );
}

/* ── main component ─────────────────────────────────────────────── */

interface BookingConfirmedProps {
  booking: Booking;
}

export function BookingConfirmed({ booking }: BookingConfirmedProps) {
  const { timezone } = useTimezone();
  const params = useParams<{ username: string; slug: string }>();
  const router = useRouter();
  const cancelMutation = usePublicCancelBooking();

  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelled, setIsCancelled] = useState(booking.status === 'CANCELLED');

  const locationLabel =
    LOCATION_LABELS[booking.event_type.location_type] ??
    booking.event_type.location_type.replace(/_/g, ' ');

  const hostName = booking.host?.full_name ?? 'Host';
  const hostEmail = booking.host?.email ?? '';
  const tzLabel = tzLongName(timezone);

  async function handleCancel() {
    await cancelMutation.mutateAsync({
      uid: booking.uid,
      reason: cancelReason || undefined,
      timezone,
    });
    setIsCancelled(true);
    setShowCancel(false);
  }

  return (
    <m.div
      className="mx-auto w-full max-w-xl"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
    >
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        {/* ── header ── */}
        <div className="flex flex-col items-center gap-3 border-b border-neutral-800 px-8 py-8 text-center">
          <m.div
            className={cn(
              'flex size-12 items-center justify-center rounded-full border-2',
              isCancelled
                ? 'border-neutral-600 bg-neutral-800'
                : 'border-green-500 bg-green-500/10',
            )}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.08 }}
          >
            {isCancelled ? (
              <X className="size-6 text-neutral-400" strokeWidth={2.5} />
            ) : (
              <Check className="size-6 text-green-500" strokeWidth={2.5} />
            )}
          </m.div>
          <div>
            <h1 className="text-xl font-semibold text-white">
              {isCancelled ? 'This event has been cancelled' : 'This meeting is scheduled'}
            </h1>
            <p className="mt-1.5 text-sm text-neutral-400">
              {isCancelled
                ? 'A cancellation email has been sent to all attendees.'
                : 'We sent an email with a calendar invitation with the details to everyone.'}
            </p>
          </div>
        </div>

        {/* ── info table ── */}
        <div className="px-8 py-2">
          <InfoRow label="What">
            <span className="font-medium">{booking.event_type.title}</span>
          </InfoRow>

          <InfoRow label="When">
            <p className={cn('font-medium', isCancelled && 'line-through text-neutral-500')}>
              {formatFullDate(booking.start_time, timezone)}
            </p>
            <p
              className={cn(
                'mt-0.5',
                isCancelled ? 'line-through text-neutral-600' : 'text-neutral-400',
              )}
            >
              {formatBookingTimeRange(booking.start_time, booking.end_time, timezone)}{' '}
              <span className="text-neutral-500">({tzLabel})</span>
            </p>
          </InfoRow>

          <InfoRow label="Who">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{hostName}</span>
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-400">
                  Host
                </span>
              </div>
              {hostEmail && <p className="text-neutral-400">{hostEmail}</p>}
            </div>
            <div className="mt-3">
              <p className="font-medium">{booking.guest_name}</p>
              <p className="text-neutral-400">{booking.guest_email}</p>
            </div>
          </InfoRow>

          <InfoRow label="Where">
            {booking.meeting_url ? (
              <a
                href={booking.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline"
              >
                {locationLabel}
                <ExternalLink className="size-3.5" />
              </a>
            ) : (
              <span>{locationLabel}</span>
            )}
          </InfoRow>
        </div>

        {/* ── cancel inline form ── */}
        <AnimatePresence>
          {showCancel && (
            <m.div
              key="cancel-form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-neutral-800 px-8 py-5">
                <h3 className="mb-3 text-sm font-medium text-white">Reason for cancellation</h3>
                <Textarea
                  placeholder="Why are you cancelling?"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  disabled={cancelMutation.isPending}
                  className="min-h-[80px] resize-none border-neutral-700 bg-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-500"
                />
                <p className="mt-1.5 text-xs text-neutral-500">
                  Cancellation reason will be shared with guests
                </p>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCancel(false)}
                    disabled={cancelMutation.isPending}
                    className="text-neutral-400 hover:text-white"
                  >
                    Nevermind
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    className="bg-red-600 hover:bg-red-500"
                  >
                    {cancelMutation.isPending && (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    )}
                    Cancel event
                  </Button>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* ── add to calendar (only when not cancelled) ── */}
        {!isCancelled && (
          <div className="flex items-center gap-3 border-t border-neutral-800 px-8 py-4">
            <span className="text-sm text-neutral-400">Add to calendar</span>
            <div className="flex items-center gap-2">
              <CalIconButton href={googleCalUrl(booking, timezone)} label="Google Calendar">
                <GoogleIcon />
              </CalIconButton>
              <CalIconButton href={outlookUrl(booking, timezone)} label="Outlook">
                <OutlookIcon />
              </CalIconButton>
              <CalIconButton href="#" label="Apple iCal">
                <ICalIcon />
              </CalIconButton>
              <CalIconButton href="#" label="Microsoft Teams">
                <TeamsIcon />
              </CalIconButton>
            </div>
          </div>
        )}

        {/* ── footer actions ── */}
        {!isCancelled && !showCancel && (
          <div className="border-t border-neutral-800 px-8 py-4 text-center text-sm text-neutral-500">
            Need to make a change?{' '}
            <button
              className="text-neutral-300 hover:text-white hover:underline"
              onClick={() =>
                router.push(`/${params.username}/${params.slug}?reschedule=${booking.uid}`)
              }
            >
              Reschedule
            </button>{' '}
            or{' '}
            <button
              className="text-neutral-300 hover:text-white hover:underline"
              onClick={() => setShowCancel(true)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ── report booking ── */}
      <div className="mt-4 flex justify-center">
        <button className="inline-flex items-center gap-1.5 text-xs text-neutral-600 transition-colors hover:text-neutral-400">
          <Flag className="size-3.5" />
          Report booking
        </button>
      </div>
    </m.div>
  );
}
