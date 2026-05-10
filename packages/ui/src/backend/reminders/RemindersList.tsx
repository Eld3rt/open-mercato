'use client'

import * as React from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@open-mercato/ui/primitives/button'
import { Input } from '@open-mercato/ui/primitives/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@open-mercato/ui/primitives/select'
import { Badge } from '@open-mercato/ui/primitives/badge'
import { ReminderCard } from './ReminderCard'
import { ReminderForm } from './ReminderForm'
import { useReminders, type Reminder, type ReminderCreateData, type ReminderUpdateData } from './useReminders'
import type { ReminderPriority, ReminderStatus } from '@open-mercato/core/modules/reminders/data/entities'

interface RemindersListProps {
  entityType?: string
  entityId?: string
  showCreateButton?: boolean
  showFilters?: boolean
  className?: string
}

const statusOptions: { value: ReminderStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const priorityOptions: { value: ReminderPriority | ''; label: string }[] = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export function RemindersList({
  entityType,
  entityId,
  showCreateButton = true,
  showFilters = true,
  className = ''
}: RemindersListProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<ReminderStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = React.useState<ReminderPriority | ''>('')
  const [showForm, setShowForm] = React.useState(false)
  const [editingReminder, setEditingReminder] = React.useState<Reminder | null>(null)

  const filters = React.useMemo(() => ({
    search: searchQuery || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    entityType: entityType || undefined,
    entityId: entityId || undefined,
  }), [searchQuery, statusFilter, priorityFilter, entityType, entityId])

  const {
    reminders,
    loading,
    error,
    createReminder,
    updateReminder,
    deleteReminder,
    setFilters,
    setPage,
    setPageSize,
    page,
    pageSize,
    total,
    totalPages,
  } = useReminders(filters)

  React.useEffect(() => {
    setFilters(filters)
  }, [filters, setFilters])

  const handleCreateReminder = React.useCallback(async (data: ReminderCreateData) => {
    await createReminder(data)
    setShowForm(false)
  }, [createReminder])

  const handleUpdateReminder = React.useCallback(async (data: ReminderUpdateData) => {
    if (editingReminder) {
      await updateReminder(editingReminder.id, data)
      setEditingReminder(null)
    }
  }, [editingReminder, updateReminder])

  const handleStatusChange = React.useCallback(async (id: string, completed: boolean) => {
    await updateReminder(id, { status: completed ? 'completed' : 'pending' })
  }, [updateReminder])

  const handleDeleteReminder = React.useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      await deleteReminder(id)
    }
  }, [deleteReminder])

  const handleEditReminder = React.useCallback((reminder: Reminder) => {
    setEditingReminder(reminder)
  }, [])

  const clearFilters = React.useCallback(() => {
    setSearchQuery('')
    setStatusFilter('')
    setPriorityFilter('')
  }, [])

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading reminders: {error}</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reminders</h2>
        {showCreateButton && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Reminder
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reminders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={(value: ReminderStatus | '') => setStatusFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(value: ReminderPriority | '') => setPriorityFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map(option => (
                <SelectItem key={option.value} value={option.label}
              ))}
            </SelectContent>
          </Select>

          {(searchQuery || statusFilter || priorityFilter) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {loading ? 'Loading...' : `${total} reminder${total !== 1 ? 's' : ''}`}
        </span>
        {total > 0 && (
          <span>
            Page {page} of {totalPages}
          </span>
        )}
      </div>

      {/* Reminders list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p>Loading reminders...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No reminders found</p>
            {showCreateButton && (
              <Button onClick={() => setShowForm(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create your first reminder
              </Button>
            )}
          </div>
        ) : (
          reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onStatusChange={handleStatusChange}
              onEdit={handleEditReminder}
              onDelete={handleDeleteReminder}
              showAssignments={!entityType || !entityId}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Form */}
      <ReminderForm
        isOpen={showForm || !!editingReminder}
        onClose={() => {
          setShowForm(false)
          setEditingReminder(null)
        }}
        onSubmit={editingReminder ? handleUpdateReminder : handleCreateReminder}
        reminder={editingReminder}
      />
    </div>
  )
}