import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compare, hash } from 'bcrypt';

import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { HTTP_STATUS } from '../../src/config/constants';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('Auth Integration Tests (API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hash).mockResolvedValue('hashedpassword' as never);
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password_hash: 'hashedpassword',
        full_name: 'Test User',
        timezone: 'UTC',
        deleted_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as never);

      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as never);

      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser',
        full_name: 'Test User',
      });

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should fail if email is already registered', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-existing',
        email: 'existing@example.com',
      } as never);

      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'existing@example.com',
        password: 'Password123!',
        username: 'newuser',
        full_name: 'Test User',
      });

      expect(response.status).toBe(HTTP_STATUS.CONFLICT);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email already exists');
    });

    it('should fail validation with weak password', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'weak',
        username: 'testuser',
        full_name: 'Test User',
      });

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password_hash: 'hashedpassword',
        deleted_at: null,
      } as never);

      vi.mocked(compare).mockResolvedValue(true as never);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as never);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.accessToken).toBeDefined();

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies?.[0]).toContain('refresh_token=');
    });

    it('should fail login with incorrect password', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password_hash: 'hashedpassword',
        deleted_at: null,
      } as never);

      vi.mocked(compare).mockResolvedValue(false as never);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });
  });
});
