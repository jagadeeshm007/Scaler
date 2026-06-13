import { prisma } from '../lib/prisma';

export interface DailyAvailability {
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  timezone: string;
}

export class AvailabilityService {
  /**
   * Helper for the slot calculator: returns the exact availability rules for a specific date
   */
  static async getAvailabilityForDate(
    userId: string,
    date: Date,
    scheduleId?: string,
  ): Promise<DailyAvailability | null> {
    let schedule;

    if (scheduleId) {
      schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId, user_id: userId },
        include: { availability: true, overrides: true },
      });
    } else {
      // Fallback to default schedule
      schedule = await prisma.schedule.findFirst({
        where: { user_id: userId, is_default: true },
        include: { availability: true, overrides: true },
      });
    }

    if (!schedule) {
      return null;
    }

    // 1. Check Date Overrides first (midnight UTC matching)
    const override = schedule.overrides.find((o) => o.date.getTime() === date.getTime());
    if (override) {
      return {
        is_available: override.is_available,
        start_time: override.start_time,
        end_time: override.end_time,
        timezone: schedule.timezone,
      };
    }

    // 2. Check standard weekly availability (day of week: 0 = Sunday, 1 = Monday)
    const dayOfWeek = date.getDay();
    const standard = schedule.availability.find((a) => a.day_of_week === dayOfWeek && a.is_active);

    if (standard) {
      return {
        is_available: true,
        start_time: standard.start_time,
        end_time: standard.end_time,
        timezone: schedule.timezone,
      };
    }

    // 3. No availability found for this day
    return {
      is_available: false,
      start_time: null,
      end_time: null,
      timezone: schedule.timezone,
    };
  }
}
