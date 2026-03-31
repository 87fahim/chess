// vite.config.js (client root)
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react$': fileURLToPath(new URL('../../node_modules/react/index.js', import.meta.url)),
      'react-dom$': fileURLToPath(new URL('../../node_modules/react-dom/index.js', import.meta.url)),
      'react/jsx-runtime': fileURLToPath(new URL('../../node_modules/react/jsx-runtime.js', import.meta.url)),
      'react/jsx-dev-runtime': fileURLToPath(new URL('../../node_modules/react/jsx-dev-runtime.js', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['@mui/material', '@mui/icons-material'],
  },
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
