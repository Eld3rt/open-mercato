import type { AclModule } from '@open-mercato/shared/lib/acl'

export const features = {
  'project_time_reports.view': {
    description: 'View time tracking reports',
    category: 'project_time_reports',
  },
} satisfies AclModule['features']
