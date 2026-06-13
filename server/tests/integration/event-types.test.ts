import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { HTTP_STATUS } from '../../src/config/constants';
import { env } from '../../src/config/env';
import { mockAuthenticatedUser, MOCK_USER_ID } from '../helpers/test-utils';

describe('Event Types Integration Tests (API)', () => {
  const mockToken = jwt.sign(
    { userId: MOCK_USER_ID, email: 'test@example.com' },
    env.JWT_ACCESS_SECRET,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticatedUser();
  });

  describe('GET /api/v1/event-types', () => {
    it('should return a list of event types for the authenticated user', async () => {
      const mockEventTypes = [
        { id: 'event-1', title: '15 Min Chat', duration_mins: 15 },
        { id: 'event-2', title: '30 Min Call', duration_mins: 30 },
      ];

      vi.mocked(prisma.eventType.findMany).mockResolvedValue(mockEventTypes as never);

      const response = await request(app)
        .get('/api/v1/event-types')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].title).toBe('15 Min Chat');
    });

    it('should fail if unauthorized', async () => {
      const response = await request(app).get('/api/v1/event-types');

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/event-types', () => {
    it('should create a new event type', async () => {
      const newEventType = {
        title: '60 Min Interview',
        slug: '60-min-interview',
        duration_mins: 60,
        location_type: 'GOOGLE_MEET',
      };

      vi.mocked(prisma.eventType.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.eventType.create).mockResolvedValue({
        id: 'event-3',
        user_id: MOCK_USER_ID,
        ...newEventType,
        is_active: true,
      } as never);

      const response = await request(app)
        .post('/api/v1/event-types')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(newEventType);

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('60 Min Interview');
      expect(prisma.eventType.create).toHaveBeenCalled();
    });

    it('should fail if slug is already taken', async () => {
      vi.mocked(prisma.eventType.findUnique).mockResolvedValue({ id: 'existing-event' } as never);

      const response = await request(app)
        .post('/api/v1/event-types')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: 'Existing Slug',
          slug: 'already-taken',
          duration_mins: 30,
          location_type: 'IN_PERSON',
        });

      expect(response.status).toBe(HTTP_STATUS.CONFLICT);
      expect(response.body.success).toBe(false);
    });
  });
});
