import type { WorkerHandler } from '@open-mercato/shared/lib/queue'

export const metadata = {
  queue: 'project_comments',
  id: 'project_comments.comment.processor',
  concurrency: 5,
}

export default async function processComment(job: WorkerHandler<typeof metadata.queue>) {
  // Process comment-related background tasks
  console.log('Processing comment job:', job.data)
}