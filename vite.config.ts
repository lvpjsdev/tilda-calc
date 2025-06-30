import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import cdnImport from 'vite-plugin-cdn-import';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    cdnImport({
      modules: [
        {
          name: '@emailjs/browser',
          var: 'emailjs',
          path: 'https://cdn.jsdelivr.net/npm/@emailjs/browser/dist/email.min.js',
        },
        {
          name: '@pdf-lib/fontkit',
          var: 'fontkit',
          path: 'https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit/dist/fontkit.umd.min.js',
        },
        {
          name: 'pdf-lib',
          var: 'PDFLib',
          path: 'https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js',
        },
      ],
    }),
  ],
});
