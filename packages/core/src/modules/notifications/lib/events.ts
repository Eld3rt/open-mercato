export const NOTIFICATION_EVENTS = {
  CREATED: 'notifications.created',
  READ: 'notifications.read',
  ACTIONED: 'notifications.actioned',
  DISMISSED: 'notifications.dismissed',
  RESTORED: 'notifications.restored',
  EXPIRED: 'notifications.expired',
  SNOOZED: 'notifications.snoozed',
  COMPLETED: 'notifications.completed',
} as const

export const NOTIFICATION_SSE_EVENTS = {
  CREATED: 'notifications.notification.created',
  BATCH_CREATED: 'notifications.notification.batch_created',
  REMINDER_DUE: 'notifications.reminder.due',
} as const

export type NotificationCreatedPayload = {
  notificationId: string
  recipientUserId: string
  type: string
  title: string
  tenantId: string
  organizationId?: string | null
}

export type NotificationReadPayload = {
  notificationId: string
  userId: string
  tenantId: string
}

export type NotificationActionedPayload = {
  notificationId: string
  actionId: string
  userId: string
  tenantId: string
}

export type NotificationDismissedPayload = {
  notificationId: string
  userId: string
  tenantId: string
}

export type NotificationRestoredPayload = {
  notificationId: string
  userId: string
  tenantId: string
  status: 'read' | 'unread'
}

export type NotificationExpiredPayload = {
  notificationIds: string[]
  tenantId: string
}

export type NotificationSnoozedPayload = {
  notificationId: string
  userId: string
  snoozeUntil: string
  tenantId: string
}

export type NotificationCompletedPayload = {
  notificationId: string
  userId: string
  tenantId: string
}

export type NotificationReminderDuePayload = {
  notificationId: string
  reminderType: 'task_due' | 'follow_up' | 'deadline_approaching'
  sourceEntityType?: string
  sourceEntityId?: string
  tenantId: string
  organizationId?: string | null
}
