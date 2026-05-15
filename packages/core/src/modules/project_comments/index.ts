import type { ModuleMetadata } from '@open-mercato/shared/lib/modules'

export const metadata: ModuleMetadata = {
  id: 'project_comments',
  name: 'Project Comments',
  description: 'Comment system for projects and tasks',
  version: '1.0.0',
  dependencies: ['projects', 'project_tasks'],
}