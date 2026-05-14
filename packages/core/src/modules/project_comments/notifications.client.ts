import type { NotificationRenderer } from '@open-mercato/shared/lib/notifications'

export const notificationRenderers: NotificationRenderer[] = [
  {
    type: 'project_comments.comment_mention',
    render: (notification) => ({
      title: notification.title,
      description: notification.description,
      action: {
        label: 'View Comment',
        href: `/projects/${notification.data?.projectId}/comments/${notification.data?.commentId}`,
      },
    }),
  },
  {
    type: 'project_comments.comment_reply',
    render: (notification) => ({
      title: notification.title,
      description: notification.description,
      action: {
        label: 'View Reply',
        href: `/projects/${notification.data?.projectId}/comments/${notification.data?.commentId}`,
      },
    }),
  },
]