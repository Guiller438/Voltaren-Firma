import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // O '0.0.0.0' para asegurar que escuche todas las interfaces
    port: 5173 // Puedes definir el puerto que desees
  }
})
