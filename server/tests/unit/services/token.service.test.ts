import crypto from 'crypto';
import { sign, verify } from 'jsonwebtoken';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ERROR_CODE, HTTP_STATUS } from '../../../src/config/constants';
import { env } from '../../../src/config/env';
import { prisma } from '../../../src/lib/prisma';
import { TokenService } from '../../../src/services/token.service';
import { AppError } from '../../../src/utils/app-error';

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(),
  verify: vi.fn(),
}));

describe('TokenService', () => {
  const mockPayload = { userId: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const mockToken = 'mock-access-token';
      vi.mocked(sign).mockReturnValue(mockToken as never);

      const result = TokenService.generateAccessToken(mockPayload);

      expect(sign).toHaveBeenCalledWith(mockPayload, env.JWT_ACCESS_SECRET, {
        expiresIn: String(env.JWT_ACCESS_EXPIRES_IN),
      });
      expect(result).toBe(mockToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token and store its hash in the database', async () => {
      const mockToken = 'mock-refresh-token';
      vi.mocked(sign).mockReturnValue(mockToken as never);

      vi.mocked(prisma.refreshToken.create).mockResolvedValue({
        id: 'token-1',
        token_hash: 'hashed',
        user_id: mockPayload.userId,
        expires_at: new Date(),
        is_revoked: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await TokenService.generateRefreshToken(mockPayload);

      expect(sign).toHaveBeenCalledWith(mockPayload, env.JWT_REFRESH_SECRET, {
        expiresIn: String(env.JWT_REFRESH_EXPIRES_IN),
      });

      expect(prisma.refreshToken.create).toHaveBeenCalled();
      const createArgs = vi.mocked(prisma.refreshToken.create).mock.calls[0][0];
      expect(createArgs.data.user_id).toBe(mockPayload.userId);
      expect(createArgs.data.token_hash).toBeDefined();

      expect(result).toBe(mockToken);
    });
  });

  describe('rotateTokens', () => {
    const oldToken = 'old-refresh-token';
    const oldTokenHash = crypto.createHash('sha256').update(oldToken).digest('hex');

    it('should issue new tokens if old refresh token is valid and not revoked', async () => {
      vi.mocked(verify).mockReturnValue(mockPayload as never);
      vi.mocked(sign).mockReturnValue('new-token' as never);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
        id: 'token-1',
        token_hash: oldTokenHash,
        user_id: mockPayload.userId,
        expires_at: futureDate,
        is_revoked: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      vi.mocked(prisma.refreshToken.update).mockResolvedValue({} as never);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as never);

      const result = await TokenService.rotateTokens(oldToken);

      expect(verify).toHaveBeenCalledWith(oldToken, env.JWT_REFRESH_SECRET);
      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token_hash: oldTokenHash },
      });
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-1' },
        data: { is_revoked: true },
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('newRefreshToken');
    });

    it('should throw AppError if refresh token is expired in database', async () => {
      vi.mocked(verify).mockReturnValue(mockPayload as never);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
        id: 'token-1',
        token_hash: oldTokenHash,
        user_id: mockPayload.userId,
        expires_at: pastDate,
        is_revoked: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(TokenService.rotateTokens(oldToken)).rejects.toThrow(
        new AppError(
          'Invalid or expired refresh token',
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODE.UNAUTHORIZED,
        ),
      );
    });

    it('should throw AppError if refresh token is revoked', async () => {
      vi.mocked(verify).mockReturnValue(mockPayload as never);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
        id: 'token-1',
        token_hash: oldTokenHash,
        user_id: mockPayload.userId,
        expires_at: futureDate,
        is_revoked: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 1 });

      await expect(TokenService.rotateTokens(oldToken)).rejects.toThrow(
        new AppError(
          'Token reuse detected. All sessions have been revoked for security.',
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODE.UNAUTHORIZED,
        ),
      );
    });

    it('should catch jwt.verify errors and throw generic unauthorized', async () => {
      vi.mocked(verify).mockImplementation(() => {
        throw new Error('JWT Signature Invalid');
      });

      await expect(TokenService.rotateTokens(oldToken)).rejects.toThrow(
        new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED),
      );
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all active tokens for a user', async () => {
      vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 2 });

      await TokenService.revokeAllUserTokens(mockPayload.userId);

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { user_id: mockPayload.userId, is_revoked: false },
        data: { is_revoked: true },
      });
    });
  });
});
