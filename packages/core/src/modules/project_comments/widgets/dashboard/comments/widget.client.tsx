'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@open-mercato/ui/primitives/card'
import { useT } from '@open-mercato/shared/lib/i18n/context'

interface CommentCardProps {
  comment: {
    id: string
    projectId: string
    taskId: string | null
    authorUserId: string
    content: string
    createdAt: string
  }
}

function CommentCard({ comment }: CommentCardProps) {
  const t = useT('projectComments')

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <Card className="mb-2 border border-border">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground mb-1">
              {t('comment.byUser')}: {comment.authorUserId}
            </p>
            <p className="text-sm mb-2">{truncateContent(comment.content)}</p>
            <p className="text-xs text-muted-foreground">
              {comment.taskId ? t('comment.onTask') : t('comment.onProject')}: {comment.taskId || comment.projectId}
            </p>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {new Date(comment.createdAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingMessage() {
  const t = useT('projectComments')
  return <div className="text-center py-4">{t('dashboard.loading')}</div>
}

function ErrorMessage({ error }: { error: Error }) {
  const t = useT('projectComments')
  return <div className="text-center py-4 text-destructive">{t('dashboard.error')}: {error.message}</div>
}

function EmptyMessage() {
  const t = useT('projectComments')
  return <div className="text-center py-4 text-muted-foreground">{t('dashboard.empty')}</div>
}

async function fetchRecentComments(): Promise<CommentCardProps['comment'][]> {
  const response = await fetch('/api/project-comments?pageSize=5&sortBy=createdAt')
  if (!response.ok) {
    throw new Error('Failed to load comments')
  }
  const data = await response.json()
  return data.items ?? []
}

export default function CommentsDashboardWidget() {
  const t = useT('projectComments')
  const { data, isLoading, error } = useQuery({
    queryKey: ['projectComments', 'recent'],
    queryFn: fetchRecentComments,
    refetchInterval: 30000,
  })

  if (isLoading) return <LoadingMessage />
  if (error) return <ErrorMessage error={error as Error} />
  if (!data || data.length === 0) return <EmptyMessage />

  return (
    <div className="space-y-2">
      {data.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  )
}