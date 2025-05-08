import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: true, // Открыть визуализатор в браузере после сборки
      filename: 'stats.html', // Имя выходного HTML-файла с визуализацией
      template: 'treemap', // Тип визуализации: sunburst, treemap, etc.
    }),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 75 },
      webp: { quality: 80 },
      avif: { quality: 70 },
      svg: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'sortAttrs' },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Кодсплитинг: разделение зависимостей
          vendor: ['react', 'react-dom', '@fortawesome/react-fontawesome'],
        },
      },
    },
  },
});