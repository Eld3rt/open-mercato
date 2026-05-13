import { lazyDashboardWidget } from '@/core/widgets/dashboard'

export const widget = lazyDashboardWidget({
  name: 'projects',
  displayName: 'Recent Projects',
  description: 'View your recent projects and their status',
  defaultSize: { width: 4, height: 3 },
  minSize: { width: 2, height: 2 },
  maxSize: { width: 6, height: 4 },
  category: 'projects',
  icon: 'FolderOpen',
})