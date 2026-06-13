import type { VercelRequest, VercelResponse } from '@vercel/node';

import { processBackgroundJobs } from '../../src/lib/event-bus';
import { logger } from '../../src/lib/logger';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const processed = await processBackgroundJobs();
    res.status(200).json({ processed, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error({ err: error }, '[Cron] Background job processing failed');
    res.status(500).json({ error: 'Job processing failed' });
  }
}
