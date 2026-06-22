// Shared service hero images, keyed by service slug.
// Imported from src/ so Astro optimizes them (WebP + responsive srcset for
// <Image>, fingerprinted .src for use in JSON-LD / og:image).
import type { ImageMetadata } from 'astro';
import reinigung from '../assets/services/reinigung.jpg';
import hausmeister from '../assets/services/hausmeister.jpg';
import umzug from '../assets/services/umzug.jpg';
import garten from '../assets/services/garten.jpg';

export const serviceImages: Record<string, ImageMetadata> = {
  reinigungsservice: reinigung,
  hausmeisterservice: hausmeister,
  umzugsservice: umzug,
  gartenservice: garten,
};
