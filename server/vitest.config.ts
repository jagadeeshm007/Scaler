import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@bolt/types': path.resolve(__dirname, '../packages/types/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/services/**/*.ts', 'src/utils/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/types/**/*.ts'],
    },
    setupFiles: ['./tests/unit/setup.ts'],
  },
});
