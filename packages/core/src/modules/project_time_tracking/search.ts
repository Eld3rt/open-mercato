import type { SearchModuleConfig } from '@open-mercato/shared/lib/search'

export const searchConfig: SearchModuleConfig = {
  entities: {
    project_time_entries: {
      fields: ['description'],
      displayFields: ['description'],
      filterFields: ['projectId', 'taskId', 'userId', 'status'],
      boost: 1.0,
    },
  },
}
