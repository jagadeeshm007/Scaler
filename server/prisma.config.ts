import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Force the Prisma CLI to use the DIRECT URL for migrations and pulling
    url: env('DIRECT_URL'),
  },
});
