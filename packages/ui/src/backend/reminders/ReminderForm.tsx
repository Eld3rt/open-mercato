'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, User, X } from 'lucide-react'
import { Button } from '@open-mercato/ui/primitives/button'
import { Input } from '@open-mercato/ui/primitives/input'
import { Label } from '@open-mercato/ui/primitives/label'
import { Textarea } from '@open-mercato/ui/primitives/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@open-mercato/ui/primitives/select'
import { Badge } from '@open-mercato/ui/primitives/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@open-mercato/ui/primitives/dialog'
import type { Reminder, ReminderCreateData, ReminderUpdateData } from './useReminders'
import type { ReminderPriority } from '@open-mercato/core/modules/reminders/data/entities'

interface ReminderFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReminderCreateData | ReminderUpdateData) => Promise<void>
  reminder?: Reminder | null
  title?: string
}

const priorityOptions: { value: ReminderPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export function ReminderForm({
  isOpen,
  onClose,
  onSubmit,
  reminder,
  title = reminder ? 'Edit Reminder' : 'Create Reminder'
}: ReminderFormProps) {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    dueAt: '',
    priority: 'medium' as ReminderPriority,
    assignedToUserId: '',
  })
  const [loading, setLoading] = React.useState(false)
  const [entityAssignments, setEntityAssignments] = React.useState<Array<{
    entityType: string
    entityId: string
  }>>([])

  // Initialize form data when reminder changes
  React.useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title,
        description: reminder.description || '',
        dueAt: reminder.dueAt ? format(new Date(reminder.dueAt), "yyyy-MM-dd'T'HH:mm") : '',
        priority: reminder.priority,
        assignedToUserId: reminder.assignedToUserId || '',
      })
      setEntityAssignments(reminder.assignments?.map(a => ({
        entityType: a.entityType,
        entityId: a.entityId,
      })) || [])
    } else {
      setFormData({
        title: '',
        description: '',
        dueAt: '',
        priority: 'medium',
        assignedToUserId: '',
      })
      setEntityAssignments([])
    }
  }, [reminder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        dueAt: formData.dueAt || undefined,
        assignedToUserId: formData.assignedToUserId || undefined,
        ...(reminder ? {} : { entityAssignments: entityAssignments.length > 0 ? entityAssignments : undefined }),
      }

      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error('Failed to submit reminder:', error)
    } finally {
      setLoading(false)
    }
  }

  const addEntityAssignment = () => {
    setEntityAssignments(prev => [...prev, { entityType: '', entityId: '' }])
  }

  const updateEntityAssignment = (index: number, field: 'entityType' | 'entityId', value: string) => {
    setEntityAssignments(prev => prev.map((assignment, i) =>
      i === index ? { ...assignment, [field]: value } : assignment
    ))
  }

  const removeEntityAssignment = (index: number) => {
    setEntityAssignments(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter reminder title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter reminder description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueAt">Due Date & Time</Label>
              <Input
                id="dueAt"
                type="datetime-local"
                value={formData.dueAt}
                onChange={(e) => setFormData(prev => ({ ...prev, dueAt: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: ReminderPriority) =>
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assignedTo">Assign To</Label>
            <Input
              id="assignedTo"
              value={formData.assignedToUserId}
              onChange={(e) => setFormData(prev => ({ ...prev, assignedToUserId: e.target.value }))}
              placeholder="User ID (optional)"
            />
          </div>

          {!reminder && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Link to Entities</Label>
                <Button type="button" variant="outline" size="sm" onClick={addEntityAssignment}>
                  Add Link
                </Button>
              </div>

              {entityAssignments.map((assignment, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Input
                    placeholder="Entity Type (e.g., customer)"
                    value={assignment.entityType}
                    onChange={(e) => updateEntityAssignment(index, 'entityType', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Entity ID"
                    value={assignment.entityId}
                    onChange={(e) => updateEntityAssignment(index, 'entityId', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEntityAssignment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : reminder ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}