import type { APIRoute } from 'astro';

/*
 * robots.txt dynamiczny — spójny z meta robots w Layout.astro.
 * PUBLIC_NOINDEX=true (lub dev) → blokuje całość (tryb niespodzianki).
 * Domyślnie (produkcja) → zezwala i wskazuje sitemapę.
 */
const noindex = import.meta.env.DEV || import.meta.env.PUBLIC_NOINDEX === 'true';

export const GET: APIRoute = ({ site }) => {
  const sitemap = site ? new URL('sitemap-index.xml', site).href : undefined;

  const body = noindex
    ? ['User-agent: *', 'Disallow: /', ''].join('\n')
    : [
        'User-agent: *',
        'Allow: /',
        ...(sitemap ? [`Sitemap: ${sitemap}`] : []),
        '',
      ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
