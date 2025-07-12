import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Use absolute paths
  build: {
    outDir: '../public', // Output directly to the public directory
    emptyOutDir: true,   // Empty the output directory before building
    target: 'es2015',    // Target older browsers for better compatibility
    minify: 'esbuild',   // Use esbuild for minification (faster and more reliable)
    rollupOptions: {
      output: {
        format: 'es',    // Use ES modules format for better compatibility with modern browsers
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        inlineDynamicImports: false // Allow code splitting for better performance
      }
    }
  }
})
