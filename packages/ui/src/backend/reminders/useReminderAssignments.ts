'use client'

import { useCallback, useState } from 'react'

export interface ReminderAssignment {
  id: string
  reminderId: string
  entityType: string
  entityId: string
  createdAt: string
}

export interface UseReminderAssignmentsResult {
  assignReminder: (reminderId: string, entityType: string, entityId: string) => Promise<boolean>
  unassignReminder: (reminderId: string, entityType: string, entityId: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useReminderAssignments(): UseReminderAssignmentsResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const assignReminder = useCallback(async (
    reminderId: string,
    entityType: string,
    entityId: string
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/reminders/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reminderId,
          entityType,
          entityId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to assign reminder: ${response.status}`)
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to assign reminder:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const unassignReminder = useCallback(async (
    reminderId: string,
    entityType: string,
    entityId: string
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/reminders/assignments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reminderId,
          entityType,
          entityId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to unassign reminder: ${response.status}`)
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to unassign reminder:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    assignReminder,
    unassignReminder,
    loading,
    error,
  }
}