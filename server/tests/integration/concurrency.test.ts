import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { HTTP_STATUS } from '../../src/config/constants';
import { MOCK_EVENT_TYPE_ID, MOCK_USER_ID, validBookingPayload, IDEMPOTENCY_HEADER } from '../helpers/test-utils';

describe('Concurrency Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/bookings Double Booking Race Condition', () => {
    it('should handle concurrent booking requests and reject one', async () => {
      vi.mocked(prisma.eventType.findUnique).mockResolvedValue({
        id: MOCK_EVENT_TYPE_ID,
        title: 'Interview',
        user_id: MOCK_USER_ID,
        is_active: true,
        deleted_at: null,
        requires_confirmation: false,
        location_type: 'IN_PERSON',
      } as never);

      let bookingsCount = 0;

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        if (bookingsCount > 0) {
          vi.mocked(prisma.$queryRaw).mockResolvedValue([{ id: 'existing-booking' }]);
        } else {
          vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
          bookingsCount++;
        }

        vi.mocked(prisma.booking.create).mockResolvedValue({
          id: `booking-${String(bookingsCount)}`,
          status: 'CONFIRMED',
          event_type: {},
          host: {},
        } as never);

        return callback(prisma);
      });

      vi.mocked(prisma.idempotencyKey.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.idempotencyKey.upsert).mockResolvedValue({} as never);

      const [res1, res2] = await Promise.all([
        request(app).post('/api/v1/bookings').set(IDEMPOTENCY_HEADER).send(validBookingPayload),
        request(app)
          .post('/api/v1/bookings')
          .set('X-Idempotency-Key', 'test-idempotency-key-002')
          .send(validBookingPayload),
      ]);

      const statuses = [res1.status, res2.status].sort();

      expect(statuses).toContain(HTTP_STATUS.CREATED);
      expect(statuses.some((s) => s >= 400)).toBe(true);
    });
  });
});
