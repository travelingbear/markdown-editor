import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: 'src',
  publicDir: false,
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2021',
    sourcemap: false
  },
  server: {
    strictPort: true
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js']
  }
});
