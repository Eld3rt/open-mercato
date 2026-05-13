'use client'

import { useQuery } from '@tanstack/react-query'
import { Badge } from '@open-mercato/ui/primitives/badge'
import { Card, CardContent } from '@open-mercato/ui/primitives/card'
import { useT } from '@open-mercato/shared/lib/i18n/context'

interface TaskCardProps {
  task: {
    id: string
    projectId: string
    title: string
    status: string
    priority: string
    dueDate: string | null
  }
}

function TaskCard({ task }: TaskCardProps) {
  const t = useT('projectTasks')

  const statusStyle = {
    todo: 'bg-slate-100 text-slate-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    blocked: 'bg-amber-100 text-amber-700',
    done: 'bg-emerald-100 text-emerald-700',
  }[task.status] ?? 'bg-gray-100 text-gray-700'

  return (
    <Card className="mb-2 border border-border">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{task.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('task.projectId')}: {task.projectId}</p>
          </div>
          <Badge className={`text-xs font-medium ${statusStyle}`}>{t(`status.${task.status}`)}</Badge>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t(`priority.${task.priority}`)}</span>
          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : t('task.noDueDate')}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingMessage() {
  const t = useT('projectTasks')
  return <div className="text-center py-4">{t('dashboard.loading')}</div>
}

function ErrorMessage({ error }: { error: Error }) {
  const t = useT('projectTasks')
  return <div className="text-center py-4 text-destructive">{t('dashboard.error')}: {error.message}</div>
}

function EmptyMessage() {
  const t = useT('projectTasks')
  return <div className="text-center py-4 text-muted-foreground">{t('dashboard.empty')}</div>
}

async function fetchUpcomingTasks(): Promise<TaskCardProps['task'][]> {
  const response = await fetch('/api/project-tasks?status=todo&sortBy=dueDate&pageSize=5')
  if (!response.ok) {
    throw new Error('Failed to load tasks')
  }
  const data = await response.json()
  return data.items ?? []
}

export default function TasksDashboardWidget() {
  const t = useT('projectTasks')
  const { data, isLoading, error } = useQuery({
    queryKey: ['projectTasks', 'upcoming'],
    queryFn: fetchUpcomingTasks,
    refetchInterval: 30000,
  })

  if (isLoading) return <LoadingMessage />
  if (error) return <ErrorMessage error={error as Error} />
  if (!data || data.length === 0) return <EmptyMessage />

  return (
    <div className="space-y-2">
      {data.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
