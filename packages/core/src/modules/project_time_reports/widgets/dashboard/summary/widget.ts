import { lazyDashboardWidget, type DashboardWidgetModule } from '@open-mercato/shared/modules/dashboard/widgets'

const TimeReportsWidget = lazyDashboardWidget(() => import('./widget.client'))

const widget: DashboardWidgetModule = {
  metadata: {
    id: 'project_time_reports.dashboard.summary',
    title: 'Time Tracking Summary',
    description: 'Quick overview of time tracked this month.',
    features: ['project_time_reports.view'],
    defaultSize: 'sm',
    defaultEnabled: true,
    tags: ['time', 'reports', 'analytics'],
    category: 'analytics',
    icon: 'bar-chart',
    supportsRefresh: true,
  },
  Widget: TimeReportsWidget,
}

export default widget
