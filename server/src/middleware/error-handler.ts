import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, ERROR_CODE } from '../config/constants';
import { logger } from '../lib/logger';
import { ApiResponse } from '../utils/api-response';
import { AppError } from '../utils/app-error';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  // Operational errors (AppError)
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.statusCode, err.message, {
      code: err.code,
    });
  }

  // Prisma errors (unique constraint violation, etc.)
  if (err.name === 'PrismaClientKnownRequestError') {
    // @ts-expect-error - Prisma error typing
    if (err.code === 'P2002') {
      return ApiResponse.error(
        res,
        HTTP_STATUS.CONFLICT,
        'A record with this value already exists',
        { code: ERROR_CODE.CONFLICT },
      );
    }
  }

  // Unexpected errors
  logger.error(
    {
      err,
      req: {
        id: req.id,
        method: req.method,
        url: req.url,
        body: req.body,
      },
    },
    'Unhandled Error',
  );

  return ApiResponse.error(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal Server Error', {
    code: ERROR_CODE.INTERNAL_ERROR,
  });
};
