'use client'

import { useQuery } from '@tanstack/react-query'
import { useT } from '@open-mercato/shared/lib/i18n/context'
import { Card, CardContent } from '@open-mercato/ui/primitives/card'
import { type TimeEntry, formatDuration } from '../../../data/types'

async function fetchRecentTimeEntries(): Promise<TimeEntry[]> {
  const response = await fetch('/api/project-time-entries?pageSize=5&sortBy=startedAt')
  if (!response.ok) {
    throw new Error('Failed to load time entries')
  }
  const data = await response.json()
  return data.items ?? []
}

export default function TimeTrackingDashboardWidget() {
  const t = useT('projectTimeTracking')
  const { data, isLoading, error } = useQuery({
    queryKey: ['projectTimeTracking', 'recent'],
    queryFn: fetchRecentTimeEntries,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return <div className="text-center py-4">{t('dashboard.loading')}</div>
  }

  if (error) {
    return (
      <div className="text-center py-4 text-destructive">
        {t('dashboard.error')}: {(error as Error).message}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">{t('dashboard.empty')}</div>
  }

  return (
    <div className="space-y-3">
      {data.map(entry => (
        <Card key={entry.id} className="border border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" title={entry.description ?? ''}>
                  {entry.description || t('entry.noDescription')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('entry.by')}: {entry.userId}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.taskId ? t('entry.onTask') : t('entry.onProject')}: {entry.taskId || entry.projectId}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {entry.status === 'running' ? t('status.running') : t('status.stopped')}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{entry.durationMinutes !== null ? formatDuration(entry.durationMinutes) : '—'}</span>
              <span>{entry.billable ? t('entry.billable') : t('entry.nonBillable')}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
