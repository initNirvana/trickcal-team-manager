/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import SsgoiAutoKey from '@ssgoi/react/unplugin/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), tsconfigPaths(), SsgoiAutoKey()],
  publicDir: 'public',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    // you might want to disable it, if you don't have tests that rely on CSS
    // since parsing CSS is slow
    css: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'react';
          if (id.includes('react-router')) return 'router';
          if (id.includes('zustand')) return 'state';
          if (id.includes('zod')) return 'schema';
          if (id.includes('lodash')) return 'lodash';
          if (id.includes('html-to-image')) return 'html-to-image';
          if (id.includes('react-icons')) return 'icons';
          if (id.includes('ssgoi')) return 'ssgoi';
          return 'vendor';
        },
      },
    },
  },
});
