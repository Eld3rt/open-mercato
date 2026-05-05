import type { NotificationDto, NotificationGroupDto } from '@open-mercato/shared/modules/notifications/types'
import { Notification } from '../data/entities'

export function toNotificationDto(notification: Notification): NotificationDto {
  const createdAt = notification.createdAt instanceof Date
    ? notification.createdAt
    : (() => {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(
          '[notifications] Invalid createdAt on notification entity, falling back to current time',
          { id: notification.id, createdAt: notification.createdAt },
        )
      }
      return new Date()
    })()
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    titleKey: notification.titleKey,
    bodyKey: notification.bodyKey,
    titleVariables: notification.titleVariables,
    bodyVariables: notification.bodyVariables,
    icon: notification.icon,
    severity: notification.severity,
    status: notification.status,
    actions: notification.actionData?.actions?.map((action) => ({
      id: action.id,
      label: action.label,
      labelKey: action.labelKey,
      variant: action.variant,
      icon: action.icon,
    })) ?? [],
    primaryActionId: notification.actionData?.primaryActionId,
    sourceModule: notification.sourceModule,
    sourceEntityType: notification.sourceEntityType,
    sourceEntityId: notification.sourceEntityId,
    linkHref: notification.linkHref,
    createdAt: createdAt.toISOString(),
    readAt: notification.readAt?.toISOString() ?? null,
    actionTaken: notification.actionTaken,
  }
}

export function toNotificationGroupDto(group: any): NotificationGroupDto {
  const createdAt = group.latest_created_at ? new Date(group.latest_created_at) : new Date()

  return {
    groupKey: group.group_key,
    type: group.type,
    title: group.title,
    body: group.body,
    titleKey: group.title_key,
    bodyKey: group.body_key,
    titleVariables: null, // Groups don't have variables for now
    bodyVariables: null,
    icon: group.icon,
    severity: group.severity || 'info',
    status: 'read', // Group status is derived from individual notifications
    actions: [], // Groups don't have actions for now
    primaryActionId: undefined,
    sourceModule: group.source_module,
    sourceEntityType: group.source_entity_type,
    sourceEntityId: group.source_entity_id,
    linkHref: group.link_href,
    createdAt: createdAt.toISOString(),
    readAt: null,
    actionTaken: undefined,
    count: parseInt(group.count, 10),
    latestId: group.latest_id,
    unreadCount: parseInt(group.unread_count, 10),
  }
}
