import type { ModuleSetupConfig } from '@open-mercato/shared/lib/modules/setup'

export const setup: ModuleSetupConfig = {
  defaultRoleFeatures: {
    admin: ['project_time_reports.view'],
    user: ['project_time_reports.view'],
  },
  defaultCustomerRoleFeatures: {},
  seedDefaults: async () => {
    // No defaults needed for reports
  },
}
