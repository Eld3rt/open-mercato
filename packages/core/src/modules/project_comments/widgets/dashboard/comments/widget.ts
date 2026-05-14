import { lazyDashboardWidget, type DashboardWidgetModule } from '@open-mercato/shared/modules/dashboard/widgets'

const ProjectCommentsWidget = lazyDashboardWidget(() => import('./widget.client'))

const widget: DashboardWidgetModule = {
  metadata: {
    id: 'project_comments.dashboard.recentComments',
    title: 'Recent Project Comments',
    description: 'Stay updated with the latest discussions on your projects and tasks.',
    features: ['project_comments.view'],
    defaultSize: 'md',
    defaultEnabled: true,
    tags: ['projects', 'comments', 'communication'],
    category: 'projects',
    icon: 'message-square',
    supportsRefresh: true,
  },
  Widget: ProjectCommentsWidget,
}

export default widget