import { DateUtils } from './date';
import { AvailabilityService } from '../services/availability.service';
import { prisma } from '../lib/prisma';
import { BOOKING_STATUS } from '../config/constants';
import { isBefore, addMinutes, isAfter } from 'date-fns';

export interface Slot {
  startTime: string; // ISO string UTC
  endTime: string; // ISO string UTC
  available: boolean;
}

export class SlotCalculator {
  /**
   * Calculates available slots for a given event type on a specific date (YYYY-MM-DD)
   */
  static async getAvailableSlots(
    eventTypeId: string,
    dateStr: string,
    requestedTimeZone: string,
  ): Promise<Slot[]> {
    // 1. Fetch Event Type
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: { user: { include: { schedules: { where: { is_default: true } } } } },
    });

    if (!eventType || eventType.deleted_at || !eventType.is_active) {
      return [];
    }

    const userId = eventType.user_id;

    // We assume the user's default schedule is used for this event type for simplicity,
    // though cal.com allows linking specific schedules to event types.
    // If we wanted to link, we'd add `schedule_id` to `EventType`. Let's use default.
    const defaultScheduleId = eventType.user.schedules[0]?.id;

    // 2. Fetch Availability for the requested date using the host's timezone as base
    // First, we need to know what "dateStr" means. It means the requester wants slots for "2026-06-15" in THEIR timezone.
    // So "2026-06-15T00:00:00" in requestedTimeZone is the start boundary.
    const windowStartUTC = DateUtils.getStartOfDayUTC(dateStr, requestedTimeZone);
    const windowEndUTC = DateUtils.getEndOfDayUTC(dateStr, requestedTimeZone);

    // Get the base availability rule for the host on the UTC date that corresponds to the start of the window
    // This is a slight simplification: technically a requester's single day might span two of the host's days.
    // For robust implementation, we should iterate day by day in the host timezone and generate slots, then filter to requested bounds.
    // Let's generate slots for the host's local day that overlaps most with the requested day.
    // Actually, the simplest correct approach is: fetch availability for the requested date string as if it's the host's date.

    const availability = await AvailabilityService.getAvailabilityForDate(
      userId,
      new Date(dateStr), // Used to get day of week and match overrides
      defaultScheduleId,
    );

    if (
      !availability ||
      !availability.is_available ||
      !availability.start_time ||
      !availability.end_time
    ) {
      return [];
    }

    // 3. Construct UTC boundaries for the host's working hours on this date
    const workStartUTC = DateUtils.parseTimeInTimezone(
      dateStr,
      availability.start_time,
      availability.timezone,
    );
    const workEndUTC = DateUtils.parseTimeInTimezone(
      dateStr,
      availability.end_time,
      availability.timezone,
    );

    // 4. Fetch Existing Bookings
    const bookings = await prisma.booking.findMany({
      where: {
        host_id: userId,
        status: { in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
        // Fetch all bookings that overlap with this working window
        start_time: { lt: workEndUTC },
        end_time: { gt: workStartUTC },
      },
    });

    // 5. Generate Candidate Slots
    const candidateSlots = DateUtils.generateIntervals(
      workStartUTC,
      workEndUTC,
      eventType.duration_mins,
    );

    // 6. Filter against bookings and buffers
    const nowPlus10Mins = addMinutes(new Date(), 10);
    const validSlots: Slot[] = [];

    for (const slot of candidateSlots) {
      // Must be in the future (plus minimum notice)
      if (isBefore(slot.start, nowPlus10Mins)) {
        continue;
      }

      // Check overlap with existing bookings (considering buffers)
      const isOverlapping = bookings.some((b) => {
        const blockedStart = addMinutes(b.start_time, -eventType.buffer_before_mins);
        const blockedEnd = addMinutes(b.end_time, eventType.buffer_after_mins);

        // Overlap condition: slot.start < blockedEnd AND slot.end > blockedStart
        return isBefore(slot.start, blockedEnd) && isAfter(slot.end, blockedStart);
      });

      if (!isOverlapping) {
        validSlots.push({
          startTime: slot.start.toISOString(),
          endTime: slot.end.toISOString(),
          available: true,
        });
      }
    }

    return validSlots;
  }
}
