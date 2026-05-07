'use client'

import { useCallback, useState } from 'react'

export interface UseBulkNotificationSelectionReturn {
  selectedIds: Set<string>
  isSelected: (id: string) => boolean
  toggle: (id: string) => void
  toggleAll: (ids: string[], selected: boolean) => void
  selectAll: (ids: string[]) => void
  deselectAll: () => void
  clear: () => void
  count: number
}

export function useBulkNotificationSelection(): UseBulkNotificationSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleAll = useCallback((ids: string[], selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) {
        ids.forEach((id) => next.add(id))
      } else {
        ids.forEach((id) => next.delete(id))
      }
      return next
    })
  }, [])

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const clear = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  return {
    selectedIds,
    isSelected,
    toggle,
    toggleAll,
    selectAll,
    deselectAll,
    clear,
    count: selectedIds.size,
  }
}
