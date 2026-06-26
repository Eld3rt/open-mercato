'use client'

import { useQuery } from '@tanstack/react-query'
import { useT } from '@open-mercato/shared/lib/i18n/context'
import { Card, CardContent, CardHeader, CardTitle } from '@open-mercato/ui/primitives/card'
import { Badge } from '@open-mercato/ui/primitives/badge'

interface UpcomingProject {
  id: string
  name: string
  dueDate: string
  priority: string
  status: string
  daysUntilDue: number
}

interface DeadlinesResponse {
  items: UpcomingProject[]
  total: number
}

async function fetchUpcomingDeadlines(): Promise<DeadlinesResponse> {
  const response = await fetch('/api/projects/upcoming-deadlines')
  if (!response.ok) {
    throw new Error('Failed to load upcoming deadlines')
  }

  const data = await response.json()
  const now = new Date()
  const items: UpcomingProject[] = (data.items || [])
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      dueDate: p.dueDate,
      priority: p.priority ?? 'medium',
      status: p.status ?? 'active',
      daysUntilDue: Math.max(
        0,
        Math.ceil((new Date(p.dueDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
      ),
    }))

  return { items, total: items.length }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'destructive'
    case 'high':
      return 'secondary'
    case 'medium':
      return 'default'
    case 'low':
      return 'outline'
    default:
      return 'default'
  }
}

function formatDaysUntil(days: number): string {
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `${days} days`
}

export default function UpcomingDeadlinesWidget() {
  const t = useT('projects')
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', 'upcomingDeadlines'],
    queryFn: fetchUpcomingDeadlines,
    refetchInterval: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('dashboard.upcomingDeadlines.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">{t('dashboard.upcomingDeadlines.loading')}</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('dashboard.upcomingDeadlines.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">{t('dashboard.upcomingDeadlines.error')}</div>
        </CardContent>
      </Card>
    )
  }

  const projects = data?.items || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('dashboard.upcomingDeadlines.title')}</CardTitle>
      </CardHeader>
      <CardContent>        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{t('dashboard.upcomingDeadlines.empty')}</div>
        ) : (
          <div className="space-y-3">
            {projects.map(project => (
              <div
                key={project.id}
                className="flex items-start justify-between gap-3 p-2 rounded border border-border hover:bg-muted/50 transition cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{project.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDaysUntil(project.daysUntilDue)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={getPriorityColor(project.priority)} className="text-xs">
                    {project.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
