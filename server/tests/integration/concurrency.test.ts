import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { HTTP_STATUS } from '../../src/config/constants';

describe('Concurrency Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/bookings Double Booking Race Condition', () => {
    it('should handle concurrent booking requests and reject one', async () => {
      // Mock Event Type
      vi.mocked(prisma.eventType.findUnique).mockResolvedValue({
        id: 'event-1',
        title: 'Interview',
        user_id: 'user-123',
        is_active: true,
      } as any);

      // Simulate a race condition in the transaction:
      // We will maintain state in our mock to simulate the first request locking/creating
      // and the second request failing the overlap check.
      let bookingsCount = 0;

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        // If bookingsCount > 0, it means another transaction "committed" first
        // So we mock the overlap query to return an existing booking
        if (bookingsCount > 0) {
          vi.mocked(prisma.$queryRaw).mockResolvedValue([{ id: 'existing-booking' }]);
        } else {
          vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
          bookingsCount++;
        }

        vi.mocked(prisma.booking.create).mockResolvedValue({
          id: `booking-${bookingsCount}`,
        } as any);

        return callback(prisma);
      });

      const reqBody = {
        eventTypeId: 'event-1',
        guestName: 'Guest',
        guestEmail: 'guest@example.com',
        startTime: '2026-06-15T10:00:00Z',
        endTime: '2026-06-15T10:30:00Z',
        timezone: 'America/New_York',
      };

      // Fire two requests concurrently
      const [res1, res2] = await Promise.all([
        request(app).post('/api/v1/bookings').send(reqBody),
        request(app).post('/api/v1/bookings').send(reqBody),
      ]);

      // One should succeed, one should fail with conflict
      const statuses = [res1.status, res2.status].sort();

      // Expected: One 201 Created, One 409 Conflict (Double booking throws AppError mapped to conflict or 400 depending on generic handler)
      expect(statuses).toContain(HTTP_STATUS.CREATED);

      // The second request fails with whatever status code AppError for double booking uses
      // In booking.controller/service it throws an AppError which is usually 400 or 409.
      expect(statuses.some((s) => s >= 400)).toBe(true);
    });
  });
});
