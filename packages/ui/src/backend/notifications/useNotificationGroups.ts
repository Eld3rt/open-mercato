'use client'
import * as React from 'react'
import { apiCall } from '../utils/apiCall'
import type { NotificationGroupDto } from '@open-mercato/shared/modules/notifications/types'

export interface UseNotificationGroupsOptions {
  page?: number
  pageSize?: number
  status?: string | string[]
  type?: string
  severity?: string
  sourceEntityType?: string
  sourceEntityId?: string
  since?: string
  enabled?: boolean
}

export function useNotificationGroups(options: UseNotificationGroupsOptions = {}) {
  const [data, setData] = React.useState<{
    items: NotificationGroupDto[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  } | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchGroups = React.useCallback(async () => {
    if (!options.enabled) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options.page) params.set('page', options.page.toString())
      if (options.pageSize) params.set('pageSize', options.pageSize.toString())
      if (options.status) {
        if (Array.isArray(options.status)) {
          options.status.forEach(s => params.append('status', s))
        } else {
          params.set('status', options.status)
        }
      }
      if (options.type) params.set('type', options.type)
      if (options.severity) params.set('severity', options.severity)
      if (options.sourceEntityType) params.set('sourceEntityType', options.sourceEntityType)
      if (options.sourceEntityId) params.set('sourceEntityId', options.sourceEntityId)
      if (options.since) params.set('since', options.since)

      const response = await apiCall(`/api/notifications/groups?${params}`)
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notification groups')
    } finally {
      setLoading(false)
    }
  }, [options])

  React.useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const viewGroup = React.useCallback(async (groupKey: string) => {
    // Navigate to a detailed view of the group
    // This could open a modal or navigate to a dedicated page
    console.log('View group:', groupKey)
  }, [])

  const markGroupAsRead = React.useCallback(
    async (groupKey: string) => {
      try {
        await apiCall(`/api/notifications/groups/${groupKey}/read`, {
          method: 'POST',
        })
        // Refresh the groups
        await fetchGroups()
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to mark group as read')
      }
    },
    [fetchGroups],
  )

  const dismissGroup = React.useCallback(
    async (groupKey: string) => {
      try {
        await apiCall(`/api/notifications/groups/${groupKey}/dismiss`, {
          method: 'POST',
        })
        // Refresh the groups
        await fetchGroups()
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to dismiss group')
      }
    },
    [fetchGroups],
  )

  return {
    data,
    loading,
    error,
    refetch: fetchGroups,
    viewGroup,
    markGroupAsRead,
    dismissGroup,
  }
}
