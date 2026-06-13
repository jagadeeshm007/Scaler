import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function formatTimeSlot(iso: string, timezone: string, use24h = false): string {
  const pattern = use24h ? 'HH:mm' : 'h:mmaaa';
  return formatInTimeZone(parseISO(iso), timezone, pattern).toLowerCase();
}

export function formatBookingDate(iso: string, timezone: string): string {
  return formatInTimeZone(parseISO(iso), timezone, 'EEE, d MMM');
}

export function formatBookingTimeRange(
  startIso: string,
  endIso: string,
  timezone: string,
  use24h = false,
): string {
  const pattern = use24h ? 'HH:mm' : 'h:mmaaa';
  const start = formatInTimeZone(parseISO(startIso), timezone, pattern).toLowerCase();
  const end = formatInTimeZone(parseISO(endIso), timezone, pattern).toLowerCase();
  return `${start} - ${end}`;
}

export function formatDayRange(days: number[], start: string, end: string): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (days.length === 0) return 'No days selected';
  const sorted = [...days].sort((a, b) => a - b);
  const first = dayNames[sorted[0] ?? 0];
  const last = dayNames[sorted[sorted.length - 1] ?? 0];
  const range = sorted.length === 1 ? first : `${first} - ${last}`;
  return `${range}, ${start} - ${end}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function formatDateLabel(dateStr: string): string {
  return format(parseISO(`${dateStr}T00:00:00`), 'EEE d');
}
