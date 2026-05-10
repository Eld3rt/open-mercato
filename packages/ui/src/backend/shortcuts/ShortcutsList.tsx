'use client'

import * as React from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@open-mercato/ui/primitives/button'
import { Input } from '@open-mercato/ui/primitives/input'
import { Badge } from '@open-mercato/ui/primitives/badge'
import { ShortcutItem } from './ShortcutItem'
import { ShortcutForm } from './ShortcutForm'
import { useShortcuts, type Shortcut } from './useShortcuts'

interface ShortcutsListProps {
  showPinned?: boolean
  className?: string
}

export function ShortcutsList({
  showPinned = true,
  className = '',
}: ShortcutsListProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showForm, setShowForm] = React.useState(false)
  const [editingShortcut, setEditingShortcut] = React.useState<Shortcut | null>(null)
  const [sortBy, setSortBy] = React.useState<'pinned' | 'name' | 'created' | 'accessed'>('pinned')

  const filters = React.useMemo(() => ({
    search: searchQuery || undefined,
    onlyPinned: false,
    sortBy,
  }), [searchQuery, sortBy])

  const {
    shortcuts,
    loading,
    error,
    createShortcut,
    updateShortcut,
    deleteShortcut,
    trackAccess,
    refresh,
    setFilters,
  } = useShortcuts(filters)

  React.useEffect(() => {
    setFilters(filters)
  }, [filters, setFilters])

  const handleCreateShortcut = React.useCallback(async (data: {
    name: string
    url: string
    description?: string
    icon?: string
  }) => {
    await createShortcut(data.name, data.url, data.icon, data.description)
    setShowForm(false)
  }, [createShortcut])

  const handleUpdateShortcut = React.useCallback(async (data: {
    name: string
    url: string
    description?: string
    icon?: string
  }) => {
    if (editingShortcut) {
      await updateShortcut(editingShortcut.id, data)
      setEditingShortcut(null)
    }
  }, [editingShortcut, updateShortcut])

  const handleTogglePin = React.useCallback((id: string, isPinned: boolean) => {
    updateShortcut(id, { isPinned })
  }, [updateShortcut])

  const handleDeleteShortcut = React.useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this shortcut?')) {
      await deleteShortcut(id)
    }
  }, [deleteShortcut])

  const handleEditShortcut = React.useCallback((shortcut: Shortcut) => {
    setEditingShortcut(shortcut)
    setShowForm(true)
  }, [])

  const handleShortcutAccess = React.useCallback(async (id: string) => {
    await trackAccess(id)
  }, [trackAccess])

  // Separate pinned and unpinned shortcuts
  const pinnedShortcuts = shortcuts.filter(s => s.isPinned)
  const unpinnedShortcuts = shortcuts.filter(s => !s.isPinned)

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading shortcuts: {error}</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with search and create */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Shortcuts</h2>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Shortcut
          </Button>
        </div>

        {/* Search and filter bar */}
        <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-0"
          />

          <div className="flex items-center space-x-1">
            {(['pinned', 'name', 'created', 'accessed'] as const).map(sort => (
              <Badge
                key={sort}
                variant={sortBy === sort ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSortBy(sort)}
              >
                {sort}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div className="text-sm text-muted-foreground">
          {shortcuts.length} shortcut{shortcuts.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <p>Loading shortcuts...</p>
          </div>
        ) : shortcuts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No shortcuts found</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first shortcut
            </Button>
          </div>
        ) : (
          <>
            {/* Pinned section */}
            {showPinned && pinnedShortcuts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                  <Badge variant="default" className="mr-2">Pinned</Badge>
                  {pinnedShortcuts.length}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pinnedShortcuts.map(shortcut => (
                    <ShortcutItem
                      key={shortcut.id}
                      shortcut={shortcut}
                      onEdit={handleEditShortcut}
                      onDelete={handleDeleteShortcut}
                      onTogglePin={handleTogglePin}
                      onAccess={handleShortcutAccess}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Unpinned section */}
            {unpinnedShortcuts.length > 0 && (
              <div>
                {pinnedShortcuts.length > 0 && (
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">
                    Other Shortcuts ({unpinnedShortcuts.length})
                  </h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {unpinnedShortcuts.map(shortcut => (
                    <ShortcutItem
                      key={shortcut.id}
                      shortcut={shortcut}
                      onEdit={handleEditShortcut}
                      onDelete={handleDeleteShortcut}
                      onTogglePin={handleTogglePin}
                      onAccess={handleShortcutAccess}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      <ShortcutForm
        isOpen={showForm || !!editingShortcut}
        onClose={() => {
          setShowForm(false)
          setEditingShortcut(null)
        }}
        onSubmit={editingShortcut ? handleUpdateShortcut : handleCreateShortcut}
        shortcut={editingShortcut}
      />
    </div>
  )
}