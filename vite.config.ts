import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import cdnImport from 'vite-plugin-cdn-import';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    cdnImport({
      enableInDevMode: true,
      modules: [
        {
          name: '@emailjs/browser',
          var: 'emailjs',
          path: 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
        },
        {
          name: '@pdf-lib/fontkit',
          var: 'fontkit',
          path: 'https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js',
        },
        {
          name: 'pdf-lib',
          var: 'PDFLib',
          path: 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
        },
      ],
    }),
  ],
});
