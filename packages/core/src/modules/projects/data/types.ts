export interface ProjectListItem {
  id: string
  name: string
  description: string | null
  status: string
  priority: string
  startDate: string | null
  dueDate: string | null
  progressPercentage: number
  createdByUserId: string
  createdAt: string
  updatedAt: string
}

export interface ProjectSummary {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
}

export function getProjectSummary(items: ProjectListItem[]): ProjectSummary {
  const totalProjects = items.length
  const activeProjects = items.filter(p => p.status === 'active').length
  const completedProjects = items.filter(p => p.status === 'completed').length
  const onHoldProjects = items.filter(p => p.status === 'on-hold').length

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    onHoldProjects,
  }
}

export function formatProgress(percentage: number): string {
  return `${Math.round(percentage)}%`
}
