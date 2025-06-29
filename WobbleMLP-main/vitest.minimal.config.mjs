// Minimal Vitest configuration for debugging
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    include: ['**/minimal-test.js'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    watch: false,
    logHeapUsage: true,
    minThreads: 1,
    maxThreads: 1,
    testNamePattern: '.*',
    passWithNoTests: true
  }
});
