'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@open-mercato/ui/primitives/card'
import { Button } from '@open-mercato/ui/primitives/button'
import { Textarea } from '@open-mercato/ui/primitives/textarea'
import { useT } from '@open-mercato/shared/lib/i18n/context'
import { useGuardedMutation } from '@open-mercato/ui/backend/utils/mutations'

interface Comment {
  id: string
  content: string
  authorUserId: string
  createdAt: string
  updatedAt: string
}

interface ProjectCommentsProps {
  projectId: string
}

async function fetchComments(projectId: string): Promise<Comment[]> {
  const response = await fetch(`/api/project-comments?projectId=${projectId}`)
  if (!response.ok) {
    throw new Error('Failed to load comments')
  }
  const data = await response.json()
  return data.items ?? []
}

async function createComment(projectId: string, content: string): Promise<Comment> {
  const response = await fetch('/api/project-comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, content }),
  })
  if (!response.ok) {
    throw new Error('Failed to create comment')
  }
  return response.json()
}

export default function ProjectComments({ projectId }: ProjectCommentsProps) {
  const t = useT('projectComments')
  const queryClient = useQueryClient()
  const [newComment, setNewComment] = useState('')

  const { data: comments, isLoading } = useQuery({
    queryKey: ['projectComments', projectId],
    queryFn: () => fetchComments(projectId),
  })

  const createMutation = useGuardedMutation({
    mutationFn: () => createComment(projectId, newComment),
    onSuccess: () => {
      setNewComment('')
      queryClient.invalidateQueries({ queryKey: ['projectComments', projectId] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      createMutation.runMutation()
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">{t('dashboard.loading')}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('comment.onProject')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comments?.map((comment) => (
            <div key={comment.id} className="border rounded p-3">
              <p className="text-sm mb-2">{comment.content}</p>
              <div className="text-xs text-muted-foreground">
                {t('comment.byUser')}: {comment.authorUserId} • {new Date(comment.createdAt).toLocaleString()}
              </div>
            </div>
          ))}

          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('comment.placeholder')}
              rows={3}
            />
            <Button type="submit" disabled={!newComment.trim() || createMutation.isLoading}>
              {createMutation.isLoading ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}