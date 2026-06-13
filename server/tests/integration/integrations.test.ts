import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { HTTP_STATUS } from '../../src/config/constants';
import { env } from '../../src/config/env';
import { mockAuthenticatedUser, MOCK_USER_ID } from '../helpers/test-utils';

describe('Integrations API Tests', () => {
  const mockToken = jwt.sign(
    { userId: MOCK_USER_ID, email: 'test@example.com' },
    env.JWT_ACCESS_SECRET,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticatedUser();
  });

  describe('GET /api/v1/integrations', () => {
    it('should return a list of active integrations for the user', async () => {
      vi.mocked(prisma.app.findMany).mockResolvedValue([
        { id: 'app-1', slug: 'google', name: 'Google Calendar', is_active: true },
        { id: 'app-2', slug: 'zoom', name: 'Zoom', is_active: true },
      ] as never);

      vi.mocked(prisma.credential.findMany).mockResolvedValue([
        { id: 'cred-1', app_id: 'app-1', user_id: MOCK_USER_ID },
      ] as never);

      const response = await request(app)
        .get('/api/v1/integrations')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].slug).toBe('google');
      expect(response.body.data[0].is_connected).toBe(true);
    });

    it('should fail if unauthorized', async () => {
      const response = await request(app).get('/api/v1/integrations');
      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    });
  });

  describe('DELETE /api/v1/integrations/:slug', () => {
    it('should disconnect an integration', async () => {
      vi.mocked(prisma.app.findUnique).mockResolvedValue({
        id: 'app-1',
        slug: 'google',
      } as never);

      vi.mocked(prisma.credential.deleteMany).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .delete('/api/v1/integrations/google')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(prisma.credential.deleteMany).toHaveBeenCalledWith({
        where: { user_id: MOCK_USER_ID, app_id: 'app-1' },
      });
    });
  });
});
