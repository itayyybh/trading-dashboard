import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['recharts'],
  },
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
})
