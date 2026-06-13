import { TokenExpiredError, verify } from 'jsonwebtoken';

import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, ERROR_CODE, AUTH } from '../config/constants';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';
import { asyncHandler } from '../utils/async-handler';

interface JwtPayload {
  userId: string;
  email: string;
}

export const requireAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith(AUTH.ACCESS_TOKEN_PREFIX)) {
    throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, deleted_at: true },
    });

    if (!user || user.deleted_at) {
      throw new AppError(
        'User no longer exists',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODE.UNAUTHORIZED,
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AppError('Token expired', HTTP_STATUS.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);
    }
    throw new AppError('Invalid token', HTTP_STATUS.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);
  }
});
