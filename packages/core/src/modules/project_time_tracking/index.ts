import type { ModuleMetadata } from '@open-mercato/shared/lib/modules'

export const metadata: ModuleMetadata = {
  id: 'project_time_tracking',
  name: 'Project Time Tracking',
  description: 'Track time spent on projects and tasks with timers and reports.',
  version: '1.0.0',
  dependencies: ['projects', 'project_tasks'],
}
