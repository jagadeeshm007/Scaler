import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';

import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { HTTP_STATUS } from '../../src/config/constants';

describe('Auth Integration Tests (API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock that user doesn't exist
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      // Mock created user
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password_hash: 'hashedpassword',
        full_name: 'Test User',
        created_at: new Date(),
        updated_at: new Date(),
      } as any);

      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser',
        fullName: 'Test User',
      });

      if (response.status !== HTTP_STATUS.CREATED) {
        console.log(response.body);
        if (response.body.details) console.log(response.body.details);
      }
      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should fail if email is already registered', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-existing',
      } as any);

      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'existing@example.com',
        password: 'Password123!',
        username: 'newuser',
        fullName: 'Test User',
      });

      expect(response.status).toBe(HTTP_STATUS.CONFLICT);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Email or username already exists');
    });

    it('should fail validation with weak password', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'weak', // Fails Zod validation
        username: 'testuser',
        fullName: 'Test User',
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      // Mock existing user
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password_hash: await bcrypt.hash('Password123!', 10),
      } as any);

      // Mock refresh token creation
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.accessToken).toBeDefined();

      // Verify cookie was set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken=');
    });

    it('should fail login with incorrect password', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password_hash: await bcrypt.hash('Password123!', 10),
      } as any);

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid email or password');
    });
  });
});
