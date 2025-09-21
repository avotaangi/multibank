import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'nonacquiescing-ungovernmentally-paz.ngrok-free.app',
      '.ngrok-free.app',
      '.ngrok.io'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    // Telegram Web App globals
    global: 'globalThis',
  }
})
