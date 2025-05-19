import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import path from 'path';

// Фильтрация переменных окружения с префиксом VITE_
const envWithPrefix = Object.fromEntries(
    Object.entries(process.env)
        .filter(([key]) => key.startsWith('VITE_'))
);

const defineEnv = Object.fromEntries(
    Object.entries(envWithPrefix).map(
        ([key, value]) => [`process.env.${key}`, JSON.stringify(value)]
    )
);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({ open: true, filename: 'stats.html', template: 'treemap' }),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 75 },
      webp: { quality: 80 },
      avif: { quality: 70 },
      svg: [{ name: 'removeViewBox', active: false }, { name: 'sortAttrs' }],
    }),
  ],

  // Здесь задаём алиасы
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // Алиас '@' -> 'src' папка
    },
  },

  build: {
    rollupOptions: {
      input: './index.html',
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@fortawesome/react-fontawesome'],
        },
      },
    },
  },

  define: defineEnv,

  server: {
    // Тут можно добавить proxy, если нужно
  },
});
