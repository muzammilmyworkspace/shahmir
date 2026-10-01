import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.thewestsidestudios.com',
  integrations: [react()],
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
