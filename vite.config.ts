import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

// Builds the React webview (src/client) into dist/client, which Devvit uploads
// as the post's default entrypoint. `base: './'` keeps asset paths relative so
// they resolve inside Reddit's web view.
export default defineConfig({
  root: 'src/client',
  base: './',
  plugins: [react(), tailwind()],
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
  },
});
