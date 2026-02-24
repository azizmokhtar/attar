// Import the job schema
import job from './job';

export const serviceSchema = {
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Service Name' },
    { name: 'subtitle', type: 'string', title: 'Subtitle' },
    { name: 'description', type: 'text', title: 'Short Description' },
    { name: 'image', type: 'image', title: 'Main Image' },
  ]
}

// Combine them into one object
export const schema = {
  types: [serviceSchema, job]
}