/// <reference types="vitest" />
/// <reference types="vite/client" />

import SsgoiAutoKey from '@ssgoi/react/unplugin/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
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
      includeAssets: ['favicon.svg', 'AppImages/ios/180.png'],
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
      output: {},
    },
  },
});
