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
        constants: './src/constants/index.ts',
      },
      name: 'Dyson Interface SDK',
    },
    rollupOptions: {
      external: ['buffer', 'viem', 'lodash-es'],
    },
  },
  plugins: [
    dts({
      exclude: ['**/errors/utils.ts', '**/dist/**', '**/*.test.ts', '**/__test__/**'],
      rollupTypes: true,
    }),
  ],
})
