import type { NotificationTypes } from '@open-mercato/shared/lib/notifications'

export const notificationTypes: NotificationTypes = {
  'project_comments.comment_mention': {
    title: 'You were mentioned in a comment',
    description: 'Someone mentioned you in a project comment',
    category: 'project_comments',
    icon: 'message-square',
    priority: 'normal',
  },
  'project_comments.comment_reply': {
    title: 'Someone replied to your comment',
    description: 'A reply was added to one of your comments',
    category: 'project_comments',
    icon: 'message-square',
    priority: 'normal',
  },
}