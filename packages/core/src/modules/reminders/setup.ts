import type { ModuleSetupConfig } from '@open-mercato/shared/lib/modules'

export const setup: ModuleSetupConfig = {
  defaultRoleFeatures: {
    admin: ['reminders.view', 'reminders.manage'],
    user: ['reminders.view', 'reminders.manage'],
  },
  defaultCustomerRoleFeatures: {
    customer: ['reminders.view'],
  },
}