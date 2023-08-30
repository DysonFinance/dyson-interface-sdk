import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'lib'),
    },
    mainFields: ['node'],
    browserField: false,
  },
  build: {
    lib: {
      entry: {
        'index': './lib/index.ts',
        'agency': './lib/agency',
        'constants': './lib/constants',
        'reward': './lib/reward',
      },
      name: 'Dyson Interface SDK',
    },
    rollupOptions: {
      external: ['buffer'],
    },
  },
  plugins: [
    dts({
      exclude: [
        '**/errors/utils.ts',
        '**/dist/**',
        '**/*.test.ts',
        '**/_test/**',
      ],
      outDir: 'dist/types',
      rollupTypes: true,
    }),
  ],
});
