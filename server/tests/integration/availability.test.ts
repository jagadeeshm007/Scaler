import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { HTTP_STATUS } from '../../src/config/constants';
import jwt from 'jsonwebtoken';
import { env } from '../../../src/config/env';

describe('Availability Integration Tests (API)', () => {
  const mockUserId = 'user-123';
  const mockToken = jwt.sign(
    { userId: mockUserId, email: 'test@example.com' },
    env.JWT_ACCESS_SECRET,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/availability/slots', () => {
    it('should return available slots for a public event type', async () => {
      // Mock Event Type
      vi.mocked(prisma.eventType.findUnique).mockResolvedValue({
        id: 'event-1',
        user_id: mockUserId,
        is_active: true,
        duration_mins: 30,
        buffer_before_mins: 0,
        buffer_after_mins: 0,
        user: {
          schedules: [{ id: 'sched-1' }],
        },
      } as any);

      // Mock Availability Schedule
      vi.mocked(prisma.schedule.findFirst).mockResolvedValue({
        id: 'sched-1',
        timezone: 'UTC',
        availability: [
          {
            day_of_week: 1, // Monday
            start_time: '09:00',
            end_time: '17:00',
            is_active: true,
          },
        ],
        overrides: [],
      } as any);

      // Mock Bookings (No overlap)
      vi.mocked(prisma.booking.findMany).mockResolvedValue([]);

      // Request slots for a Monday
      const response = await request(app).get('/api/v1/availability/slots').query({
        eventTypeId: 'event-1',
        date: '2026-06-15', // Monday
        timezone: 'UTC',
      });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // 9AM to 5AM = 8 hours = 16 slots of 30 minutes
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('startTime');
      expect(response.body.data[0]).toHaveProperty('available', true);
    });

    it('should return 400 if missing query parameters', async () => {
      const response = await request(app).get('/api/v1/availability/slots').query({
        date: '2026-06-15', // Missing eventTypeId and timezone
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
    });
  });
});
