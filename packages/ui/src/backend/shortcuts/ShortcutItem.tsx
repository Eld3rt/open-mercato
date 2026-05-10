'use client'

import * as React from 'react'
import { ExternalLink, Pin, PinOff, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@open-mercato/ui/primitives/button'
import { Card, CardContent } from '@open-mercato/ui/primitives/card'
import { Badge } from '@open-mercato/ui/primitives/badge'
import type { Shortcut } from './useShortcuts'

interface ShortcutItemProps {
  shortcut: Shortcut
  onEdit?: (shortcut: Shortcut) => void
  onDelete?: (id: string) => void
  onTogglePin?: (id: string, isPinned: boolean) => void
  onAccess?: (id: string) => Promise<void>
}

const commonIcons: Record<string, string> = {
  dashboard: '📊',
  customers: '👥',
  sales: '💼',
  products: '📦',
  analytics: '📈',
  settings: '⚙️',
  search: '🔍',
  notifications: '🔔',
  calendar: '📅',
  mail: '✉️',
}

export function ShortcutItem({
  shortcut,
  onEdit,
  onDelete,
  onTogglePin,
  onAccess,
}: ShortcutItemProps) {
  const [isHovering, setIsHovering] = React.useState(false)

  const handleAccess = React.useCallback(async () => {
    if (onAccess) {
      await onAccess(shortcut.id)
    }
    // Open in new tab
    window.open(shortcut.url, '_blank')
  }, [shortcut.id, shortcut.url, onAccess])

  const icon = shortcut.icon || commonIcons[shortcut.name.toLowerCase()] || '🔗'

  return (
    <Card
      className={`transition-all hover:shadow-md cursor-pointer ${
        shortcut.isPinned ? 'border-yellow-300 bg-yellow-50' : ''
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0" onClick={handleAccess}>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xl">{icon}</span>
              <h3 className="font-semibold truncate text-sm hover:underline">
                {shortcut.name}
              </h3>
              {shortcut.isPinned && (
                <Badge variant="default" className="ml-auto">
                  Pinned
                </Badge>
              )}
            </div>

            {shortcut.description && (
              <p className="text-xs text-muted-foreground truncate mb-2">
                {shortcut.description}
              </p>
            )}

            <div className="text-xs text-gray-500 truncate hover:text-gray-700">
              {new URL(shortcut.url).hostname}
            </div>
          </div>

          {isHovering && (
            <div className="flex items-center space-x-1 ml-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(shortcut)
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}

              {onTogglePin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTogglePin(shortcut.id, !shortcut.isPinned)
                  }}
                >
                  {shortcut.isPinned ? (
                    <PinOff className="h-4 w-4" />
                  ) : (
                    <Pin className="h-4 w-4" />
                  )}
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(shortcut.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAccess()
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {shortcut.accessCount > 0 && (
          <div className="mt-2 text-xs text-gray-400">
            Used {shortcut.accessCount} time{shortcut.accessCount !== 1 ? 's' : ''}
            {shortcut.lastAccessedAt && (
              <>
                {' '}
                • Last: {new Date(shortcut.lastAccessedAt).toLocaleDateString()}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}