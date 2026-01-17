import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Fix: Property 'cwd' does not exist on type 'Process'.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Explicitly stringify the API key to ensure it is embedded in the build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
      // Fallback for other process.env usage if necessary, but empty to prevent "process is not defined"
      'process.env': {}
    },
    build: {
      outDir: 'dist',
    }
  };
});