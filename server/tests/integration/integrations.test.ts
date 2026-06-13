import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { HTTP_STATUS } from '../../src/config/constants';
import jwt from 'jsonwebtoken';
import { env } from '../../../src/config/env';

describe('Integrations API Tests', () => {
  const mockUserId = 'user-123';
  const mockToken = jwt.sign(
    { userId: mockUserId, email: 'test@example.com' },
    env.JWT_ACCESS_SECRET,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/integrations', () => {
    it('should return a list of active integrations for the user', async () => {
      vi.mocked(prisma.integration.findMany).mockResolvedValue([
        { id: 'int-1', provider: 'GOOGLE_CALENDAR' },
        { id: 'int-2', provider: 'ZOOM' },
      ] as any);

      const response = await request(app)
        .get('/api/v1/integrations')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].provider).toBe('GOOGLE_CALENDAR');
    });

    it('should fail if unauthorized', async () => {
      const response = await request(app).get('/api/v1/integrations');
      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    });
  });

  describe('DELETE /api/v1/integrations/:id', () => {
    it('should disconnect an integration', async () => {
      vi.mocked(prisma.integration.findUnique).mockResolvedValue({
        id: 'int-1',
        user_id: mockUserId,
      } as any);

      vi.mocked(prisma.integration.delete).mockResolvedValue({} as any);

      const response = await request(app)
        .delete('/api/v1/integrations/int-1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(prisma.integration.delete).toHaveBeenCalledWith({
        where: { id: 'int-1' },
      });
    });

    it('should fail if integration does not belong to user', async () => {
      vi.mocked(prisma.integration.findUnique).mockResolvedValue({
        id: 'int-1',
        user_id: 'other-user',
      } as any);

      const response = await request(app)
        .delete('/api/v1/integrations/int-1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body.success).toBe(false);
    });
  });
});
