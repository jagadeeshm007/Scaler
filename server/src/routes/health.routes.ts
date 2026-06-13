import { Router } from 'express';

import { HTTP_STATUS } from '../config/constants';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Perform a lightweight DB query to ensure the connection pool is healthy
    await prisma.$queryRaw`SELECT 1`;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        status: 'UP',
        timestamp: new Date().toISOString(),
        database: 'CONNECTED',
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Health check failed due to database connection error');
    res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      details: 'Database connection failed',
    });
  }
});

export const healthRoutes = router;
