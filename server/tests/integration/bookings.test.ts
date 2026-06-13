import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

import { app } from '../../src/app';
import { eventBus, EVENTS } from '../../src/lib/event-bus';
import { prisma } from '../../src/lib/prisma';
import { HTTP_STATUS, BOOKING_STATUS } from '../../src/config/constants';
import { env } from '../../src/config/env';
import {
  MOCK_EVENT_TYPE_ID,
  MOCK_USER_ID,
  mockAuthenticatedUser,
  validBookingPayload,
  IDEMPOTENCY_HEADER,
} from '../helpers/test-utils';

vi.mock('../../src/lib/event-bus', () => ({
  eventBus: {
    emit: vi.fn(),
  },
  EVENTS: {
    BOOKING_CREATED: 'BOOKING_CREATED',
    BOOKING_CANCELLED: 'BOOKING_CANCELLED',
    BOOKING_RESCHEDULED: 'BOOKING_RESCHEDULED',
  },
  publishEvent: vi.fn(),
}));

describe('Bookings Integration Tests (API)', () => {
  const mockToken = jwt.sign(
    { userId: MOCK_USER_ID, email: 'test@example.com' },
    env.JWT_ACCESS_SECRET,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/bookings', () => {
    it('should create a booking and trigger background jobs', async () => {
      vi.mocked(prisma.eventType.findUnique).mockResolvedValue({
        id: MOCK_EVENT_TYPE_ID,
        title: 'Interview',
        user_id: MOCK_USER_ID,
        is_active: true,
        deleted_at: null,
        requires_confirmation: false,
        location_type: 'IN_PERSON',
        user: { full_name: 'Host' },
      } as never);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

        vi.mocked(prisma.booking.create).mockResolvedValue({
          id: 'booking-1',
          event_type_id: MOCK_EVENT_TYPE_ID,
          host_id: MOCK_USER_ID,
          guest_email: 'guest@example.com',
          status: BOOKING_STATUS.CONFIRMED,
          event_type: { title: 'Interview' },
          host: { email: 'host@example.com', full_name: 'Host' },
        } as never);

        return callback(prisma);
      });

      vi.mocked(prisma.idempotencyKey.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.idempotencyKey.upsert).mockResolvedValue({} as never);

      const response = await request(app)
        .post('/api/v1/bookings')
        .set(IDEMPOTENCY_HEADER)
        .send(validBookingPayload);

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('booking-1');

      expect(eventBus.emit).toHaveBeenCalledWith(EVENTS.BOOKING_CREATED, {
        booking: expect.objectContaining({ id: 'booking-1' }),
        timezone: validBookingPayload.timezone,
      });
    });

    it('should fail if event type is missing', async () => {
      vi.mocked(prisma.eventType.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.idempotencyKey.findUnique).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('X-Idempotency-Key', 'test-idempotency-key-missing-event')
        .send({ ...validBookingPayload, event_type_id: '770e8400-e29b-41d4-a716-446655440099' });

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
    });
  });

  describe('GET /api/v1/bookings', () => {
    it('should retrieve all bookings for the authenticated host', async () => {
      mockAuthenticatedUser();

      vi.mocked(prisma.booking.findMany).mockResolvedValue([
        { id: 'booking-1', guest_name: 'Alice' },
        { id: 'booking-2', guest_name: 'Bob' },
      ] as never);

      const response = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should fail if unauthorized', async () => {
      const response = await request(app).get('/api/v1/bookings');
      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    });
  });
});
