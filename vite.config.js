import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('victory-vendor') || id.includes('d3-')) {
              return 'vendor-d3';
            }
            if (id.includes('recharts')) {
              return 'vendor-recharts';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('dayjs') || id.includes('date-fns')) {
              return 'vendor-dates';
            }
            if (id.includes('@dnd-kit')) {
              return 'vendor-dnd';
            }
            if (id.includes('react-confetti') || id.includes('canvas-confetti')) {
              return 'vendor-confetti';
            }
          }
        },
      },
    },
  },
})
