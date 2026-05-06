"use client"
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Bell, AlertTriangle, CheckCircle2, XCircle, Info, Users } from 'lucide-react'
import { Button } from '../../primitives/button'
import { cn } from '@open-mercato/shared/lib/utils'
import { formatRelativeTime } from '@open-mercato/shared/lib/time'
import type { NotificationGroupDto } from '@open-mercato/shared/modules/notifications/types'
import type { TranslateFn } from '@open-mercato/shared/lib/i18n/context'

export type NotificationGroupItemProps = {
  group: NotificationGroupDto
  onViewGroup: (groupKey: string) => Promise<void>
  onMarkGroupAsRead: (groupKey: string) => Promise<void>
  onDismissGroup: (groupKey: string) => Promise<void>
  t: TranslateFn
}

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  error: XCircle,
}

const severityColors = {
  info: 'text-blue-500',
  warning: 'text-amber-500',
  success: 'text-green-500',
  error: 'text-destructive',
}

export function NotificationGroupItem({
  group,
  onViewGroup,
  onMarkGroupAsRead,
  onDismissGroup,
  t,
}: NotificationGroupItemProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState<string | null>(null)

  const hasUnread = group.unreadCount > 0
  const severity = group.severity as keyof typeof severityIcons
  const IconComponent = severityIcons[severity] ?? Bell

  const titleText = group.titleKey
    ? t(group.titleKey, group.title, group.titleVariables ?? undefined)
    : group.title

  const bodyText = group.bodyKey
    ? t(group.bodyKey, group.body ?? undefined, group.bodyVariables ?? undefined)
    : group.body

  const handleClick = async () => {
    if (hasUnread) {
      await handleMarkAsRead()
    }
    if (group.linkHref) {
      router.push(group.linkHref)
    } else {
      await handleViewGroup()
    }
  }

  const handleViewGroup = async () => {
    setLoading('view')
    try {
      await onViewGroup(group.groupKey)
    } finally {
      setLoading(null)
    }
  }

  const handleMarkAsRead = async () => {
    setLoading('read')
    try {
      await onMarkGroupAsRead(group.groupKey)
    } finally {
      setLoading(null)
    }
  }

  const handleDismiss = async (event?: React.MouseEvent) => {
    event?.stopPropagation()
    setLoading('dismiss')
    try {
      await onDismissGroup(group.groupKey)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      className={cn(
        'group relative px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50',
        hasUnread && 'bg-muted/30'
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      role="button"
      tabIndex={0}
    >
      {hasUnread && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
      )}

      <div className="flex gap-3">
        <div
          className={cn(
            'flex-shrink-0 mt-0.5',
            severityColors[severity] ?? 'text-muted-foreground'
          )}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn('text-sm font-medium', hasUnread && 'font-semibold')}>
              {titleText}
            </h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{group.count}</span>
                {group.unreadCount > 0 && (
                  <span className="text-primary font-medium">
                    ({group.unreadCount} {t('notifications.unread', 'unread')})
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(group.createdAt, { translate: t }) ?? ''}
              </span>
            </div>
          </div>

          {bodyText && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {bodyText}
            </p>
          )}

          <div className="mt-2 flex items-start gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-auto min-h-8"
              onClick={(event) => {
                event.stopPropagation()
                handleViewGroup()
              }}
              disabled={loading !== null}
            >
              {t('notifications.actions.view_group', 'View Group')}
            </Button>

            {hasUnread && (
              <Button
                variant="secondary"
                size="sm"
                className="h-auto min-h-8"
                onClick={(event) => {
                  event.stopPropagation()
                  handleMarkAsRead()
                }}
                disabled={loading !== null}
              >
                {t('notifications.actions.mark_read', 'Mark Read')}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-auto min-h-8 text-muted-foreground hover:text-destructive"
              onClick={handleDismiss}
              disabled={loading !== null}
            >
              {t('common.dismiss', 'Dismiss')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}