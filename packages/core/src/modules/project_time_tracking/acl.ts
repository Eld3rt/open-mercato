import type { AclModule } from '@open-mercato/shared/lib/acl'

export const features = {
  'project_time_tracking.view': {
    description: 'View tracked time entries',
    category: 'project_time_tracking',
  },
  'project_time_tracking.manage': {
    description: 'Create, update, and delete time entries',
    category: 'project_time_tracking',
  },
} satisfies AclModule['features']
