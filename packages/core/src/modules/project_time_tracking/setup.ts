import type { ModuleSetupConfig } from '@open-mercato/shared/lib/modules/setup'

export const setup: ModuleSetupConfig = {
  defaultRoleFeatures: {
    admin: ['project_time_tracking.view', 'project_time_tracking.manage'],
    user: ['project_time_tracking.view', 'project_time_tracking.manage'],
  },
  defaultCustomerRoleFeatures: {
    customer: [],
  },
  seedDefaults: async () => {
    // No default time tracking data required.
  },
}
