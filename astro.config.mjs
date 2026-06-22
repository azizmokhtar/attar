// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://attar-dienstleistungen.de',
  output: 'server',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/api/') &&
        !page.includes('/bewerben') &&
        !page.includes('/status'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'de',
        locales: { de: 'de-DE' },
      },
      serialize(item) {
        const url = item.url.replace(/\/$/, '') || item.url;
        const path = new URL(url).pathname;
        let priority = 0.7;
        if (path === '/' || path === '') priority = 1.0;
        else if (path === '/dienstleistungen' || path === '/kontakt') priority = 0.9;
        else if (path === '/ueber-uns' || path === '/karriere' || path === '/blog') priority = 0.8;
        else if (path.startsWith('/blog/')) priority = 0.6;
        else if (['/impressum', '/datenschutz', '/agb'].includes(path)) priority = 0.3;
        return { ...item, priority };
      },
    }),
  ],
  adapter: vercel()
});
