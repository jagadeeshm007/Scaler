import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addMinutes, subMinutes } from 'date-fns';

import { prisma } from '../../../src/lib/prisma';
import { AvailabilityService } from '../../../src/services/availability.service';
import { SlotCalculator } from '../../../src/utils/slot-calculator';
import { DateUtils } from '../../../src/utils/date';
import { BOOKING_STATUS } from '../../../src/config/constants';

vi.mock('../../../src/services/availability.service', () => ({
  AvailabilityService: {
    getAvailabilityForDate: vi.fn(),
  },
}));

describe('SlotCalculator', () => {
  const mockDateStr = '2026-06-15';
  const mockTimeZone = 'America/New_York';
  const mockEventTypeId = 'event-1';
  const mockUserId = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array if event type is not found or inactive', async () => {
    vi.mocked(prisma.eventType.findUnique).mockResolvedValue(null);
    const slots = await SlotCalculator.getAvailableSlots(
      mockEventTypeId,
      mockDateStr,
      mockTimeZone,
    );
    expect(slots).toEqual([]);

    vi.mocked(prisma.eventType.findUnique).mockResolvedValue({
      id: mockEventTypeId,
      is_active: false,
      deleted_at: null,
    } as any);
    const slots2 = await SlotCalculator.getAvailableSlots(
      mockEventTypeId,
      mockDateStr,
      mockTimeZone,
    );
    expect(slots2).toEqual([]);
  });

  it('should return empty array if no availability exists for the date', async () => {
    vi.mocked(prisma.eventType.findUnique).mockResolvedValue({
      id: mockEventTypeId,
      is_active: true,
      deleted_at: null,
      user_id: mockUserId,
      user: { schedules: [{ id: 'sched-1' }] },
    } as any);

    vi.mocked(AvailabilityService.getAvailabilityForDate).mockResolvedValue(null);

    const slots = await SlotCalculator.getAvailableSlots(
      mockEventTypeId,
      mockDateStr,
      mockTimeZone,
    );
    expect(slots).toEqual([]);
    expect(AvailabilityService.getAvailabilityForDate).toHaveBeenCalledWith(
      mockUserId,
      expect.any(Date),
      'sched-1',
    );
  });

  it('should filter out slots that overlap with existing bookings', async () => {
    vi.mocked(prisma.eventType.findUnique).mockResolvedValue({
      id: mockEventTypeId,
      is_active: true,
      deleted_at: null,
      user_id: mockUserId,
      duration_mins: 30,
      buffer_before_mins: 10,
      buffer_after_mins: 10,
      user: { schedules: [{ id: 'sched-1' }] },
    } as any);

    vi.mocked(AvailabilityService.getAvailabilityForDate).mockResolvedValue({
      is_available: true,
      start_time: '09:00',
      end_time: '11:00',
      timezone: 'America/New_York',
    } as any);

    const baseDate = new Date('2026-06-15T13:00:00Z'); // 09:00 NY time

    // Create a booking that blocks 09:30 to 10:00 NY time
    // With 10 min buffers, 09:20 to 10:10 is blocked.
    // Slots possible:
    // 09:00 - 09:30 (overlaps with 09:20 buffer? Yes: end is 09:30, blockedStart is 09:20 -> overlaps!)
    // 09:30 - 10:00 (overlaps)
    // 10:00 - 10:30 (overlaps with 10:10 buffer? Yes: start is 10:00, blockedEnd is 10:10 -> overlaps!)
    // 10:30 - 11:00 (No overlap: start is 10:30, blockedEnd is 10:10)

    const bookingStart = addMinutes(baseDate, 30);
    const bookingEnd = addMinutes(baseDate, 60);

    vi.mocked(prisma.booking.findMany).mockResolvedValue([
      {
        id: 'booking-1',
        start_time: bookingStart,
        end_time: bookingEnd,
      } as any,
    ]);

    // Fast forward current time so all slots are "in the future"
    vi.setSystemTime(new Date('2026-06-14T00:00:00Z'));

    const slots = await SlotCalculator.getAvailableSlots(
      mockEventTypeId,
      mockDateStr,
      mockTimeZone,
    );

    // We only expect 10:30 - 11:00 to be available.
    expect(slots.length).toBe(1);

    const expectedStart = addMinutes(baseDate, 90); // 09:00 + 90m = 10:30
    const expectedEnd = addMinutes(baseDate, 120); // 10:30 + 30m = 11:00

    expect(slots[0]).toEqual(
      expect.objectContaining({
        startTime: expectedStart.toISOString(),
        endTime: expectedEnd.toISOString(),
        timezone: mockTimeZone,
        available: true,
      }),
    );
    expect(slots[0].localStartTime).toBeDefined();
    expect(slots[0].localEndTime).toBeDefined();

    vi.useRealTimers();
  });
});
