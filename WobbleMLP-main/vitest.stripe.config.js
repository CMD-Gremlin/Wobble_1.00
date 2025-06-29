// Vitest configuration for Stripe webhook tests
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 10000,
    include: ['test/unit/stripe.webhook.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    watch: false,
    logHeapUsage: true,
    minThreads: 1,
    maxThreads: 1,
    testNamePattern: '.*',
    passWithNoTests: true,
    silent: false,
    logLevel: 'info',
    // Disable type checking for now to isolate the issue
    typecheck: {
      enabled: false
    }
  }
});
