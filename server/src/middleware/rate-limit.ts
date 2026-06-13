import { rateLimit } from 'express-rate-limit';

import { ERROR_CODE, HTTP_STATUS } from '../config/constants';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many requests, please try again later',
      error: { code: ERROR_CODE.RATE_LIMITED },
    });
  },
});
