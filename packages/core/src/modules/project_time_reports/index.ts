import type { ModuleMetadata } from '@open-mercato/shared/lib/modules'

export const metadata: ModuleMetadata = {
  id: 'project_time_reports',
  name: 'Project Time Reports',
  description: 'Generate and view detailed time tracking reports with analytics and summaries.',
  version: '1.0.0',
  dependencies: ['project_time_tracking', 'projects', 'project_tasks'],
}
