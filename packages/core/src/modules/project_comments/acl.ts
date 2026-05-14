import type { AclModule } from '@open-mercato/shared/lib/acl'

export const features = {
  'project_comments.view': {
    description: 'View project comments',
    category: 'project_comments',
  },
  'project_comments.create': {
    description: 'Create new project comments',
    category: 'project_comments',
  },
  'project_comments.update': {
    description: 'Update project comments',
    category: 'project_comments',
  },
  'project_comments.delete': {
    description: 'Delete project comments',
    category: 'project_comments',
  },
} satisfies AclModule['features']