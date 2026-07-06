/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// docker-compose の spa コンテナからは api サービスに localhost では届かないため、
// コンテナ実行時は VITE_API_URL=http://api:3000 を注入して切り替える
const apiProxyTarget = process.env.VITE_API_URL ?? 'http://localhost:3000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Laravel 側の Vite(5173)と並走できるようポートをずらす
    port: 5174,
    proxy: {
      '/api': apiProxyTarget,
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    globals: false,
  },
});
