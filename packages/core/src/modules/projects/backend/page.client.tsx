'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from '@open-mercato/ui/backend/data-table'
import { useT } from '@open-mercato/shared/lib/i18n/context'
import { type ProjectListItem, type ProjectSummary, getProjectSummary, formatProgress } from '../data/types'

async function fetchProjects(): Promise<ProjectListItem[]> {
  const response = await fetch('/api/projects?pageSize=100')
  if (!response.ok) {
    throw new Error('Unable to load projects')
  }
  const data = await response.json()
  return data.items ?? []
}

function StatusBadge({ status }: { status: string }) {
  const t = useT('projects')
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-600',
  }
  const label: Record<string, string> = {
    active: t('status.active'),
    completed: t('status.completed'),
    'on-hold': t('status.on-hold'),
    cancelled: t('status.cancelled'),
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {label[status] ?? status}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const t = useT('projects')
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }
  const label: Record<string, string> = {
    low: t('priority.low'),
    medium: t('priority.medium'),
    high: t('priority.high'),
    urgent: t('priority.urgent'),
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[priority] ?? 'bg-gray-100 text-gray-600'}`}>
      {label[priority] ?? priority}
    </span>
  )
}

export default function ProjectsBackendPage() {
  const t = useT('projects')
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: fetchProjects,
  })

  const summary = useMemo(() => getProjectSummary(projects ?? []), [projects])

  const summaryCards = [
    {
      label: t('cards.total'),
      value: summary.totalProjects,
    },
    {
      label: t('cards.active'),
      value: summary.activeProjects,
    },
    {
      label: t('cards.completed'),
      value: summary.completedProjects,
    },
  ]

  const columns = [
    {
      key: 'name',
      header: t('list.columns.name'),
      render: (entry: ProjectListItem) => (
        <div className="max-w-xl truncate font-medium" title={entry.name}>
          {entry.name || t('list.noValue')}
        </div>
      ),
    },
    {
      key: 'status',
      header: t('list.columns.status'),
      render: (entry: ProjectListItem) => <StatusBadge status={entry.status} />,
    },
    {
      key: 'priority',
      header: t('list.columns.priority'),
      render: (entry: ProjectListItem) => <PriorityBadge priority={entry.priority} />,
    },
    {
      key: 'dueDate',
      header: t('list.columns.dueDate'),
      render: (entry: ProjectListItem) => {
        if (!entry.dueDate) return t('list.noValue')
        return new Date(entry.dueDate).toLocaleDateString()
      },
    },
    {
      key: 'progress',
      header: t('list.columns.progress'),
      render: (entry: ProjectListItem) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${Math.min(entry.progressPercentage, 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{formatProgress(entry.progressPercentage)}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: t('list.columns.createdAt'),
      render: (entry: ProjectListItem) => new Date(entry.createdAt).toLocaleDateString(),
    },
  ]

  if (isLoading) {
    return <div className="text-center py-4">{t('list.loading')}</div>
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">{t('page.title')}</h1>

      {projects && projects.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
          {summaryCards.map(card => (
            <div key={card.label} className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-semibold mt-2">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <DataTable data={projects || []} columns={columns} searchable filterable />
    </div>
  )
}
