// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://magdalenaborowska.pl',
  // Statyczny build dla Cloudflare Pages; trasy Keystatic (/keystatic, /api/keystatic)
  // są renderowane on-demand przez adapter Cloudflare.
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [react(), keystatic(), icon(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
