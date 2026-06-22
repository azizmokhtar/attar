// @ts-check
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// Build a { slug -> ISO date } map from blog frontmatter so each post's
// sitemap <lastmod> reflects when it was actually written/updated, not the
// build time. Uses updatedDate if present, otherwise pubDate.
const blogDir = fileURLToPath(new URL('./src/content/blog', import.meta.url));
const blogLastmod = {};
for (const file of readdirSync(blogDir)) {
  if (!/\.(md|mdx)$/.test(file)) continue;
  const slug = file.replace(/\.(md|mdx)$/, '');
  const fm = readFileSync(`${blogDir}/${file}`, 'utf-8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) continue;
  const pub = fm[1].match(/^pubDate:\s*(.+)$/m)?.[1]?.trim();
  const upd = fm[1].match(/^updatedDate:\s*(.+)$/m)?.[1]?.trim();
  const date = upd || pub;
  if (date) blogLastmod[slug] = new Date(date).toISOString();
}

export default defineConfig({
  site: 'https://attardienstleistungen.com',
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
        // Strip the trailing slash so each <loc> matches the page's canonical
        // tag (Layout.astro emits canonicals without a trailing slash).
        const url = item.url.replace(/\/$/, '') || item.url;
        const path = new URL(url).pathname;

        let priority = 0.7;
        if (path === '/' || path === '') priority = 1.0;
        else if (path === '/dienstleistungen' || path === '/kontakt') priority = 0.9;
        else if (path === '/ueber-uns' || path === '/karriere' || path === '/blog') priority = 0.8;
        else if (path.startsWith('/blog/')) priority = 0.6;
        else if (['/impressum', '/datenschutz', '/agb'].includes(path)) priority = 0.3;

        // Use the real publish/update date for blog posts.
        let lastmod = item.lastmod;
        const blogMatch = path.match(/^\/blog\/([^/]+)$/);
        if (blogMatch && blogLastmod[blogMatch[1]]) {
          lastmod = blogLastmod[blogMatch[1]];
        }

        return { ...item, url, priority, lastmod };
      },
    }),
  ],
  adapter: vercel()
});
