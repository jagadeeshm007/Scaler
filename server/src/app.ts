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

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
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
