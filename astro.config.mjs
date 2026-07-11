// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import securityHeaders from './integrations/security-headers.mjs';

/*
 * Tryby buildu:
 *  - dev (`astro dev`)         → Keystatic + React (panel /keystatic lokalnie),
 *  - prod (`astro build`)      → W PEŁNI STATYCZNY (brak _worker.js / React na serwerze),
 *  - ENABLE_KEYSTATIC=true     → przyszły build z Keystatic online (adapter + funkcje).
 *
 * Statyczny prod eliminuje błąd „MessageChannel is not defined" na Cloudflare
 * (React 19 w funkcji Workers). Treść edytujemy lokalnie w /keystatic i pushujemy.
 */
const isDev = process.argv.includes('dev');
const cmsOnline = process.env.ENABLE_KEYSTATIC === 'true';
const withCms = isDev || cmsOnline;

// https://astro.build/config
export default defineConfig({
  site: 'https://magdalenaborowska.pl',
  output: 'static',
  // Adapter (funkcje serwerowe) tylko dla trybu Keystatic online.
  ...(cmsOnline ? { adapter: cloudflare({ imageService: 'compile' }) } : {}),
  integrations: [
    ...(withCms ? [react(), keystatic()] : []),
    icon(),
    sitemap({
      // /rezerwacja to cienki pomost-redirect do systemu rezerwacji — poza indeksem.
      filter: (page) => !page.includes('/rezerwacja'),
    }),
    securityHeaders(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
