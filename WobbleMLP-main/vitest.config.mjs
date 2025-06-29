import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 10000,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/e2e/**',
    ],
    // Ensure proper module resolution
    alias: {
      '^@/(.*)$': fileURLToPath(new URL('./$1', import.meta.url))
    },
    // Enable ESM support
    server: {
      deps: {
        inline: ['@supabase/supabase-js']
      }
    },
    // Test configuration
    watch: false,
    logHeapUsage: true,
    minThreads: 1,
    maxThreads: 1,
    testNamePattern: '.*',
    passWithNoTests: true
  },
});
