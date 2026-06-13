import { pino } from 'pino';

import { env } from '../config/env';

const usePrettyTransport =
  env.NODE_ENV === 'development' && !process.env.VERCEL && process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: usePrettyTransport
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});
