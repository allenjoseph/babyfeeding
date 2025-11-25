import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  // Configuration for dev server to use firebase signInWithRedirect
  server: {
    https: {
      // Create a certificate for localhost
      key: readFileSync('certs/localhost.key'),
      cert: readFileSync('certs/localhost.crt')
    },
    proxy: {
      '/__/auth': {
        target: 'https://baby-feeding--firebase.web.app',
        changeOrigin: true
      }
    }
  }
});
