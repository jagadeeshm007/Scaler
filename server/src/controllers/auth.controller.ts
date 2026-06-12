import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { ApiResponse } from '../utils/api-response';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { HTTP_STATUS } from '../config/constants';
import ms from 'ms';
import { env } from '../config/env';

export class AuthController {
  private static setRefreshTokenCookie(res: Response, refreshToken: string) {
    // Determine expiration in ms based on the configured JWT_REFRESH_EXPIRES_IN (e.g. '7d')
    const maxAge = ms(env.JWT_REFRESH_EXPIRES_IN as any);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: maxAge as unknown as number,
    });
  }

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } = await AuthService.login(req.body);

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
    const oldRefreshToken = req.cookies?.refresh_token;

    if (!oldRefreshToken) {
      return ApiResponse.error(res, HTTP_STATUS.UNAUTHORIZED, 'No refresh token provided');
    }

    const { accessToken, newRefreshToken } = await TokenService.rotateTokens(oldRefreshToken);

    AuthController.setRefreshTokenCookie(res, newRefreshToken);

    return ApiResponse.success(res, 'Token refreshed successfully', {
      accessToken,
    });
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    // If the user is authenticated via middleware, req.user will be populated
    if (req.user) {
      await TokenService.revokeAllUserTokens(req.user.id);
    }

    res.clearCookie('refresh_token');
    return ApiResponse.success(res, 'Logged out successfully');
  });
}
