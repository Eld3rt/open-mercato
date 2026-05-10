'use client'

import { useCallback, useEffect, useState } from 'react'

export interface Shortcut {
  id: string
  name: string
  description?: string
  url: string
  icon?: string
  orderIndex: number
  isPinned: boolean
  accessCount: number
  lastAccessedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ShortcutFilters {
  search?: string
  onlyPinned?: boolean
  sortBy?: 'name' | 'created' | 'accessed' | 'pinned'
}

export interface UseShortcutsResult {
  shortcuts: Shortcut[]
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
  totalPages: number
  createShortcut: (name: string, url: string, icon?: string, description?: string) => Promise<Shortcut | null>
  updateShortcut: (id: string, updates: Partial<Pick<Shortcut, 'name' | 'description' | 'url' | 'icon' | 'isPinned' | 'orderIndex'>>) => Promise<boolean>
  deleteShortcut: (id: string) => Promise<boolean>
  trackAccess: (id: string) => Promise<boolean>
  reorderShortcuts: (shortcuts: Array<{ id: string; orderIndex: number }>) => Promise<boolean>
  refresh: () => Promise<void>
  setFilters: (filters: ShortcutFilters) => void
  setPage: (page: number) => void
}

export function useShortcuts(initialFilters: ShortcutFilters = {}): UseShortcutsResult {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [filters, setFilters] = useState<ShortcutFilters>(initialFilters)

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortBy: filters.sortBy || 'pinned',
    })

    if (filters.search) params.set('search', filters.search)
    if (filters.onlyPinned) params.set('onlyPinned', 'true')

    return params.toString()
  }, [page, pageSize, filters])

  const fetchShortcuts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const queryString = buildQueryString()
      const response = await fetch(`/api/shortcuts/shortcuts?${queryString}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch shortcuts: ${response.status}`)
      }

      const data = await response.json()
      setShortcuts(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to fetch shortcuts:', err)
    } finally {
      setLoading(false)
    }
  }, [buildQueryString])

  const createShortcut = useCallback(
    async (name: string, url: string, icon?: string, description?: string): Promise<Shortcut | null> => {
      try {
        const response = await fetch('/api/shortcuts/shortcuts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, url, icon, description }),
        })

        if (!response.ok) {
          throw new Error(`Failed to create shortcut: ${response.status}`)
        }

        const newShortcut = await response.json()
        await fetchShortcuts()
        return newShortcut
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        console.error('Failed to create shortcut:', err)
        return null
      }
    },
    [fetchShortcuts]
  )

  const updateShortcut = useCallback(
    async (id: string, updates: Partial<Pick<Shortcut, 'name' | 'description' | 'url' | 'icon' | 'isPinned' | 'orderIndex'>>): Promise<boolean> => {
      try {
        const response = await fetch('/api/shortcuts/shortcuts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        })

        if (!response.ok) {
          throw new Error(`Failed to update shortcut: ${response.status}`)
        }

        await fetchShortcuts()
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        console.error('Failed to update shortcut:', err)
        return false
      }
    },
    [fetchShortcuts]
  )

  const deleteShortcut = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch('/api/shortcuts/shortcuts', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })

        if (!response.ok) {
          throw new Error(`Failed to delete shortcut: ${response.status}`)
        }

        await fetchShortcuts()
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        console.error('Failed to delete shortcut:', err)
        return false
      }
    },
    [fetchShortcuts]
  )

  const trackAccess = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/shortcuts/shortcuts/${id}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`Failed to track access: ${response.status}`)
      }

      return true
    } catch (err) {
      console.error('Failed to track shortcut access:', err)
      return false
    }
  }, [])

  const reorderShortcuts = useCallback(
    async (reorderedShortcuts: Array<{ id: string; orderIndex: number }>): Promise<boolean> => {
      try {
        // Update locally for optimistic UI update
        const updatedShortcuts = shortcuts.map(s => {
          const reorder = reorderedShortcuts.find(r => r.id === s.id)
          return reorder ? { ...s, orderIndex: reorder.orderIndex } : s
        })
        setShortcuts(updatedShortcuts)

        // Send to server
        for (const { id, orderIndex } of reorderedShortcuts) {
          await updateShortcut(id, { orderIndex })
        }

        return true
      } catch (err) {
        console.error('Failed to reorder shortcuts:', err)
        await fetchShortcuts() // Refresh on error
        return false
      }
    },
    [shortcuts, updateShortcut, fetchShortcuts]
  )

  const refresh = useCallback(() => fetchShortcuts(), [fetchShortcuts])

  useEffect(() => {
    fetchShortcuts()
  }, [fetchShortcuts])

  const totalPages = Math.ceil(total / pageSize)

  return {
    shortcuts,
    loading,
    error,
    total,
    page,
    pageSize,
    totalPages,
    createShortcut,
    updateShortcut,
    deleteShortcut,
    trackAccess,
    reorderShortcuts,
    refresh,
    setFilters,
    setPage,
  }
}