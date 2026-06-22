// Blog helpers — shared between the listing and the article pages.
import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

/** Published posts (drafts excluded), featured first, then newest first. */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => {
    const byFeatured = Number(b.data.featured) - Number(a.data.featured);
    if (byFeatured !== 0) return byFeatured;
    return b.data.pubDate.getTime() - a.data.pubDate.getTime();
  });
}

/** German long date, e.g. "2. Juni 2026". */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Machine-readable date for <time datetime>, e.g. "2026-06-02". */
export function isoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Rough reading time in minutes from the raw markdown body. */
export function readingMinutes(body: string | undefined): number {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Canonical path for a post. */
export function postPath(post: BlogPost): string {
  return `/blog/${post.id}`;
}
