import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../../src/lib/prisma';
import { AvailabilityService } from '../../../src/services/availability.service';
import { DateUtils } from '../../../src/utils/date';

describe('AvailabilityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailabilityForDate', () => {
    const mockUserId = 'user-1';
    const mockDate = new Date('2026-06-15T10:00:00Z'); // Monday
    const mockScheduleId = 'sched-1';

    it('should return date override if it exists', async () => {
      vi.mocked(prisma.schedule.findUnique).mockResolvedValue({
        id: mockScheduleId,
        user_id: mockUserId,
        timezone: 'America/New_York',
        is_default: true,
        availability: [],
        overrides: [
          {
            id: 'override-1',
            user_id: mockUserId,
            schedule_id: mockScheduleId,
            date: new Date('2026-06-15T10:00:00Z'),
            start_time: '10:00',
            end_time: '14:00',
            is_available: true,
          },
        ],
      } as any);

      const result = await AvailabilityService.getAvailabilityForDate(
        mockUserId,
        mockDate,
        mockScheduleId,
      );

      expect(prisma.schedule.findUnique).toHaveBeenCalled();
      expect(result).toEqual({
        is_available: true,
        start_time: '10:00',
        end_time: '14:00',
        timezone: 'America/New_York',
      });
    });

    it('should return weekly schedule if no override exists', async () => {
      vi.mocked(prisma.dateOverride).findFirst.mockResolvedValue(null);

      vi.mocked(prisma.schedule.findUnique).mockResolvedValue({
        id: mockScheduleId,
        user_id: mockUserId,
        timezone: 'America/New_York',
        is_default: true,
        availability: [
          { day_of_week: 1, start_time: '09:00', end_time: '17:00', is_active: true }, // Monday
        ],
        overrides: [],
      } as any);

      const result = await AvailabilityService.getAvailabilityForDate(
        mockUserId,
        mockDate,
        mockScheduleId,
      );

      expect(result).toEqual({
        is_available: true,
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York',
      });
    });

    it('should return default closed if schedule has no rule for that day', async () => {
      vi.mocked(prisma.dateOverride).findFirst.mockResolvedValue(null);

      vi.mocked(prisma.schedule.findUnique).mockResolvedValue({
        id: mockScheduleId,
        user_id: mockUserId,
        timezone: 'America/New_York',
        is_default: true,
        availability: [
          { day_of_week: 2, start_time: '09:00', end_time: '17:00', is_active: true }, // Tuesday
        ],
        overrides: [],
      } as any);

      const result = await AvailabilityService.getAvailabilityForDate(
        mockUserId,
        mockDate,
        mockScheduleId,
      );

      expect(result).toEqual({
        is_available: false,
        start_time: null,
        end_time: null,
        timezone: 'America/New_York',
      });
    });

    it('should fallback to default schedule if scheduleId is not provided', async () => {
      vi.mocked(prisma.dateOverride).findFirst.mockResolvedValue(null);

      vi.mocked(prisma.schedule).findFirst.mockResolvedValue({
        id: 'default-sched',
        user_id: mockUserId,
        timezone: 'UTC',
        is_default: true,
        availability: [{ day_of_week: 1, start_time: '08:00', end_time: '16:00', is_active: true }],
        overrides: [],
      } as any);

      const result = await AvailabilityService.getAvailabilityForDate(mockUserId, mockDate);

      expect(prisma.schedule.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: mockUserId, is_default: true },
        }),
      );
      expect(result?.start_time).toBe('08:00');
    });
  });
});
