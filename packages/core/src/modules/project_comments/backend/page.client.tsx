'use client'

import { useQuery } from '@tanstack/react-query'
import { DataTable } from '@open-mercato/ui/backend/data-table'
import { useT } from '@open-mercato/shared/lib/i18n/context'

interface Comment {
  id: string
  projectId: string
  taskId: string | null
  authorUserId: string
  content: string
  createdAt: string
}

async function fetchAllComments(): Promise<Comment[]> {
  const response = await fetch('/api/project-comments?pageSize=100')
  if (!response.ok) {
    throw new Error('Failed to load comments')
  }
  const data = await response.json()
  return data.items ?? []
}

export default function ProjectCommentsBackendPage() {
  const t = useT('projectComments')

  const { data: comments, isLoading } = useQuery({
    queryKey: ['projectComments', 'all'],
    queryFn: fetchAllComments,
  })

  const columns = [
    {
      key: 'content',
      header: 'Content',
      render: (comment: Comment) => (
        <div className="max-w-md truncate" title={comment.content}>
          {comment.content}
        </div>
      ),
    },
    {
      key: 'author',
      header: 'Author',
      render: (comment: Comment) => comment.authorUserId,
    },
    {
      key: 'project',
      header: 'Project',
      render: (comment: Comment) => comment.projectId,
    },
    {
      key: 'task',
      header: 'Task',
      render: (comment: Comment) => comment.taskId || '—',
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (comment: Comment) => new Date(comment.createdAt).toLocaleString(),
    },
  ]

  if (isLoading) {
    return <div className="text-center py-4">{t('dashboard.loading')}</div>
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Project Comments Management</h1>
      <DataTable
        data={comments || []}
        columns={columns}
        searchable
        filterable
      />
    </div>
  )
}