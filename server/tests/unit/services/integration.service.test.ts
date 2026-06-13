import { sign } from 'jsonwebtoken';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { env } from '../../../src/config/env';
import { prisma } from '../../../src/lib/prisma';
import { IntegrationService } from '../../../src/services/integration.service';
import { decrypt, encrypt } from '../../../src/utils/encryption';

describe('IntegrationService', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleOAuthCallback', () => {
    it('should persist encrypted credentials for mock OAuth providers', async () => {
      const state = sign(
        { userId, appSlug: 'google', nonce: 'abc123' },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '10m' },
      );

      vi.mocked(prisma.app.findUnique).mockResolvedValue({
        id: 'app-google',
        slug: 'google',
        is_active: true,
        client_id_encrypted: encrypt('mock-google-client-id'),
        client_secret_encrypted: encrypt('mock-google-client-secret'),
        redirect_uri: 'http://localhost:4000/api/v1/integrations/google/callback',
        scopes: 'calendar',
      } as never);

      vi.mocked(prisma.credential.upsert).mockResolvedValue({} as never);

      const result = await IntegrationService.handleOAuthCallback('google', 'auth-code', state);

      expect(result.userId).toBe(userId);
      expect(prisma.credential.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            user_id: userId,
            app_id: 'app-google',
            access_token_encrypted: expect.any(String),
          }),
        }),
      );

      const upsertArgs = vi.mocked(prisma.credential.upsert).mock.calls[0][0];
      const storedToken = upsertArgs.create?.access_token_encrypted ?? '';
      expect(decrypt(storedToken)).toMatch(/^mock-access-google-/);
    });
  });
});
