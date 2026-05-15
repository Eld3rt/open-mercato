import type { ModuleSetupConfig } from '@open-mercato/shared/lib/modules/setup'

export const setup: ModuleSetupConfig = {
  defaultRoleFeatures: {
    admin: ['project_comments.view', 'project_comments.create', 'project_comments.update', 'project_comments.delete'],
    user: ['project_comments.view', 'project_comments.create'],
  },
  defaultCustomerRoleFeatures: {
    customer: ['project_comments.view'],
  },
  seedDefaults: async ({ em }) => {
    // No default data needed for project comments
  },
}