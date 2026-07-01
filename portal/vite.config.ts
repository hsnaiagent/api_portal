import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { createGeminiDevMiddleware } from './server/gemini-routes.mjs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'gemini-dev-proxy',
        configureServer(server) {
          server.middlewares.use(createGeminiDevMiddleware(env));
        },
      },
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          bypass(req) {
            if (req.url?.startsWith('/api/gemini')) return req.url;
          },
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            radix: [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-tooltip',
            ],
            icons: ['lucide-react'],
            syntax: ['prism-react-renderer'],
          },
        },
      },
    },
  };
});
