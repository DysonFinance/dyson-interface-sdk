import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    teardownTimeout: 0,
    globalSetup: ["./tests/globalSetup.ts"],
    setupFiles: []
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './lib'),
    },
  },
})
