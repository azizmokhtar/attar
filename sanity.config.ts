import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schema } from './src/sanity/schema';

export default defineConfig({
  name: 'default',
  title: 'Attar Dienstleistungen',

  projectId: 'q1x0tclx',
  dataset: 'production',

  plugins: [structureTool()],

  schema: schema, // This uses your types from src/sanity/schema.ts
});