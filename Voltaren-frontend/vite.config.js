import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // En desarrollo: /api/* → http://localhost:8000/api/*
      // En producción el backend sirve el build directamente, sin proxy
      '/api': 'http://localhost:8000',
    },
  },
})
