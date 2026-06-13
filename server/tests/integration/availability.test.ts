import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { AvailabilityService } from '../../src/services/availability.service';
import { HTTP_STATUS } from '../../src/config/constants';
import { MOCK_EVENT_TYPE_ID, MOCK_USER_ID } from '../helpers/test-utils';

vi.mock('../../src/services/availability.service', () => ({
  AvailabilityService: {
    getAvailabilityForDate: vi.fn(),
  },
}));

describe('Availability Integration Tests (API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date('2026-06-14T00:00:00Z'));
  });

  describe('GET /api/v1/slots', () => {
    it('should return available slots for a public event type', async () => {
      vi.mocked(prisma.eventType.findUnique).mockResolvedValue({
        id: MOCK_EVENT_TYPE_ID,
        user_id: MOCK_USER_ID,
        is_active: true,
        deleted_at: null,
        duration_mins: 30,
        buffer_before_mins: 0,
        buffer_after_mins: 0,
        user: {
          schedules: [{ id: 'sched-1' }],
        },
      } as never);

      vi.mocked(prisma.booking.findMany).mockResolvedValue([]);

      vi.mocked(AvailabilityService.getAvailabilityForDate).mockResolvedValue({
        is_available: true,
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'UTC',
      });

      const response = await request(app).get('/api/v1/slots').query({
        eventTypeId: MOCK_EVENT_TYPE_ID,
        date: '2026-06-15',
        timezone: 'UTC',
      });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('startTime');
      expect(response.body.data[0]).toHaveProperty('localStartTime');
      expect(response.body.data[0]).toHaveProperty('timezone', 'UTC');
      expect(response.body.data[0]).toHaveProperty('available', true);

      vi.useRealTimers();
    });

    it('should return 400 if missing query parameters', async () => {
      const response = await request(app).get('/api/v1/slots').query({
        date: '2026-06-15',
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
    });
  });
});
