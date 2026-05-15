import type { WidgetInjectionTable } from '@open-mercato/shared/lib/widgets/injection'

export const injectionTable: WidgetInjectionTable = {
  'dashboard:widgets': [
    {
      widgetId: 'project_comments.dashboard.recentComments',
      position: 'after',
      relativeTo: 'project_tasks.dashboard.upcomingTasks',
    },
  ],
}