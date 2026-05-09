'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@open-mercato/ui/primitives/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@open-mercato/ui/primitives/card'
import { Checkbox } from '@open-mercato/ui/primitives/checkbox'
import type { Reminder } from './useReminders'

interface ReminderCardProps {
  reminder: Reminder
  onStatusChange?: (id: string, completed: boolean) => void
  onEdit?: (reminder: Reminder) => void
  onDelete?: (id: string) => void
  showAssignments?: boolean
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

const statusIcons = {
  pending: <AlertCircle className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
}

const statusColors = {
  pending: 'text-yellow-600',
  completed: 'text-green-600',
  cancelled: 'text-gray-600',
}

export function ReminderCard({
  reminder,
  onStatusChange,
  onEdit,
  onDelete,
  showAssignments = false
}: ReminderCardProps) {
  const handleStatusChange = React.useCallback((checked: boolean) => {
    onStatusChange?.(reminder.id, checked)
  }, [reminder.id, onStatusChange])

  const isOverdue = reminder.dueAt && new Date(reminder.dueAt) < new Date() && reminder.status === 'pending'

  return (
    <Card className={`transition-all hover:shadow-md ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {onStatusChange && (
              <Checkbox
                checked={reminder.status === 'completed'}
                onCheckedChange={handleStatusChange}
                className="mt-1"
              />
            )}
            <div className="flex-1">
              <CardTitle className={`text-lg ${reminder.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                {reminder.title}
              </CardTitle>
              {reminder.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {reminder.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className={priorityColors[reminder.priority]}>
              {reminder.priority}
            </Badge>
            <div className={statusColors[reminder.status]}>
              {statusIcons[reminder.status]}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            {reminder.dueAt && (
              <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(reminder.dueAt), 'MMM d, yyyy')}
                </span>
                <Clock className="h-4 w-4 ml-1" />
                <span>
                  {format(new Date(reminder.dueAt), 'HH:mm')}
                </span>
              </div>
            )}

            {reminder.assignedToUserId && (
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Assigned</span>
              </div>
            )}
          </div>

          <div className="text-xs">
            Created {format(new Date(reminder.createdAt), 'MMM d')}
          </div>
        </div>

        {showAssignments && reminder.assignments && reminder.assignments.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-sm font-medium mb-2">Linked to:</div>
            <div className="flex flex-wrap gap-1">
              {reminder.assignments.map((assignment) => (
                <Badge key={assignment.id} variant="outline" className="text-xs">
                  {assignment.entityType}: {assignment.entityId.slice(0, 8)}...
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(onEdit || onDelete) && (
          <div className="mt-3 pt-3 border-t flex justify-end space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(reminder)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(reminder.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}