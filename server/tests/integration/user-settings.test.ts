import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../src/app';
import { HTTP_STATUS } from '../../src/config/constants';
import { env } from '../../src/config/env';
import { prisma } from '../../src/lib/prisma';
import { MOCK_USER_ID, mockAuthenticatedUser } from '../helpers/test-utils';

describe('User Settings Integration Tests (API)', () => {
  const mockToken = jwt.sign(
    { userId: MOCK_USER_ID, email: 'test@example.com' },
    env.JWT_ACCESS_SECRET,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticatedUser();
  });

  describe('PATCH /api/v1/users/me/settings', () => {
    it('should persist brand_colors_enabled when updating brand colors', async () => {
      const updatedSettings = {
        id: 'settings-1',
        user_id: MOCK_USER_ID,
        theme: 'dark',
        brand_colors_enabled: true,
        brand_color_light: '#ff0000',
        brand_color_dark: '#e60000',
        created_at: new Date('2026-06-14T13:53:51.764Z'),
        updated_at: new Date('2026-06-15T10:29:10.852Z'),
      };

      vi.mocked(prisma.userSettings.upsert).mockResolvedValue(updatedSettings as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: MOCK_USER_ID,
        email: 'test@example.com',
        username: 'testuser',
        full_name: 'Test User',
        avatar_url: null,
        timezone: 'UTC',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        password_hash: 'hashed',
        settings: updatedSettings,
      } as never);

      const response = await request(app)
        .patch('/api/v1/users/me/settings')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          brand_colors_enabled: true,
          brand_color_light: '#ff0000',
          brand_color_dark: '#e60000',
        });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(prisma.userSettings.upsert).toHaveBeenCalledWith({
        where: { user_id: MOCK_USER_ID },
        update: {
          brand_colors_enabled: true,
          brand_color_light: '#ff0000',
          brand_color_dark: '#e60000',
        },
        create: {
          user_id: MOCK_USER_ID,
          theme: 'system',
          brand_colors_enabled: true,
          brand_color_light: '#ff0000',
          brand_color_dark: '#e60000',
        },
      });
      expect(response.body.data.settings.brand_colors_enabled).toBe(true);
    });
  });
});
