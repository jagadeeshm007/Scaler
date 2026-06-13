import { app } from './app';
import { env } from './config/env';
import { initEventBus, startBackgroundJobWorker } from './lib/event-bus';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

const { PORT } = env;

initEventBus();
const jobWorker = startBackgroundJobWorker();

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${env.NODE_ENV} mode on port ${String(PORT)}`);
});

// Graceful Shutdown
const shutdown = (signal: string): void => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  clearInterval(jobWorker);
  server.close(() => {
    logger.info('HTTP server closed.');
    void prisma.$disconnect().then(() => {
      logger.info('Prisma disconnected.');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  shutdown('SIGINT');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught Exception');
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled Rejection');
  shutdown('unhandledRejection');
});
1