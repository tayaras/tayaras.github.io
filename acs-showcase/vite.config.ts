import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Relative asset URLs so the built bundle can be dropped at any path and
  // loaded in an iframe without knowing its deploy prefix.
  base: './',
  build: {
    // Built straight into the portfolio site's tree so GitHub Pages serves it at
    // /acs-demo/ — same origin as ui-library.html, which iframes it.
    outDir: '../acs-demo',
    emptyOutDir: true,
    sourcemap: false,
  },
});
