// Project catalog — single source of truth for the project gallery.
// To add a new project:
//   1. Drop your photos into  public/projekte/<folder>/
//   2. Append an entry below with the matching service slug
//   3. (Optional) Set `featured: true` to surface it first

export const SERVICE_LABELS = {
  reinigung: 'Reinigungsservice',
  hausmeister: 'Hausmeisterservice',
  umzug: 'Umzugsservice',
  garten: 'Gartenservice',
} as const;

export type ServiceSlug = keyof typeof SERVICE_LABELS;

export interface Project {
  /** URL-safe identifier, used in DOM ids. Must be unique. */
  slug: string;
  /** Display title. */
  title: string;
  /** Which service this project belongs to. */
  service: ServiceSlug;
  /** 1–2 sentence summary shown in the lightbox. */
  description: string;
  /** City / location, displayed as eyebrow. */
  location?: string;
  /** Free-text date, e.g. "März 2025". */
  date?: string;
  /** Folder name inside /public/projekte/ (case-sensitive). */
  folder: string;
  /** Image filenames in the folder, in display order. First entry is the cover. */
  images: string[];
  /** Surface this project first across the site. */
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: 'aldi-scanner-wartung',
    title: 'Aldi – Scanner-Wartung',
    service: 'hausmeister',
    description:
      'Technische Wartung und Reinigung der Kassenscanner einer Aldi-Filiale. Geräte demontiert, gereinigt, justiert und wieder einsatzbereit übergeben – außerhalb der Geschäftszeiten und ohne Verkaufsausfall.',
    location: 'Kirn',
    date: 'März 2025',
    folder: 'Aldi-scanner',
    images: ['p1.jpg', 'p2.jpg', 'p3.jpg'],
    featured: true,
  },
  {
    slug: 'entruempelung-wohnung',
    title: 'Wohnungsauflösung & Entrümpelung',
    service: 'umzug',
    description:
      'Komplette Wohnungsauflösung inklusive Räumung, fachgerechter Entsorgung und besenreiner Übergabe an die Hausverwaltung. Diskret, strukturiert und in vereinbartem Zeitfenster abgeschlossen.',
    location: 'Kirn',
    date: 'April 2025',
    folder: 'Entruemplung',
    images: ['p2.jpg', 'p3.jpg'],
    featured: true,
  },
];

/** Sort featured projects first while preserving declared order within each group. */
function sortProjects(list: Project[]): Project[] {
  return [...list].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
}

export function getAllProjects(): Project[] {
  return sortProjects(projects);
}

export function getProjectsByService(service: ServiceSlug): Project[] {
  return sortProjects(projects.filter((p) => p.service === service));
}

export function getProjectImageUrl(project: Project, filename: string): string {
  return `/projekte/${project.folder}/${filename}`;
}
