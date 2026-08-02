import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Frontend runs on 3000, Backend on 5000
  },
  build: {
    minify: 'terser', // Ensures absolute minimum file size for production
  }
});