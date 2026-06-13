import { isBefore, addMinutes, isAfter } from 'date-fns';

import { BOOKING_STATUS } from '../config/constants';
import { prisma } from '../lib/prisma';
import { AvailabilityService } from '../services/availability.service';
import { DateUtils } from './date';

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

    if (!eventType || eventType.deleted_at !== null || !eventType.is_active) {
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

    if (!availability?.is_available || !availability.start_time || !availability.end_time) {
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
    return this.calculatePureSlots({
      dateStr,
      eventType: {
        duration_mins: eventType.duration_mins,
        buffer_before_mins: eventType.buffer_before_mins,
        buffer_after_mins: eventType.buffer_after_mins,
      },
      availability: {
        start_time: availability.start_time,
        end_time: availability.end_time,
        timezone: availability.timezone,
      },
      bookings,
      requestedTimeZone,
    });
  }

  /**
   * Pure function to calculate slots given the input constraints.
   * This is entirely decoupled from Prisma or external services.
   */
  static calculatePureSlots({
    dateStr,
    eventType,
    availability,
    bookings,
  }: {
    dateStr: string;
    eventType: {
      duration_mins: number;
      buffer_before_mins: number;
      buffer_after_mins: number;
    };
    availability: {
      start_time: string;
      end_time: string;
      timezone: string;
    };
    bookings: {
      start_time: Date;
      end_time: Date;
    }[];
    requestedTimeZone: string;
  }): Slot[] {
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

    const candidateSlots = DateUtils.generateIntervals(
      workStartUTC,
      workEndUTC,
      eventType.duration_mins,
    );

    const nowPlus10Mins = addMinutes(new Date(), 10);
    const validSlots: Slot[] = [];

    for (const slot of candidateSlots) {
      if (isBefore(slot.start, nowPlus10Mins)) {
        continue;
      }

      const isOverlapping = bookings.some((b) => {
        const blockedStart = addMinutes(b.start_time, -eventType.buffer_before_mins);
        const blockedEnd = addMinutes(b.end_time, eventType.buffer_after_mins);

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
