import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from '../config/env';
import { logger } from './logger';

const connectionString = `${process.env.DATABASE_URL}`;

// Set up the pg connection pool using the pooled URL
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Pass the adapter to the Prisma 7 Client
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
          ]
        : ['error'],
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

if (env.NODE_ENV === 'development') {
  // @ts-expect-error - dynamic event assignment
  prisma.$on('query', (e: any) => {
    if (e.duration > 50) {
      logger.warn(`Slow Query (${e.duration}ms): ${e.query}`);
    }
  });
}
