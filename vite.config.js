import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import Uni from '@uni-helper/plugin-uni'

export default defineConfig({
  esbuild: {
    target: 'es2015'
  },
  build: {
    target: 'es2015'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@uni': fileURLToPath(new URL('./uni_modules', import.meta.url))
    }
  },
  plugins: [Uni()]
})
