'use client'

import { useCallback, useEffect, useState } from 'react'
import type { TagColor } from './TagBadge'

export interface Tag {
  id: string
  name: string
  color: TagColor
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UseTagsResult {
  tags: Tag[]
  loading: boolean
  error: string | null
  createTag: (name: string, color?: TagColor, description?: string) => Promise<Tag | null>
  updateTag: (id: string, updates: Partial<Pick<Tag, 'name' | 'description' | 'color' | 'isActive'>>) => Promise<boolean>
  deleteTag: (id: string) => Promise<boolean>
  refresh: () => Promise<void>
}

export function useTags(): UseTagsResult {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/tags/tags')
      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.status}`)
      }

      const data = await response.json()
      setTags(data.items || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to fetch tags:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createTag = useCallback(async (
    name: string,
    color: TagColor = 'gray',
    description?: string
  ): Promise<Tag | null> => {
    try {
      const response = await fetch('/api/tags/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color, description }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `Failed to create tag: ${response.status}`)
      }

      const newTag = await response.json()
      setTags(prev => [...prev, newTag])
      return newTag
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to create tag:', err)
      return null
    }
  }, [])

  const updateTag = useCallback(async (
    id: string,
    updates: Partial<Pick<Tag, 'name' | 'description' | 'color' | 'isActive'>>
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tags/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `Failed to update tag: ${response.status}`)
      }

      const updatedTag = await response.json()
      setTags(prev => prev.map(tag => tag.id === id ? updatedTag : tag))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to update tag:', err)
      return false
    }
  }, [])

  const deleteTag = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tags/tags/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `Failed to delete tag: ${response.status}`)
      }

      setTags(prev => prev.filter(tag => tag.id !== id))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to delete tag:', err)
      return false
    }
  }, [])

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
    createTag,
    updateTag,
    deleteTag,
    refresh,
  }
}