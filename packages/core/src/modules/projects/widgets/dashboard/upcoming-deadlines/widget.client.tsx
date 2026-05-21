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
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const params = new URLSearchParams({
    page: '1',
    pageSize: '5',
    sort: 'due_date',
  })

  const response = await fetch(`/api/projects/projects?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to load projects')
  }

  const data = await response.json()
  const items: UpcomingProject[] = (data.items || [])
    .filter((p: any) => {
      if (!p.dueDate || p.status === 'completed' || p.status === 'cancelled') return false
      const dueDate = new Date(p.dueDate)
      return dueDate >= now && dueDate <= sevenDaysFromNow
    })
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      dueDate: p.dueDate,
      priority: p.priority,
      status: p.status,
      daysUntilDue: Math.ceil((new Date(p.dueDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
    }))
    .sort((a: UpcomingProject, b: UpcomingProject) => a.daysUntilDue - b.daysUntilDue)
    .slice(0, 5)

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
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
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
      <CardContent>
        {projects.length === 0 ? (
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
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{t('dashboard.upcomingDeadlines.empty')}</div>
        ) : (
          <div className="space-y-3">
            {projects.map(project => (
              <div key={project.id} className="flex items-start justify-between gap-3 p-2 rounded border border-border hover:bg-muted/50 transition">
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
