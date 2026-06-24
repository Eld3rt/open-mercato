import type { AclModule } from '@open-mercato/shared/lib/acl'

export const features = {
  'projects.view': {
    description: 'View projects',
    category: 'projects',
  },
  'projects.create': {
    description: 'Create new projects',
    category: 'projects',
  },
  'projects.manage': {
    description: 'Update and delete projects',
    category: 'projects',
  },
} satisfies AclModule['features']
