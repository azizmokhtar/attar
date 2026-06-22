// Content collections — Astro 5 Content Layer.
// The blog powers /blog (listing) and /blog/<id> (article) for SEO & GEO.
//
// To publish a new article:
//   1. Create  src/content/blog/<url-slug>.md
//   2. Fill in the frontmatter below (title, description, pubDate are required)
//   3. (Optional) Drop a hero image in  public/blog/  and set `heroImage`
//   4. Add `faq` entries — they render on the page AND emit FAQPage schema,
//      which both Google rich results and AI answer engines love to cite.

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  // `schema` is a function so we can use the `image()` helper, which validates
  // the path AND hands the build pipeline an image to optimize (WebP + resize).
  schema: ({ image }) =>
    z.object({
      /** Headline — used as <h1>, <title> and og:title. */
      title: z.string(),
      /** Meta description / og:description (~150–160 chars). */
      description: z.string(),
      /** Publish date, e.g. 2026-06-01. */
      pubDate: z.coerce.date(),
      /** Last meaningful edit — improves freshness signals. */
      updatedDate: z.coerce.date().optional(),
      /** Byline. */
      author: z.string().default('Attar Dienstleistungen'),
      /** Eyebrow label / grouping, e.g. "Reinigung". */
      category: z.string().default('Ratgeber'),
      /** Free-text tags for related-content and keyword coverage. */
      tags: z.array(z.string()).default([]),
      /**
       * Hero image. Path is relative to THIS markdown file, e.g.
       * "./images/my-post.jpg" → src/content/blog/images/my-post.jpg.
       * Astro optimizes it automatically (resizes + serves WebP).
       */
      heroImage: image().optional(),
      /** Alt text for the hero image (accessibility + image SEO). */
      heroImageAlt: z.string().optional(),
      /** Hide from listings & sitemap while writing. */
      draft: z.boolean().default(false),
      /** Surface first in the listing. */
      featured: z.boolean().default(false),
      /** Q&A pairs — rendered on-page and as FAQPage JSON-LD (great for GEO). */
      faq: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .default([]),
    }),
});

export const collections = { blog };
