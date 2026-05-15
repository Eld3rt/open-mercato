import { createModuleEvents } from '@open-mercato/shared/lib/events'

export const events = createModuleEvents({
  'project_comments.comment.created': {
    description: 'A new comment was created',
    payload: {
      commentId: 'string',
      projectId: 'string',
      taskId: 'string | null',
      authorUserId: 'string',
      content: 'string',
    },
    clientBroadcast: true,
  },
  'project_comments.comment.updated': {
    description: 'A comment was updated',
    payload: {
      commentId: 'string',
      projectId: 'string',
      taskId: 'string | null',
      authorUserId: 'string',
      content: 'string',
    },
    clientBroadcast: true,
  },
  'project_comments.comment.deleted': {
    description: 'A comment was deleted',
    payload: {
      commentId: 'string',
      projectId: 'string',
      taskId: 'string | null',
      authorUserId: 'string',
    },
    clientBroadcast: true,
  },
} as const)