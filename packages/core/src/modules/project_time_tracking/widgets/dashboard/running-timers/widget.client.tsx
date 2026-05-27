'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useT } from '@open-mercato/shared/lib/i18n/context'
import { Badge } from '@open-mercato/ui/primitives/badge'
import { Card, CardContent } from '@open-mercato/ui/primitives/card'

interface TimeEntry {
  id: string
  projectId: string
  taskId: string | null
  userId: string
  description: string | null
  startedAt: string
  endedAt: string | null
  durationMinutes: number | null
  status: string
  billable: boolean
}

function formatElapsed(startedAt: string, now: number): string {
  const elapsedMinutes = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 60000))
  const hours = Math.floor(elapsedMinutes / 60)
  const minutes = elapsedMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

async function fetchRunningTimers(): Promise<TimeEntry[]> {
  const response = await fetch('/api/project-time-entries?pageSize=5&sortBy=startedAt&status=running')
  if (!response.ok) {
    throw new Error('Failed to load running timers')
  }

  const data = await response.json()
  return data.items ?? []
}

export default function RunningTimersWidget() {
  const t = useT('projectTimeTracking')
  const [tick, setTick] = useState(Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick(Date.now())
    }, 60000)

    return () => window.clearInterval(interval)
  }, [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['projectTimeTracking', 'runningTimers'],
    queryFn: fetchRunningTimers,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return <div className="text-center py-4">{t('dashboard.runningTimers.loading')}</div>
  }

  if (error) {
    return (
      <div className="text-center py-4 text-destructive">
        {t('dashboard.runningTimers.error')}: {(error as Error).message}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">{t('dashboard.runningTimers.empty')}</div>
  }

  return (
    <div className="space-y-3">
      {data.map(entry => (
        <Card key={entry.id} className="border border-border">
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" title={entry.description ?? ''}>
                  {entry.description || t('entry.noDescription')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.taskId ? `${t('entry.onTask')}: ${entry.taskId}` : `${t('entry.onProject')}: ${entry.projectId}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('entry.by')}: {entry.userId}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0 text-right">
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {t('status.running')}
                </Badge>
                <p className="text-xs text-muted-foreground">{formatElapsed(entry.startedAt, tick)}</p>
                <p className="text-[10px] text-muted-foreground">{entry.billable ? t('entry.billable') : t('entry.nonBillable')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
