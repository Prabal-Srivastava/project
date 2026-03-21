import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxying all backend routes to the Flask server on port 5000
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/submit': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/job': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/history': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
