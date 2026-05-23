import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // СТРОГО для GitHub Pages
  base: '/wallbreaker-v2/',
  server: {
    port: 5173,
    host: true, // Позволяет подключаться с других устройств в локальной сети
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
