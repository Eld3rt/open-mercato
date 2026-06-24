import type { SearchModuleConfig } from '@open-mercato/shared/lib/search'

export const searchConfig: SearchModuleConfig = {
  entities: {
    projects: {
      fields: ['name', 'description'],
      displayFields: ['name'],
      filterFields: ['status', 'priority', 'createdByUserId'],
      boost: 1.0,
    },
  },
}
