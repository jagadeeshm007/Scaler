import crypto from 'crypto';

import type { IncomingMessage } from 'http';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json, urlencoded } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { HTTP_STATUS } from './config/constants';
import { env } from './config/env';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/error-handler';
import { apiRoutes } from './routes/index';
import { ApiResponse } from './utils/api-response';

export const app = express();

// Set Request ID
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = crypto.randomUUID();
  next();
});

// Build the allowed-origins list from the comma-separated CLIENT_URL env var.
// Supports multiple Vercel deployment URLs in production.
const allowedOrigins = env.CLIENT_URL.split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const isNoOrigin = !origin;
      const isExactMatch = origin !== undefined && allowedOrigins.includes(origin);
      const isVercelPreview =
        env.NODE_ENV === 'production' &&
        origin !== undefined &&
        /^https:\/\/[\w-]+\.vercel\.app$/.test(origin);

      if (isNoOrigin || isExactMatch || isVercelPreview) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' is not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
  }),
);
app.use(compression());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use(
  pinoHttp({
    logger,
    genReqId: (req: IncomingMessage & { id?: string }) => req.id,
    autoLogging: {
      ignore: (req) => req.url === '/health',
    },
  }) as unknown as RequestHandler,
);

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1', apiRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  ApiResponse.error(res, HTTP_STATUS.NOT_FOUND, `Route ${req.method} ${req.originalUrl} not found`);
});

// Global Error Handler
app.use(errorHandler);
