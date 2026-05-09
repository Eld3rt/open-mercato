import type { AclConfig } from '@open-mercato/shared/lib/acl'

export const features: AclConfig['features'] = {
  'reminders.view': {
    description: 'View reminders',
    category: 'Reminders',
  },
  'reminders.manage': {
    description: 'Create, update, and delete reminders',
    category: 'Reminders',
  },
}