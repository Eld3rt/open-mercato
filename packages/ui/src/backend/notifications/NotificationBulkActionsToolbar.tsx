'use client'

import * as React from 'react'
import { CheckSquare, X, MoreVertical } from 'lucide-react'
import { Button } from '../../primitives/button'
import { cn } from '@open-mercato/shared/lib/utils'
import type { TranslateFn } from '@open-mercato/shared/lib/i18n/context'

export interface NotificationBulkActionsToolbarProps {
  selectedCount: number
  isLoading: boolean
  onMarkAsRead: () => Promise<void>
  onDismiss: () => Promise<void>
  onClear: () => void
  t: TranslateFn
  className?: string
}

export function NotificationBulkActionsToolbar({
  selectedCount,
  isLoading,
  onMarkAsRead,
  onDismiss,
  onClear,
  t,
  className,
}: NotificationBulkActionsToolbarProps) {
  const [error, setError] = React.useState<string | null>(null)

  const handleMarkAsRead = async () => {
    try {
      setError(null)
      await onMarkAsRead()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleDismiss = async () => {
    try {
      setError(null)
      await onDismiss()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <div className={cn('flex items-center gap-2 bg-muted/50 px-4 py-3 border-b', className)}>
      <div className="flex-1">
        <p className="text-sm font-medium">
          {t('notifications.bulk.selected', '{{count}} selected', { count: String(selectedCount) })}
        </p>
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAsRead}
          disabled={isLoading}
        >
          {t('notifications.bulk.markAsRead', 'Mark as read')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDismiss}
          disabled={isLoading}
        >
          {t('notifications.bulk.dismiss', 'Dismiss')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
