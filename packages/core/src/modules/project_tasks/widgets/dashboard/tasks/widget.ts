import { lazyDashboardWidget, type DashboardWidgetModule } from '@open-mercato/shared/modules/dashboard/widgets'

const ProjectTasksWidget = lazyDashboardWidget(() => import('./widget.client'))

const widget: DashboardWidgetModule = {
  metadata: {
    id: 'project_tasks.dashboard.upcomingTasks',
    title: 'Upcoming Project Tasks',
    description: 'See your next open tasks across projects and stay on top of due dates.',
    features: ['project_tasks.view'],
    defaultSize: 'md',
    defaultEnabled: true,
    tags: ['projects', 'tasks', 'productivity'],
    category: 'projects',
    icon: 'check-square',
    supportsRefresh: true,
  },
  Widget: ProjectTasksWidget,
}

export default widget
