import { lazyDashboardWidget, type DashboardWidgetModule } from '@open-mercato/shared/modules/dashboard/widgets'

const ProjectTimeTrackingWidget = lazyDashboardWidget(() => import('./widget.client'))

const widget: DashboardWidgetModule = {
  metadata: {
    id: 'project_time_tracking.dashboard.recentTimeEntries',
    title: 'Recent Time Entries',
    description: 'Review the latest logged time across active projects and tasks.',
    features: ['project_time_tracking.view'],
    defaultSize: 'md',
    defaultEnabled: true,
    tags: ['projects', 'time', 'tracking'],
    category: 'projects',
    icon: 'clock',
    supportsRefresh: true,
  },
  Widget: ProjectTimeTrackingWidget,
}

export default widget
