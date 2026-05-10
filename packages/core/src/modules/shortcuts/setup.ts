import type { ModuleSetupConfig } from '@open-mercato/shared/lib/modules'

export const setup: ModuleSetupConfig = {
  defaultRoleFeatures: {
    admin: ['shortcuts.view', 'shortcuts.manage'],
    user: ['shortcuts.view', 'shortcuts.manage'],
  },
}