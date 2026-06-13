import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { HTTP_STATUS, BOOKING_STATUS } from '../../src/config/constants';
import jwt from 'jsonwebtoken';
import { env } from '../../../src/config/env';

import { eventBus, EVENTS } from '../../../src/lib/event-bus';

vi.mock('../../../src/lib/event-bus', () => ({
  eventBus: {
    emit: vi.fn(),
  },
  EVENTS: {
    BOOKING_CREATED: 'BOOKING_CREATED',
  },
}));

describe('Bookings Integration Tests (API)', () => {
  const mockUserId = 'user-123';
  const mockToken = jwt.sign(
    { userId: mockUserId, email: 'test@example.com' },
    env.JWT_ACCESS_SECRET,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/bookings', () => {
    it('should create a booking and trigger background jobs', async () => {
      // Mock Event Type
      vi.mocked(prisma.eventType.findUnique).mockResolvedValue({
        id: 'event-1',
        title: 'Interview',
        user_id: mockUserId,
        is_active: true,
        deleted_at: null,
      } as any);

      // Mock Transaction
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        vi.mocked(prisma.$queryRaw).mockResolvedValue([]); // No overlaps

        vi.mocked(prisma.booking.create).mockResolvedValue({
          id: 'booking-1',
          event_type_id: 'event-1',
          host_id: mockUserId,
          guest_email: 'guest@example.com',
          status: BOOKING_STATUS.CONFIRMED,
        } as any);

        return callback(prisma);
      });

      // Mock Event Bus
      vi.mocked(eventBus.emit).mockReturnValue(true);

      const response = await request(app).post('/api/v1/bookings').send({
        eventTypeId: 'event-1',
        guestName: 'Guest',
        guestEmail: 'guest@example.com',
        guestNotes: 'Looking forward to it',
        startTime: '2026-06-15T10:00:00Z',
        endTime: '2026-06-15T10:30:00Z',
        timezone: 'America/New_York',
      });

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('booking-1');

      // Verification of Async Handlers
      expect(eventBus.emit).toHaveBeenCalledWith(EVENTS.BOOKING_CREATED, {
        booking: expect.objectContaining({ id: 'booking-1' }),
        timezone: 'America/New_York',
      });
    });

    it('should fail if event type is missing', async () => {
      vi.mocked(prisma.eventType.findUnique).mockResolvedValue(null);

      const response = await request(app).post('/api/v1/bookings').send({
        eventTypeId: 'invalid-event',
        guestName: 'Guest',
        guestEmail: 'guest@example.com',
        startTime: '2026-06-15T10:00:00Z',
        endTime: '2026-06-15T10:30:00Z',
        timezone: 'America/New_York',
      });

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Event type not available');
    });
  });

  describe('GET /api/v1/bookings', () => {
    it('should retrieve all bookings for the authenticated host', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue([
        { id: 'booking-1', guest_name: 'Alice' },
        { id: 'booking-2', guest_name: 'Bob' },
      ] as any);

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
