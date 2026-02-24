import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '^/api/': {
        target: 'http://localhost:6005',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:6005',
        changeOrigin: true,
        ws: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            const silent = ['ECONNRESET', 'EPIPE', 'ECONNREFUSED'];
            if (!silent.includes(err.code)) {
              console.error('[proxy] socket error:', err.message);
            }
          });
        },
      },
    },
  },
})
