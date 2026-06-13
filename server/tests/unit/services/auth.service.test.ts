import { compare, hash } from 'bcrypt';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuthService } from '../../../src/services/auth.service';
import { prisma } from '../../../src/lib/prisma';
import { AppError } from '../../../src/utils/app-error';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

vi.mock('jsonwebtoken', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jsonwebtoken')>();
  return {
    ...actual,
    sign: vi.fn(actual.sign),
    verify: vi.fn(actual.verify),
  };
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register()', () => {
    it('should create user with hashed password when email is unique', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(hash).mockResolvedValue('hashed-pw' as never);

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        full_name: 'Test',
        password_hash: 'hashed-pw',
        timezone: 'UTC',
        deleted_at: null,
      };

      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as never);

      const result = await AuthService.register({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        full_name: 'Test User',
      });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).not.toHaveProperty('password_hash');
    });

    it('should throw CONFLICT AppError when email already exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      } as never);

      await expect(
        AuthService.register({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          full_name: 'Test User',
        }),
      ).rejects.toThrow(AppError);
    });

    it('should throw CONFLICT AppError when username already exists', async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: '123', username: 'testuser' } as never);

      await expect(
        AuthService.register({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          full_name: 'Test User',
        }),
      ).rejects.toThrow(AppError);
    });
  });

  describe('login()', () => {
    it('should return tokens on valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password_hash: 'hashed-pw',
        deleted_at: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(compare).mockResolvedValue(true as never);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as never);

      const result = await AuthService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.user).not.toHaveProperty('password_hash');
    });

    it('should throw UNAUTHORIZED for invalid password', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password_hash: 'hashed-pw',
        deleted_at: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(compare).mockResolvedValue(false as never);

      await expect(
        AuthService.login({
          email: 'test@example.com',
          password: 'wrongpw',
        }),
      ).rejects.toThrow(AppError);
    });
  });
});
