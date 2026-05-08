'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Tag } from './useTags'

export interface EntityTagsResult {
  tags: Tag[]
  loading: boolean
  error: string | null
  assignTags: (tagIds: string[]) => Promise<boolean>
  unassignTags: (tagIds: string[]) => Promise<boolean>
  refresh: () => Promise<void>
}

export function useEntityTags(entityType: string, entityId: string): EntityTagsResult {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTags = useCallback(async () => {
    if (!entityType || !entityId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/tags/entity/${entityType}/${entityId}`)
      if (!response.ok) {
        if (response.status === 404) {
          // Entity has no tags yet, which is fine
          setTags([])
          return
        }
        throw new Error(`Failed to fetch entity tags: ${response.status}`)
      }

      const data = await response.json()
      setTags(data.tags || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to fetch entity tags:', err)
    } finally {
      setLoading(false)
    }
  }, [entityType, entityId])

  const assignTags = useCallback(async (tagIds: string[]): Promise<boolean> => {
    if (!entityType || !entityId || tagIds.length === 0) return false

    try {
      setError(null)

      const response = await fetch('/api/tags/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          tagIds,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `Failed to assign tags: ${response.status}`)
      }

      // Refresh tags after assignment
      await fetchTags()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to assign tags:', err)
      return false
    }
  }, [entityType, entityId, fetchTags])

  const unassignTags = useCallback(async (tagIds: string[]): Promise<boolean> => {
    if (!entityType || !entityId || tagIds.length === 0) return false

    try {
      setError(null)

      const response = await fetch('/api/tags/unassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          tagIds,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `Failed to unassign tags: ${response.status}`)
      }

      // Refresh tags after unassignment
      await fetchTags()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to unassign tags:', err)
      return false
    }
  }, [entityType, entityId, fetchTags])

  const refresh = useCallback(async () => {
    await fetchTags()
  }, [fetchTags])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  return {
    tags,
    loading,
    error,
    assignTags,
    unassignTags,
    refresh,
  }
}