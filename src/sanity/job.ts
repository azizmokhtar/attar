// schemaTypes/job.ts
export default {
  name: 'job',
  title: 'Stellenanzeige',
  type: 'document',
  fields: [
    { name: 'title', title: 'Job Titel', type: 'string', validation: (Rule) => Rule.required() },
    { name: 'type', title: 'Anstellungsart', type: 'string', description: 'z.B. Vollzeit, Teilzeit, Minijob' },
    { name: 'location', title: 'Standort', type: 'string' },
    { name: 'description', title: 'Kurzbeschreibung', type: 'text' },
    { 
      name: 'publishedAt', 
      title: 'Veröffentlichungsdatum', 
      type: 'datetime',
      initialValue: (new Date()).toISOString()
    },
  ]
}