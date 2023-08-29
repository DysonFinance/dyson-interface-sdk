import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    globals: true,
    teardownTimeout: 0,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './lib'),
    },
  },
})
