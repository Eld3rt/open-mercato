import type { ModuleSetupConfig } from '@open-mercato/shared/lib/modules/setup'

export const setup: ModuleSetupConfig = {
  defaultRoleFeatures: {
    admin: ['projects.view', 'projects.create', 'projects.manage'],
    user: ['projects.view', 'projects.create', 'projects.manage'],
  },
  defaultCustomerRoleFeatures: {
    customer: [],
  },
  seedDefaults: async () => {
    // No default project data required.
  },
}
