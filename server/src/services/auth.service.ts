import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';
import { ERROR_CODE, HTTP_STATUS } from '../config/constants';
import { TokenService } from './token.service';
import { LoginInput } from '@scaler/types';

export class AuthService {
  /**
   * Logs in a user using email and password
   */
  static async login(
    data: LoginInput,
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
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

    const isValidPassword = await bcrypt.compare(data.password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);
    }

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = TokenService.generateAccessToken(tokenPayload);
    const refreshToken = await TokenService.generateRefreshToken(tokenPayload);

    // Filter out sensitive data before returning
    const { password_hash, ...safeUser } = user;

    return { accessToken, refreshToken, user: safeUser };
  }

  /**
   * Bypasses auth by immediately logging in as the pre-seeded demo user
   * Used specifically for the Scaler assignment requirements ("No Login Required").
   */
  static async bypass(): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    // Look up the pre-seeded demo user (hardcoded email matching seed.ts)
    const demoEmail = 'jagadeesh.m@deeptaai.com';

    let user = await prisma.user.findUnique({
      where: { email: demoEmail },
    });

    // If somehow the DB wasn't seeded, we create the user on the fly for a seamless experience
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

    const { password_hash, ...safeUser } = user;

    return { accessToken, refreshToken, user: safeUser };
  }
}
