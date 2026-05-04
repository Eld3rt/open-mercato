import type { EntityManager } from '@mikro-orm/postgresql'
import { Notification } from '../data/entities'
import { NOTIFICATION_EVENTS } from '../lib/events'
import { findOneWithDecryption } from '@open-mercato/shared/lib/encryption/find'

export const metadata = {
  event: NOTIFICATION_EVENTS.ACTIONED,
  persistent: true,
  id: 'notifications:reminder-actions',
}

type NotificationActionedPayload = {
  notificationId: string
  actionId: string
  userId: string
  tenantId: string
}

type ResolverContext = {
  resolve: <T = unknown>(name: string) => T
}

export default async function handleReminderActions(
  payload: NotificationActionedPayload,
  { resolve }: ResolverContext
): Promise<void> {
  const em = resolve<EntityManager>('em')

  // Only process reminder notifications
  if (!payload.notificationId) return

  const notification = await findOneWithDecryption(em, Notification, {
    id: payload.notificationId,
    tenantId: payload.tenantId,
  })

  if (!notification || !notification.type.startsWith('system.reminder.')) {
    return
  }

  const { actionId } = payload

  switch (actionId) {
    case 'snooze': {
      // Snooze the reminder by creating a new notification with delayed expiration
      const snoozeHours = 24 // Default snooze for 24 hours
      const snoozeUntil = new Date(Date.now() + snoozeHours * 60 * 60 * 1000)

      // Create a snoozed version of the same reminder
      const snoozedNotification = em.create(Notification, {
        recipientUserId: notification.recipientUserId,
        type: notification.type,
        titleKey: notification.titleKey,
        bodyKey: notification.bodyKey,
        titleVariables: notification.titleVariables,
        bodyVariables: notification.bodyVariables,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        severity: notification.severity,
        actionData: notification.actionData,
        sourceModule: notification.sourceModule,
        sourceEntityType: notification.sourceEntityType,
        sourceEntityId: notification.sourceEntityId,
        linkHref: notification.linkHref,
        groupKey: notification.groupKey,
        expiresAt: snoozeUntil,
        tenantId: notification.tenantId,
        organizationId: notification.organizationId,
        status: 'unread',
      })

      await em.persistAndFlush(snoozedNotification)

      // Emit snoozed event
      const eventBus = resolve('eventBus')
      await eventBus.emit(NOTIFICATION_EVENTS.SNOOZED, {
        notificationId: notification.id,
        userId: payload.userId,
        snoozeUntil: snoozeUntil.toISOString(),
        tenantId: payload.tenantId,
      })

      break
    }

    case 'complete': {
      // Mark the reminder as completed - this is handled by the main action execution
      // Emit completed event
      const eventBus = resolve('eventBus')
      await eventBus.emit(NOTIFICATION_EVENTS.COMPLETED, {
        notificationId: notification.id,
        userId: payload.userId,
        tenantId: payload.tenantId,
      })

      break
    }

    case 'extend_deadline': {
      // Extend deadline by creating a new reminder with later expiration
      const extensionHours = 48 // Default extension for 48 hours
      const newDeadline = new Date(Date.now() + extensionHours * 60 * 60 * 1000)

      // Create an extended version of the deadline reminder
      const extendedNotification = em.create(Notification, {
        recipientUserId: notification.recipientUserId,
        type: 'system.reminder.deadline_approaching',
        titleKey: 'notifications.reminder.deadline_extended.title',
        bodyKey: 'notifications.reminder.deadline_extended.body',
        titleVariables: {
          ...notification.titleVariables,
          extendedHours: extensionHours.toString(),
        },
        bodyVariables: notification.bodyVariables,
        title: `Deadline Extended by ${extensionHours} hours`,
        body: notification.body,
        icon: 'calendar-plus',
        severity: 'warning',
        actionData: notification.actionData,
        sourceModule: notification.sourceModule,
        sourceEntityType: notification.sourceEntityType,
        sourceEntityId: notification.sourceEntityId,
        linkHref: notification.linkHref,
        groupKey: notification.groupKey,
        expiresAt: newDeadline,
        tenantId: notification.tenantId,
        organizationId: notification.organizationId,
        status: 'unread',
      })

      await em.persistAndFlush(extendedNotification)

      break
    }
  }
}