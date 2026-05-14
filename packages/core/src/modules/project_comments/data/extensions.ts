import type { EntityExtensions } from '@open-mercato/shared/lib/data/extensions'

export const extensions: EntityExtensions = {
  projects: {
    project_comments: {
      type: 'one-to-many',
      target: 'project_comments',
      mappedBy: 'project',
      orphanRemoval: false,
    },
  },
  project_tasks: {
    project_comments: {
      type: 'one-to-many',
      target: 'project_comments',
      mappedBy: 'task',
      orphanRemoval: false,
    },
  },
}