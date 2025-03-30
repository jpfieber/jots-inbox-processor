import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/main.ts', // Path to your main plugin file
      formats: ['cjs'], // CommonJS format for Obsidian plugins
      fileName: () => 'main.js', // Output file name
    },
    rollupOptions: {
      external: ['obsidian'], // Mark 'obsidian' as an external dependency
    },
    outDir: 'dist', // Output directory
    emptyOutDir: true, // Clean the output directory before building
  },
  css: {
    // Ensure CSS is bundled into a single file
    preprocessorOptions: {
      css: {
        charset: false,
      },
    },
  },
});