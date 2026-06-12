import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import crypto from 'crypto';
import { env } from './config/env';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/error-handler';
import { HTTP_STATUS } from './config/constants';
import { ApiResponse } from './utils/api-response';

// Request ID augmentation
declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use(
  pinoHttp({
    logger,
    genReqId: (req: any) => req.id,
    autoLogging: {
      ignore: (req) => req.url === '/health',
    },
  }),
);

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes will be mounted here in future phases
// app.use('/api/v1', routes);

// 404 Handler
app.use('*', (req: Request, res: Response) => {
  ApiResponse.error(res, HTTP_STATUS.NOT_FOUND, `Route ${req.method} ${req.originalUrl} not found`);
});

// Global Error Handler
app.use(errorHandler);
