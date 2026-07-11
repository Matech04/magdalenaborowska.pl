import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/*
 * Integracja Astro: generuje `dist/_headers` (Cloudflare Pages) z nagłówkami
 * bezpieczeństwa. CSP `script-src` dostaje hashe SHA-256 WSZYSTKICH inline'owych
 * skryptów wykrytych w zbudowanym HTML — liczone przy każdym buildzie, więc nigdy
 * nie rozjadą się z treścią skryptów (edycja treści CMS / aktualizacja zależności).
 *
 * Reużywalne per klient. Dostrój ALLOWED_* pod zewnętrzne zasoby danej instancji.
 */

// Zewnętrzne źródła używane przez stronę (poza 'self'):
const IMG = ["'self'", 'data:', 'https://*.basemaps.cartocdn.com']; // kafelki mapy Leaflet + data URI
const CONNECT = ["'self'"];
const FORM_ACTION = ["'self'", 'https://rezerwacja.magdalenaborowska.pl']; // CTA rezerwacji

const PERMISSIONS_POLICY = [
  'accelerometer=()',
  'autoplay=()',
  'camera=()',
  'display-capture=()',
  'encrypted-media=()',
  'gyroscope=()',
  'geolocation=()',
  'magnetometer=()',
  'microphone=()',
  'payment=()',
  'usb=()',
].join(', ');

// Wyłuskaj treść inline'owych, wykonywalnych <script> (bez src, bez JSON/ld+json).
function inlineScriptHashes(html) {
  const hashes = new Set();
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1] || '';
    const body = m[2] || '';
    if (/\bsrc\s*=/.test(attrs)) continue; // zewnętrzny
    if (/type\s*=\s*["'][^"']*json[^"']*["']/i.test(attrs)) continue; // application/json, ld+json
    if (body.trim() === '') continue;
    const digest = createHash('sha256').update(body, 'utf8').digest('base64');
    hashes.add(`'sha256-${digest}'`);
  }
  return hashes;
}

async function htmlFiles(dir) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.html'))
    .map((e) => join(e.parentPath ?? e.path, e.name));
}

export default function securityHeaders() {
  return {
    name: 'security-headers',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const files = await htmlFiles(distDir);

        const scriptHashes = new Set();
        for (const file of files) {
          const html = await readFile(file, 'utf8');
          for (const h of inlineScriptHashes(html)) scriptHashes.add(h);
        }

        const scriptSrc = ["'self'", ...scriptHashes].join(' ');
        const csp = [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          `img-src ${IMG.join(' ')}`,
          "font-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          `script-src ${scriptSrc}`,
          `connect-src ${CONNECT.join(' ')}`,
          `form-action ${FORM_ACTION.join(' ')}`,
          "manifest-src 'self'",
          'upgrade-insecure-requests',
        ].join('; ');

        const headers = [
          '/*',
          '  Strict-Transport-Security: max-age=31536000',
          '  X-Frame-Options: SAMEORIGIN',
          '  X-Content-Type-Options: nosniff',
          '  Referrer-Policy: strict-origin-when-cross-origin',
          `  Permissions-Policy: ${PERMISSIONS_POLICY}`,
          `  Content-Security-Policy: ${csp}`,
          '',
        ].join('\n');

        await writeFile(join(distDir, '_headers'), headers, 'utf8');
        logger.info(
          `_headers zapisany (CSP z ${scriptHashes.size} hashami inline-script).`,
        );
      },
    },
  };
}
