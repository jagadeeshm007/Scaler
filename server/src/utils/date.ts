import { addMinutes, isBefore, isAfter } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export class DateUtils {
  /**
   * Parse a HH:mm string on a specific date in a specific timezone into a UTC Date object
   */
  static parseTimeInTimezone(dateStr: string, timeStr: string, timeZone: string): Date {
    // Construct local ISO string: "2026-06-15T09:00:00"
    const localDateTimeStr = `${dateStr}T${timeStr}:00`;
    // We cannot just use `new Date(localDateTimeStr)` because node uses system timezone.
    // We parse it as a zoned time in the target timezone, which produces the correct UTC absolute time.
    // Wait, date-fns-tz `toZonedTime` takes a UTC date and returns a Date-like object in that timezone.
    // To parse a local string IN a timezone TO a UTC date, we should use `fromZonedTime` from date-fns-tz,
    // but in v3 it's been refactored or we can just construct an ISO string with offset.
    // Instead of messing with v3 API changes, we can rely on `Intl` or standard date-fns-tz functions.
    // Actually, `fromZonedTime` exists in date-fns-tz v3.
    // Let's import it conditionally or use a robust fallback.
    return fromZonedTime(localDateTimeStr, timeZone);
  }

  /**
   * Convert a UTC Date to HH:mm in a specific timezone
   */
  static formatToTimezoneTime(date: Date, timeZone: string): string {
    return formatInTimeZone(date, timeZone, 'HH:mm');
  }

  /**
   * Get the start of the day in a specific timezone as a UTC Date
   */
  static getStartOfDayUTC(dateStr: string, timeZone: string): Date {
    return fromZonedTime(`${dateStr}T00:00:00`, timeZone);
  }

  /**
   * Get the end of the day in a specific timezone as a UTC Date
   */
  static getEndOfDayUTC(dateStr: string, timeZone: string): Date {
    return fromZonedTime(`${dateStr}T23:59:59`, timeZone);
  }

  /**
   * Generates discrete intervals between start and end time
   */
  static generateIntervals(
    start: Date,
    end: Date,
    durationMins: number,
  ): { start: Date; end: Date }[] {
    const intervals: { start: Date; end: Date }[] = [];
    let current = start;

    while (isBefore(current, end)) {
      const slotEnd = addMinutes(current, durationMins);
      if (isAfter(slotEnd, end)) {
        break; // Doesn't fit in the window
      }
      intervals.push({ start: current, end: slotEnd });
      current = slotEnd; // Wait, cal.com usually steps by intervals (e.g. 15mins), but for simplicity we step by duration.
      // Actually, standard scheduling steps by standard intervals (e.g., 30 mins) regardless of duration.
      // Let's step by durationMins as a basic approach, or 30 mins interval if preferred.
      // We will step by durationMins for now.
    }

    return intervals;
  }
}
