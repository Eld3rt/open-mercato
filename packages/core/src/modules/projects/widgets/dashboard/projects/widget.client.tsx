'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card'
import { Badge } from '@/ui/components/badge'
import { Progress } from '@/ui/components/progress'
import { useT } from '@/core/i18n'
import { Project } from '../../../data/entities'

interface ProjectCardProps {
  project: Project
}

function ProjectCard({ project }: ProjectCardProps) {
  const t = useT('projects')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-blue-500'
      case 'on-hold': return 'bg-yellow-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm truncate">{project.name}</h4>
          <Badge variant="secondary" className={`text-xs ${getStatusColor(project.status)}`}>
            {t(`status.${project.status}`)}
          </Badge>
        </div>
        {project.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {project.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className={getPriorityColor(project.priority)}>
            {t(`priority.${project.priority}`)}
          </span>
          <span>{project.progressPercentage}%</span>
        </div>
        <Progress value={project.progressPercentage} className="mt-1 h-1" />
        {project.dueDate && (
          <p className="text-xs text-muted-foreground mt-1">
            Due: {new Date(project.dueDate).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingMessage() {
  const t = useT('projects')
  return <div className="text-center py-4">{t('dashboard.loading')}</div>
}

function ErrorMessage({ error }: { error: Error }) {
  const t = useT('projects')
  return (
    <div className="text-center py-4 text-red-600">
      {t('dashboard.error')}: {error.message}
    </div>
  )
}

function EmptyMessage() {
  const t = useT('projects')
  return <div className="text-center py-4 text-muted-foreground">{t('dashboard.empty')}</div>
}

async function fetchRecentProjects(): Promise<Project[]> {
  const response = await fetch('/api/projects?limit=5&sort=updatedAt:DESC')
  if (!response.ok) {
    throw new Error('Failed to fetch projects')
  }
  const data = await response.json()
  return data.items || []
}

export default function ProjectsDashboardWidget() {
  const t = useT('projects')
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects', 'recent'],
    queryFn: fetchRecentProjects,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  if (isLoading) return <LoadingMessage />
  if (error) return <ErrorMessage error={error as Error} />
  if (!projects || projects.length === 0) return <EmptyMessage />

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}