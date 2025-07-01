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
          name: 'pdfmake',
          var: 'pdfMake',
          path: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/pdfmake.min.js',
        },
        {
          name: 'vfs_fonts',
          var: 'vfsFonts',
          path: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/vfs_fonts.min.js',
        },
      ],
    }),
  ],
});
