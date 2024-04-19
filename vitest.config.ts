import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
export default defineConfig({
  cacheDir: '.cache',
  test: {
    environment: 'node',
    globals: true,
    teardownTimeout: 0,
    globalSetup: ['./tests/globalSetup.ts'],
    testTimeout: 30_000,
    setupFiles: ['./tests/setup.ts'],
    hookTimeout: 30_000,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests/'),
    },
  },
})
