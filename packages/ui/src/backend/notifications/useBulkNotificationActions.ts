'use client'

import { useCallback, useState } from 'react'

export interface UseBulkNotificationActionsReturn {
  isLoading: boolean
  error: string | null
  markAsRead: (notificationIds: string[]) => Promise<void>
  dismiss: (notificationIds: string[]) => Promise<void>
}

export function useBulkNotificationActions(): UseBulkNotificationActionsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    if (notificationIds.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notifications/bulk/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `Failed to mark notifications as read (${response.status})`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const dismiss = useCallback(async (notificationIds: string[]) => {
    if (notificationIds.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notifications/bulk/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `Failed to dismiss notifications (${response.status})`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    markAsRead,
    dismiss,
  }
}
