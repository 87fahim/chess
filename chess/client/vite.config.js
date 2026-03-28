// vite.config.js (client root)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:5050', changeOrigin: true, secure: false },
      '/admin': { target: 'http://localhost:5050', changeOrigin: true, secure: false },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/components/chess/tests/**/*.test.ts', 'src/components/chess/tests/**/*.test.tsx'],
  },
});
