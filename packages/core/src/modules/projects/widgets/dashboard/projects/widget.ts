import { lazyDashboardWidget, type DashboardWidgetModule } from '@open-mercato/shared/modules/dashboard/widgets'

const ProjectDashboardWidget = lazyDashboardWidget(() => import('./widget.client'))

const widget: DashboardWidgetModule = {
  metadata: {
    id: 'projects.dashboard.recentProjects',
    title: 'Recent Projects',
    description: 'View your recent projects and their status',
    features: ['projects.view'],
    defaultSize: 'md',
    defaultEnabled: true,
    tags: ['projects', 'progress', 'management'],
    category: 'projects',
    icon: 'folder-open',
    supportsRefresh: true,
  },
  Widget: ProjectDashboardWidget,
}

export default widget