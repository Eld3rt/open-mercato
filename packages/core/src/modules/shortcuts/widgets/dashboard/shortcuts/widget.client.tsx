"use client"

import * as React from 'react'
import type { DashboardWidgetComponentProps } from '@open-mercato/shared/modules/dashboard/widgets'
import { apiCall } from '@open-mercato/ui/backend/utils/apiCall'
import { useT } from '@open-mercato/shared/lib/i18n/context'
import { LoadingMessage } from '@open-mercato/ui/backend/detail/LoadingMessage'
import { ErrorMessage } from '@open-mercato/ui/backend/detail/ErrorMessage'
import { ArrowUpRight } from 'lucide-react'

type ShortcutListItem = {
  id: string
  name: string
  description?: string | null
  url: string
  icon?: string | null
  accessCount: number
  lastAccessedAt?: string | null
}

async function fetchPinnedShortcuts(): Promise<ShortcutListItem[]> {
  const call = await apiCall<{ items: ShortcutListItem[] }>('/api/shortcuts?onlyPinned=true&sortBy=pinned&pageSize=10')
  if (!call.ok) {
    const errorMessage = (call.result as Record<string, unknown>)?.error
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to load shortcuts')
  }
  return call.result.items
}

const ShortcutsDashboardWidget: React.FC<DashboardWidgetComponentProps> = ({
  mode,
  refreshToken,
  onRefreshStateChange,
}) => {
  const t = useT()
  const [shortcuts, setShortcuts] = React.useState<ShortcutListItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    onRefreshStateChange?.(true)
    setLoading(true)
    setError(null)
    try {
      const items = await fetchPinnedShortcuts()
      setShortcuts(items)
    } catch (err) {
      console.error('Failed to load pinned shortcuts', err)
      setError(t('shortcuts.dashboard.error', 'Unable to load pinned shortcuts'))
    } finally {
      setLoading(false)
      onRefreshStateChange?.(false)
    }
  }, [onRefreshStateChange, t])

  React.useEffect(() => {
    refresh().catch(() => {})
  }, [refresh, refreshToken])

  if (mode === 'settings') {
    return (
      <div className="text-sm text-muted-foreground">
        {t('shortcuts.dashboard.settings', 'This widget has no settings.')}
      </div>
    )
  }

  if (loading) {
    return <LoadingMessage label={t('shortcuts.dashboard.loading', 'Loading shortcuts…')} />
  }

  if (error) {
    return <ErrorMessage label={error} />
  }

  if (shortcuts.length === 0) {
    return (
      <div className="rounded border border-dashed border-muted/50 bg-muted/10 p-4 text-sm text-muted-foreground">
        {t('shortcuts.dashboard.empty', 'Pin shortcuts to add them to this dashboard widget.')}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {shortcuts.map((shortcut) => (
        <a
          key={shortcut.id}
          href={shortcut.url}
          target="_blank"
          rel="noreferrer"
          className="group block rounded-lg border border-muted/50 bg-background p-3 transition hover:border-primary/70 hover:bg-primary/5"
        >
          <div className="flex items-start gap-3">
            <div className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-muted/20 text-sm font-semibold text-foreground">
              {shortcut.icon ? shortcut.icon : '🔗'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="truncate">{shortcut.name}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
              </div>
              {shortcut.description ? (
                <p className="truncate text-xs text-muted-foreground">{shortcut.description}</p>
              ) : null}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{t('shortcuts.dashboard.openInNewTab', 'Opens in a new tab')}</span>
            <span>{t('shortcuts.dashboard.accessCount', '{count} visits', { count: shortcut.accessCount })}</span>
          </div>
        </a>
      ))}
    </div>
  )
}

export default ShortcutsDashboardWidget
