import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthFromRequest } from '@open-mercato/shared/lib/auth/server'
import { getOrm } from '@open-mercato/shared/lib/db/mikro'
import { ProjectComment } from '../../../data/entities'

const routeMetadata = {
  GET: { requireAuth: true, requireFeatures: ['project_comments.view'] },
  PUT: { requireAuth: true, requireFeatures: ['project_comments.manage'] },
  DELETE: { requireAuth: true, requireFeatures: ['project_comments.manage'] },
}

export const metadata = routeMetadata

const updateSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
})

function serializeComment(comment: ProjectComment) {
  return {
    id: comment.id,
    organizationId: comment.organizationId,
    tenantId: comment.tenantId,
    projectId: comment.projectId,
    taskId: comment.taskId,
    authorUserId: comment.authorUserId,
    parentCommentId: comment.parentCommentId,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orm = await getOrm()
  const comment = await orm.em.findOne(ProjectComment, {
    id: params.id,
    organizationId: auth.organizationId,
    tenantId: auth.tenantId,
    deletedAt: null,
  })

  if (!comment) {
    return NextResponse.json({ error: 'Project comment not found' }, { status: 404 })
  }

  return NextResponse.json(serializeComment(comment))
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = updateSchema.parse(body)
  const orm = await getOrm()

  const comment = await orm.em.findOne(ProjectComment, {
    id: params.id,
    organizationId: auth.organizationId,
    tenantId: auth.tenantId,
    deletedAt: null,
  })

  if (!comment) {
    return NextResponse.json({ error: 'Project comment not found' }, { status: 404 })
  }

  // Only allow author to edit their own comments
  if (comment.authorUserId !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (parsed.content) comment.content = parsed.content

  await orm.em.persistAndFlush(comment)

  return NextResponse.json(serializeComment(comment))
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orm = await getOrm()
  const comment = await orm.em.findOne(ProjectComment, {
    id: params.id,
    organizationId: auth.organizationId,
    tenantId: auth.tenantId,
    deletedAt: null,
  })

  if (!comment) {
    return NextResponse.json({ error: 'Project comment not found' }, { status: 404 })
  }

  // Only allow author to delete their own comments
  if (comment.authorUserId !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  comment.deletedAt = new Date()
  await orm.em.persistAndFlush(comment)

  return NextResponse.json({ ok: true })
}