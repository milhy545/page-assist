import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: false, // Allow fallback to another port if 5173 is taken
    open: true, // Auto-open browser
  },
  build: {
    outDir: 'dist',
  },
})
