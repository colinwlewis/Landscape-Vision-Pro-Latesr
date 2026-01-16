
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This allows the app to access process.env.API_KEY on Vercel
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
  }
});
