import type { ModuleInjectionTable } from '@open-mercato/shared/modules/widgets/injection'

export const injectionTable: ModuleInjectionTable = {
  'data-table:projects:columns': [
    {
      widgetId: 'projects.injection.deadline_indicator',
      priority: 40,
    },
  ],
}
