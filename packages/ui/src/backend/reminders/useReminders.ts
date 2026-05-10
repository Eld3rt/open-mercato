'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ReminderPriority, ReminderStatus } from '@open-mercato/core/modules/reminders/data/entities'

export interface Reminder {
  id: string
  title: string
  description?: string
  dueAt?: string
  priority: ReminderPriority
  status: ReminderStatus
  assignedToUserId?: string
  createdByUserId?: string
  completedAt?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  assignments?: Array<{
    id: string
    entityType: string
    entityId: string
    createdAt: string
  }>
}

export interface ReminderFilters {
  search?: string
  status?: ReminderStatus
  priority?: ReminderPriority
  assignedToUserId?: string
  entityType?: string
  entityId?: string
  dueBefore?: string
  dueAfter?: string
}

export interface UseRemindersResult {
  reminders: Reminder[]
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
  totalPages: number
  createReminder: (data: ReminderCreateData) => Promise<Reminder | null>
  updateReminder: (id: string, data: ReminderUpdateData) => Promise<boolean>
  deleteReminder: (id: string) => Promise<boolean>
  refresh: () => Promise<void>
  setFilters: (filters: ReminderFilters) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
}

export interface ReminderCreateData {
  title: string
  description?: string
  dueAt?: string
  priority?: ReminderPriority
  assignedToUserId?: string
  entityAssignments?: Array<{
    entityType: string
    entityId: string
  }>
}

export interface ReminderUpdateData {
  title?: string
  description?: string
  dueAt?: string | null
  priority?: ReminderPriority
  status?: ReminderStatus
  assignedToUserId?: string | null
}

export function useReminders(
  initialFilters: ReminderFilters = {},
  initialPageSize: number = 50
): UseRemindersResult {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [filters, setFilters] = useState<ReminderFilters>(initialFilters)

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })

    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('status', filters.status)
    if (filters.priority) params.set('priority', filters.priority)
    if (filters.assignedToUserId) params.set('assignedToUserId', filters.assignedToUserId)
    if (filters.entityType) params.set('entityType', filters.entityType)
    if (filters.entityId) params.set('entityId', filters.entityId)
    if (filters.dueBefore) params.set('dueBefore', filters.dueBefore)
    if (filters.dueAfter) params.set('dueAfter', filters.dueAfter)

    return params.toString()
  }, [page, pageSize, filters])

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const queryString = buildQueryString()
      const response = await fetch(`/api/reminders/reminders?${queryString}&includeAssignments=true`)

      if (!response.ok) {
        throw new Error(`Failed to fetch reminders: ${response.status}`)
      }

      const data = await response.json()
      setReminders(data.items || [])
      setTotal(data.total || 0)
      setPage(data.page || 1)
      setPageSize(data.pageSize || 50)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to fetch reminders:', err)
    } finally {
      setLoading(false)
    }
  }, [buildQueryString])

  const createReminder = useCallback(async (data: ReminderCreateData): Promise<Reminder | null> => {
    try {
      const response = await fetch('/api/reminders/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to create reminder: ${response.status}`)
      }

      const newReminder = await response.json()
      await fetchReminders() // Refresh the list
      return newReminder
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to create reminder:', err)
      return null
    }
  }, [fetchReminders])

  const updateReminder = useCallback(async (id: string, data: ReminderUpdateData): Promise<boolean> => {
    try {
      const response = await fetch('/api/reminders/reminders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update reminder: ${response.status}`)
      }

      await fetchReminders() // Refresh the list
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to update reminder:', err)
      return false
    }
  }, [fetchReminders])

  const deleteReminder = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/reminders/reminders', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete reminder: ${response.status}`)
      }

      await fetchReminders() // Refresh the list
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to delete reminder:', err)
      return false
    }
  }, [fetchReminders])

  const refresh = useCallback(async () => {
    await fetchReminders()
  }, [fetchReminders])

  // Fetch reminders when dependencies change
  useEffect(() => {
    fetchReminders()
  }, [fetchReminders])

  const totalPages = Math.ceil(total / pageSize)

  return {
    reminders,
    loading,
    error,
    total,
    page,
    pageSize,
    totalPages,
    createReminder,
    updateReminder,
    deleteReminder,
    refresh,
    setFilters,
    setPage,
    setPageSize,
  }
}