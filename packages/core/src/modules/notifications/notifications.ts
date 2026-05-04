import type { NotificationTypeDefinition } from '@open-mercato/shared/modules/notifications/types'

export const notificationTypes: NotificationTypeDefinition[] = [
  {
    type: 'system.reminder.task_due',
    module: 'notifications',
    titleKey: 'notifications.reminder.task_due.title',
    bodyKey: 'notifications.reminder.task_due.body',
    icon: 'clock',
    severity: 'warning',
    actions: [
      {
        id: 'view',
        labelKey: 'common.view',
        variant: 'outline',
        href: '/backend/{sourceModule}/{sourceEntityType}s/{sourceEntityId}',
        icon: 'external-link',
      },
      {
        id: 'snooze',
        labelKey: 'notifications.actions.snooze',
        variant: 'secondary',
        commandId: 'notifications.snooze',
        icon: 'alarm-clock-off',
        confirmRequired: true,
        confirmMessageKey: 'notifications.confirm.snooze',
      },
    ],
    primaryActionId: 'view',
    linkHref: '/backend/{sourceModule}/{sourceEntityType}s/{sourceEntityId}',
    expiresAfterHours: 24, // 1 day
  },
  {
    type: 'system.reminder.follow_up',
    module: 'notifications',
    titleKey: 'notifications.reminder.follow_up.title',
    bodyKey: 'notifications.reminder.follow_up.body',
    icon: 'rotate-cw',
    severity: 'info',
    actions: [
      {
        id: 'view',
        labelKey: 'common.view',
        variant: 'outline',
        href: '/backend/{sourceModule}/{sourceEntityType}s/{sourceEntityId}',
        icon: 'external-link',
      },
      {
        id: 'complete',
        labelKey: 'notifications.actions.mark_complete',
        variant: 'default',
        commandId: 'notifications.mark_complete',
        icon: 'check-circle',
      },
    ],
    primaryActionId: 'view',
    linkHref: '/backend/{sourceModule}/{sourceEntityType}s/{sourceEntityId}',
    expiresAfterHours: 72, // 3 days
  },
  {
    type: 'system.reminder.deadline_approaching',
    module: 'notifications',
    titleKey: 'notifications.reminder.deadline_approaching.title',
    bodyKey: 'notifications.reminder.deadline_approaching.body',
    icon: 'alert-triangle',
    severity: 'error',
    actions: [
      {
        id: 'view',
        labelKey: 'common.view',
        variant: 'outline',
        href: '/backend/{sourceModule}/{sourceEntityType}s/{sourceEntityId}',
        icon: 'external-link',
      },
      {
        id: 'extend',
        labelKey: 'notifications.actions.extend_deadline',
        variant: 'secondary',
        commandId: 'notifications.extend_deadline',
        icon: 'calendar-plus',
        confirmRequired: true,
        confirmMessageKey: 'notifications.confirm.extend_deadline',
      },
    ],
    primaryActionId: 'view',
    linkHref: '/backend/{sourceModule}/{sourceEntityType}s/{sourceEntityId}',
    expiresAfterHours: 1, // 1 hour - urgent
  },
]

export default notificationTypes