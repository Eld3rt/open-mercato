import { lazyDashboardWidget, type DashboardWidgetModule } from '@open-mercato/shared/modules/dashboard/widgets'

const UpcomingDeadlinesWidget = lazyDashboardWidget(() => import('./widget.client'))

const widget: DashboardWidgetModule = {
  metadata: {
    id: 'projects.dashboard.upcoming-deadlines',
    title: 'Upcoming Project Deadlines',
    description: 'Projects with deadlines in the next 7 days',
    features: ['dashboards.view', 'projects.view'],
    defaultSize: 'md',
    defaultEnabled: true,
    tags: ['projects', 'deadlines', 'alerts'],
    category: 'projects',
    icon: 'calendar',
    supportsRefresh: true,
  },
  Widget: UpcomingDeadlinesWidget,
}

export default widget
