import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Open_source_metrics/dashboard/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    open: true,
  },
})
