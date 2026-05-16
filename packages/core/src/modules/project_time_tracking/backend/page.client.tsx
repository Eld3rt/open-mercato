'use client'

import { useQuery } from '@tanstack/react-query'
import { DataTable } from '@open-mercato/ui/backend/data-table'
import { useT } from '@open-mercato/shared/lib/i18n/context'

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
        const hours = Math.floor(entry.durationMinutes / 60)
        const minutes = entry.durationMinutes % 60
        return `${hours}h ${minutes}m`
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
      <DataTable data={entries || []} columns={columns} searchable filterable />
    </div>
  )
}
