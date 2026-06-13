import type { Request, Response, NextFunction } from 'express';

import { HTTP_STATUS, ERROR_CODE } from '../config/constants';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';

const TTL_MS = 24 * 60 * 60 * 1000;

export interface IdempotentRequest extends Request {
  idempotencyKey?: string;
}

/**
 * Requires X-Idempotency-Key on mutating routes.
 * Replays stored responses for duplicate keys within the 24-hour TTL.
 */
export const requireIdempotencyKey = async (
  req: IdempotentRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const key = req.header('X-Idempotency-Key');

  if (!key || key.trim().length === 0) {
    next(
      new AppError(
        'Missing X-Idempotency-Key header',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
      ),
    );
    return;
  }

  const route = `${req.method} ${req.baseUrl}${req.path}`;

  try {
    const existing = await prisma.idempotencyKey.findUnique({ where: { key } });

    if (existing && existing.expires_at > new Date()) {
      res.status(existing.status_code).json(existing.response);
      return;
    }

    req.idempotencyKey = key;
    res.locals.idempotencyRoute = route;
    next();
  } catch (error) {
    next(error);
  }
};

/** Persist a successful idempotent response (call from controller after handling) */
export async function storeIdempotentResponse(
  key: string,
  route: string,
  statusCode: number,
  response: object,
): Promise<void> {
  await prisma.idempotencyKey.upsert({
    where: { key },
    create: {
      key,
      route,
      status_code: statusCode,
      response,
      expires_at: new Date(Date.now() + TTL_MS),
    },
    update: {
      route,
      status_code: statusCode,
      response,
      expires_at: new Date(Date.now() + TTL_MS),
    },
  });
}
