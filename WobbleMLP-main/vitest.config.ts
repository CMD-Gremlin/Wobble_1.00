import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 10000,
    coverage: {
      reporter: ['text', 'json', 'html'],
      provider: 'v8',
      all: true,
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      },
    },
    include: [
      'test/unit/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.vercel/**',
      '**/coverage/**',
      '**/e2e/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/build/**',
      '**/.git/**',
      '**/.idea/**',
      '**/.vscode/**',
      '**/public/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**'
    ]
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, './')
      },
      {
        find: '@lib',
        replacement: resolve(__dirname, './lib')
      },
      {
        find: '@test',
        replacement: resolve(__dirname, './test')
      },
      {
        find: '@/components',
        replacement: resolve(__dirname, './components')
      },
      {
        find: '@/pages',
        replacement: resolve(__dirname, './pages')
      }
    ]
  },
  // Add this to handle ESM modules
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    }
  },
  esbuild: {
    target: 'es2020'
  }
});
