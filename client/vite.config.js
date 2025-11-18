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
      '.ngrok-free.dev',
      '.ngrok.io',
      'multibank-dev.loca.lt',
      '.loca.lt',
      'leaseless-stephnie-amiably.ngrok-free.dev',
      ".cloudpub.ru"
    ],
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  },
  define: {
    // Telegram Web App globals
    global: 'globalThis',
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || Date.now()),
  }
})
