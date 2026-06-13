import crypto from 'crypto';

import { sign, verify } from 'jsonwebtoken';

import type { SignOptions } from 'jsonwebtoken';
import { ERROR_CODE, HTTP_STATUS } from '../config/constants';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';

interface TokenPayload {
  userId: string;
  email: string;
}

export class TokenService {
  /**
   * Generates a short-lived access token
   */
  static generateAccessToken(payload: TokenPayload): string {
    return sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: String(env.JWT_ACCESS_EXPIRES_IN) as SignOptions['expiresIn'],
    });
  }

  /**
   * Generates a long-lived refresh token and stores its hash in the database
   */
  static async generateRefreshToken(payload: TokenPayload): Promise<string> {
    const refreshToken = sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: String(env.JWT_REFRESH_EXPIRES_IN) as SignOptions['expiresIn'],
    });

    // Hash the token before saving to database for security
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Parse expiration string (e.g., '7d') to Date object
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Defaulting to 7 days to match env fallback

    await prisma.refreshToken.create({
      data: {
        token_hash: tokenHash,
        user_id: payload.userId,
        expires_at: expiresAt,
      },
    });

    return refreshToken;
  }

  /**
   * Verifies a refresh token and issues a new access token
   */
  static async rotateTokens(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    try {
      const decoded = verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;
      const tokenHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');

      // Check if the token exists and is not revoked
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token_hash: tokenHash },
      });

      if (!storedToken || storedToken.expires_at < new Date()) {
        throw new AppError(
          'Invalid or expired refresh token',
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODE.UNAUTHORIZED,
        );
      }

      // TOKEN REUSE DETECTION
      // If a token is already revoked but someone tries to use it, it means the token was likely stolen.
      // We must immediately revoke all tokens for this user.
      if (storedToken.is_revoked) {
        await prisma.refreshToken.updateMany({
          where: { user_id: storedToken.user_id, is_revoked: false },
          data: { is_revoked: true },
        });

        throw new AppError(
          'Token reuse detected. All sessions have been revoked for security.',
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODE.UNAUTHORIZED,
        );
      }

      // Revoke the old token (Refresh Token Rotation)
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { is_revoked: true },
      });

      // Generate new tokens
      const newAccessToken = this.generateAccessToken({
        userId: decoded.userId,
        email: decoded.email,
      });
      const newRefreshToken = await this.generateRefreshToken({
        userId: decoded.userId,
        email: decoded.email,
      });

      return { accessToken: newAccessToken, newRefreshToken };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'Invalid refresh token',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODE.UNAUTHORIZED,
      );
    }
  }

  /**
   * Revokes all refresh tokens for a user (useful for logout everywhere)
   */
  static async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { user_id: userId, is_revoked: false },
      data: { is_revoked: true },
    });
  }
}
