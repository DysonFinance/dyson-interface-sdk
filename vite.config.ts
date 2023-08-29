import {resolve} from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'lib')
    }
  },
  build: {
    lib: {
      entry: './lib/main.ts',
      name: 'Dyson Interface SDK',
      fileName: 'main'
    }
  }
})
