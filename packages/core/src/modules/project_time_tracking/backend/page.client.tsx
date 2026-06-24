'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from '@open-mercato/ui/backend/data-table'
import { useT } from '@open-mercato/shared/lib/i18n/context'
import { type TimeEntry, type TimeEntrySummary, formatDuration } from '../data/types'

export function getTimeEntrySummary(entries: TimeEntry[]): TimeEntrySummary {
  const totalEntries = entries.length
  const activeTimers = entries.filter(entry => entry.status === 'running').length
  const totalTrackedMinutes = entries.reduce((sum, entry) => sum + (entry.durationMinutes ?? 0), 0)

  return {
    totalEntries,
    activeTimers,
    totalTrackedMinutes,
  }
}

async function fetchTimeEntries(): Promise<TimeEntry[]> {
  const response = await fetch('/api/project-time-entries?pageSize=100')
  if (!response.ok) {
    throw new Error('Unable to load time entries')
  }
  const data = await response.json()
  return data.items ?? []
}

export default function ProjectTimeTrackingBackendPage() {
  const t = useT('projectTimeTracking')
  const { data: entries, isLoading } = useQuery({
    queryKey: ['projectTimeTracking', 'all'],
    queryFn: fetchTimeEntries,
  })

  const summary = useMemo(() => getTimeEntrySummary(entries ?? []), [entries])

  const summaryCards = [
    {
      label: t('cards.totalEntries'),
      value: summary.totalEntries,
    },
    {
      label: t('cards.activeTimers'),
      value: summary.activeTimers,
    },
    {
      label: t('cards.trackedTime'),
      value: summary.totalTrackedMinutes > 0 ? formatDuration(summary.totalTrackedMinutes) : '0m',
    },
  ]

  const columns = [
    {
      key: 'description',
      header: t('entry.description'),
      render: (entry: TimeEntry) => (
        <div className="max-w-xl truncate" title={entry.description ?? ''}>
          {entry.description || t('entry.noDescription')}
        </div>
      ),
    },
    {
      key: 'userId',
      header: 'User',
      render: (entry: TimeEntry) => entry.userId,
    },
    {
      key: 'projectId',
      header: 'Project',
      render: (entry: TimeEntry) => entry.projectId,
    },
    {
      key: 'taskId',
      header: 'Task',
      render: (entry: TimeEntry) => entry.taskId || '—',
    },
    {
      key: 'status',
      header: t('entry.status'),
      render: (entry: TimeEntry) => (entry.status === 'running' ? t('status.running') : t('status.stopped')),
    },
    {
      key: 'duration',
      header: t('entry.duration'),
      render: (entry: TimeEntry) => {
        if (entry.durationMinutes === null) return '—'
        return formatDuration(entry.durationMinutes)
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (entry: TimeEntry) => new Date(entry.createdAt).toLocaleString(),
    },
  ]

  if (isLoading) {
    return <div className="text-center py-4">{t('dashboard.loading')}</div>
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">{t('page.title')}</h1>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
        {summaryCards.map(card => (
          <div key={card.label} className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-semibold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <DataTable data={entries || []} columns={columns} searchable filterable />
    </div>
  )
}
