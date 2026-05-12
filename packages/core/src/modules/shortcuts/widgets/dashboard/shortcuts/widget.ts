import { lazyDashboardWidget, type DashboardWidgetModule } from '@open-mercato/shared/modules/dashboard/widgets'

const ShortcutsWidget = lazyDashboardWidget(() => import('./widget.client'))

const widget: DashboardWidgetModule = {
  metadata: {
    id: 'shortcuts.dashboard.pinnedShortcuts',
    title: 'Pinned Shortcuts',
    description: 'Quick access to your most important bookmarks and navigation shortcuts.',
    features: ['shortcuts.view'],
    defaultSize: 'md',
    defaultEnabled: true,
    tags: ['shortcuts', 'productivity', 'navigation'],
    category: 'productivity',
    icon: 'bookmark',
    supportsRefresh: true,
  },
  Widget: ShortcutsWidget,
}

export default widget
