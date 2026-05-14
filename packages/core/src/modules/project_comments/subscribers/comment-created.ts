import type { EventHandler } from '@open-mercato/shared/lib/events'

export const metadata = {
  event: 'project_comments.comment.created',
  persistent: true,
  id: 'project_comments.comment.created.handler',
}

export default async function handleCommentCreated(event: EventHandler<typeof metadata.event>) {
  // Handle comment creation - could trigger notifications, search indexing, etc.
  console.log('Comment created:', event.payload)
}