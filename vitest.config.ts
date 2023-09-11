import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    teardownTimeout: 0,
    globalSetup: ["./tests/globalSetup.ts"],
    testTimeout: 30_000,
    setupFiles: []
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
