'use client'

import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'

interface DeadlineIndicatorProps {
  dueDate?: string | null
}

export default function DeadlineIndicatorWidget({ dueDate }: DeadlineIndicatorProps) {
  if (!dueDate) return null

  const now = new Date()
  const date = new Date(dueDate)
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return (
      <div className="flex items-center gap-1" title="Overdue">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      </div>
    )
  }

  if (diffDays <= 1) {
    return (
      <div className="flex items-center gap-1" title="Due soon">
        <AlertCircle className="w-4 h-4 text-red-600" />
      </div>
    )
  }

  if (diffDays <= 3) {
    return (
      <div className="flex items-center gap-1" title="Due in a few days">
        <Clock className="w-4 h-4 text-amber-600" />
      </div>
    )
  }

  return null
}
