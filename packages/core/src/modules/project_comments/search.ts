import type { SearchModuleConfig } from '@open-mercato/shared/lib/search'

export const searchConfig: SearchModuleConfig = {
  entities: {
    project_comments: {
      fields: ['content'],
      displayFields: ['content'],
      filterFields: ['projectId', 'taskId', 'authorUserId'],
      boost: 1.0,
    },
  },
}