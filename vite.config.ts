import { readFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const packageJson: { dependencies: Record<string, string> } = JSON.parse(
  readFileSync('./package.json', { encoding: 'utf-8' }),
)

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
        action: './src/actions/index.ts',
        entities: './src/entities/index.ts',
        reads: './src/reads/index.ts',
        utils: './src/utils/index.ts',
      },
      name: 'Dyson Interface SDK',
    },
    rollupOptions: {
      external: [...Object.keys(packageJson.dependencies), 'buffer', 'viem'],
    },
  },
  plugins: [
    dts({
      exclude: ['**/errors/utils.ts', '**/dist/**', '**/*.test.ts', '**/__test__/**'],
      rollupTypes: true,
    }),
  ],
})
