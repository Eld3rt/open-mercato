import { lazyDashboardWidget, type DashboardWidgetModule } from '@open-mercato/shared/modules/dashboard/widgets'

const RunningTimersWidget = lazyDashboardWidget(() => import('./widget.client'))

const widget: DashboardWidgetModule = {
  metadata: {
    id: 'project_time_tracking.dashboard.runningTimers',
    title: 'Running Timers',
    description: 'Track active time entries and their current elapsed time across ongoing work.',
    features: ['project_time_tracking.view'],
    defaultSize: 'md',
    defaultEnabled: true,
    tags: ['projects', 'time', 'tracking', 'active'],
    category: 'projects',
    icon: 'activity',
    supportsRefresh: true,
  },
  Widget: RunningTimersWidget,
}

export default widget
