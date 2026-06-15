import { compare, hash } from 'bcrypt';

import type { User } from '@prisma/client';
import type { LoginInput, RegisterInput } from '@bolt/types';
import { ERROR_CODE, HTTP_STATUS } from '../config/constants';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';

import { TokenService } from './token.service';

export class AuthService {
  /**
   * Registers a new user
   */
  static async register(
    data: RegisterInput,
  ): Promise<{ accessToken: string; refreshToken: string; user: Omit<User, 'password_hash'> }> {
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) {
      throw new AppError('Email already exists', HTTP_STATUS.CONFLICT, ERROR_CODE.CONFLICT);
    }
    const existingUsername = await prisma.user.findUnique({ where: { username: data.username } });
    if (existingUsername) {
      throw new AppError('Username already exists', HTTP_STATUS.CONFLICT, ERROR_CODE.CONFLICT);
    }

    const saltRounds = 10;
    const passwordHash = await hash(data.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        full_name: data.full_name,
        timezone: data.timezone ?? 'UTC',
        password_hash: passwordHash,
      },
    });

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = TokenService.generateAccessToken(tokenPayload);
    const refreshToken = await TokenService.generateRefreshToken(tokenPayload);

    const safeUser = { ...user };
    delete (safeUser as { password_hash?: string }).password_hash;

    return { accessToken, refreshToken, user: safeUser };
  }

  /**
   * Logs in a user using email and password
   */
  static async login(
    data: LoginInput,
  ): Promise<{ accessToken: string; refreshToken: string; user: Omit<User, 'password_hash'> }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || user.deleted_at) {
      throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);
    }

    if (!user.password_hash) {
      throw new AppError(
        'Account is configured with external provider',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODE.UNAUTHORIZED,
      );
    }

    const isValidPassword = await compare(data.password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);
    }

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = TokenService.generateAccessToken(tokenPayload);
    const refreshToken = await TokenService.generateRefreshToken(tokenPayload);

    const safeUser = { ...user };
    delete (safeUser as { password_hash?: string }).password_hash;

    return { accessToken, refreshToken, user: safeUser };
  }

  /**
   * Bypasses auth by immediately logging in as the pre-seeded demo user
   * Used specifically for the assignment requirements ("No Login Required").
   */
  static async bypass(): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Omit<User, 'password_hash'>;
  }> {
    const demoEmail = 'jagadeesh.m@deeptaai.com';

    let user = await prisma.user.findUnique({
      where: { email: demoEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: demoEmail,
          username: 'demo-user',
          full_name: 'Jagadeesh M',
          timezone: 'Asia/Kolkata',
        },
      });
    }

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = TokenService.generateAccessToken(tokenPayload);
    const refreshToken = await TokenService.generateRefreshToken(tokenPayload);

    const safeUser = { ...user };
    delete (safeUser as { password_hash?: string }).password_hash;

    return { accessToken, refreshToken, user: safeUser };
  }
}
