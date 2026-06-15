import ms from 'ms';
import * as jwt from 'jsonwebtoken';

import type { Request, Response } from 'express';
import { HTTP_STATUS } from '../config/constants';
import { env } from '../config/env';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/async-handler';

export class AuthController {
  private static setRefreshTokenCookie(res: Response, refreshToken: string) {
    // Determine expiration in ms based on the configured JWT_REFRESH_EXPIRES_IN (e.g. '7d')
    const maxAge = ms(String(env.JWT_REFRESH_EXPIRES_IN) as import('ms').StringValue);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Number(maxAge),
      path: '/',
    });

    res.cookie('session_hint', '1', {
      httpOnly: false,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Number(maxAge),
      path: '/',
    });
  }

  static register = asyncHandler(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } = await AuthService.register(
      req.body as Record<string, unknown> as Parameters<typeof AuthService.register>[0],
    );

    AuthController.setRefreshTokenCookie(res, refreshToken);

    return ApiResponse.created(res, 'User registered successfully', {
      accessToken,
      user,
    });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } = await AuthService.login(
      req.body as Record<string, unknown> as Parameters<typeof AuthService.register>[0],
    );

    AuthController.setRefreshTokenCookie(res, refreshToken);

    return ApiResponse.success(res, 'Login successful', {
      accessToken,
      user,
    });
  });

  static bypass = asyncHandler(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } = await AuthService.bypass();

    AuthController.setRefreshTokenCookie(res, refreshToken);

    return ApiResponse.success(res, 'Bypass login successful', {
      accessToken,
      user,
    });
  });

  static refresh = asyncHandler(async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies.refresh_token;

    if (!oldRefreshToken) {
      return ApiResponse.error(res, HTTP_STATUS.UNAUTHORIZED, 'No refresh token provided');
    }

    try {
      const { accessToken, newRefreshToken } = await TokenService.rotateTokens(oldRefreshToken);

      AuthController.setRefreshTokenCookie(res, newRefreshToken);

      return ApiResponse.success(res, 'Token refreshed successfully', {
        accessToken,
      });
    } catch (error) {
      res.clearCookie('refresh_token');
      res.clearCookie('session_hint');
      throw error;
    }
  });

  static session = asyncHandler(async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies.refresh_token;

    if (!oldRefreshToken) {
      return ApiResponse.success(res, 'Unauthenticated', { authenticated: false });
    }

    try {
      const decoded = await TokenService.validateRefreshToken(oldRefreshToken);
      const accessToken = TokenService.generateAccessToken({
        userId: decoded.userId,
        email: decoded.email,
      });
      const user = await UserService.getCurrentUser(decoded.userId);

      return ApiResponse.success(res, 'Session retrieved successfully', {
        authenticated: true,
        accessToken,
        user,
      });
    } catch {
      res.clearCookie('refresh_token');
      res.clearCookie('session_hint');
      return ApiResponse.success(res, 'Unauthenticated', { authenticated: false });
    }
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    if (req.user) {
      await TokenService.revokeAllUserTokens(req.user.id);
    } else {
      const refreshToken = req.cookies.refresh_token;
      if (refreshToken) {
        try {
          const decoded = jwt.decode(refreshToken) as { userId?: string };
          if (decoded?.userId) {
            await TokenService.revokeAllUserTokens(decoded.userId);
          }
        } catch (e) {
          // ignore
        }
      }
    }

    res.clearCookie('refresh_token');
    res.clearCookie('session_hint');
    return ApiResponse.success(res, 'Logged out successfully');
  });
}
