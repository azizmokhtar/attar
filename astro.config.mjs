// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sanity from '@sanity/astro';
import react from '@astrojs/react';

import vercel from '@astrojs/vercel';

import { schema } from './src/sanity/schema';


// https://astro.build/config
export default defineConfig({
  output: 'server',
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    // astro.config.mjs
  sanity({
    projectId: "q1x0tclx",
    dataset: "production",
    studioIndexPath: "/admin", // This creates your dashboard at /admin
    studioBasePath: "/admin", // This creates your dashboard at /admin
  }),
    react()
  ],
  adapter: vercel()
});