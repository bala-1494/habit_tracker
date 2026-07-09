import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, forward /api calls to the storage backend (npm run server) so the
// frontend and API share an origin without CORS friction.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
