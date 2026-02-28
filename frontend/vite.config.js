import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',        // allow Docker container to be reached from host
    watch: { usePolling: true }, // needed for Docker volume file watching on Windows
    proxy: {
      '/api': {
        target: process.env.DOCKER ? 'http://backend:4000' : 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.DOCKER ? 'http://backend:4000' : 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
