import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    mainFields: ['node'],
    browserField: false,
  },
  build: {
    lib: {
      entry: {
        index: './src/index.ts',
        actions: './src/actions',
        constants: './src/constants',
        reward: './src/reward',
      },
      name: 'Dyson Interface SDK',
    },
    rollupOptions: {
      external: ['buffer', 'viem'],
    },
  },
  plugins: [
    dts({
      exclude: ['**/errors/utils.ts', '**/dist/**', '**/*.test.ts', '**/_test/**'],
      outDir: 'dist/types',
      rollupTypes: true,
    }),
  ],
})
