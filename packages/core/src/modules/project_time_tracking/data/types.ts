export interface TimeEntry {
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
  createdAt: string
}

export interface TimeEntrySummary {
  totalEntries: number
  activeTimers: number
  totalTrackedMinutes: number
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`
  }

  return `${remainingMinutes}m`
}
