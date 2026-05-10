import type { AclConfig } from '@open-mercato/shared/lib/acl'

export const features: AclConfig['features'] = {
  'shortcuts.view': {
    description: 'View shortcuts and bookmarks',
    category: 'Shortcuts',
  },
  'shortcuts.manage': {
    description: 'Create, update, and delete shortcuts',
    category: 'Shortcuts',
  },
}