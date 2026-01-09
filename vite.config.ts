/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import SsgoiAutoKey from '@ssgoi/react/unplugin/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { icons } from './src/AppImages/icons.json';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    SsgoiAutoKey(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '트릭컬 매니저',
        short_name: '트릭컬 매니저',
        description: '트릭컬 도구 사이트',
        lang: 'ko',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        start_url: '/',
        display: 'standalone',
        display_override: ['standalone', 'window-controls-overlay'],
        icons: icons.map((icon) => {
          const isMaskable = icon.src.includes('android-launchericon');
          return {
            src: `/AppImages/${icon.src}`,
            type: 'image/png',
            sizes: icon.sizes,
            purpose: isMaskable ? 'any maskable' : 'any',
          };
        }),
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
      },
    }),
  ],
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
