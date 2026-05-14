import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthFromRequest } from '@open-mercato/shared/lib/auth/server'
import { getOrm } from '@open-mercato/shared/lib/db/mikro'
import { ProjectComment } from '../../data/entities'

const routeMetadata = {
  GET: { requireAuth: true, requireFeatures: ['project_comments.view'] },
  POST: { requireAuth: true, requireFeatures: ['project_comments.manage'] },
}

export const metadata = routeMetadata

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(50),
  projectId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  authorUserId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
})

const createSchema = z.object({
  projectId: z.string().uuid(),
  taskId: z.string().uuid().optional(),
  parentCommentId: z.string().uuid().optional(),
  content: z.string().min(1).max(2000),
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

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()))
  const orm = await getOrm()

  const qb = orm.em.createQueryBuilder(ProjectComment, 'c')
    .select('*')
    .where({
      organizationId: auth.organizationId,
      tenantId: auth.tenantId,
      deletedAt: null,
    })

  if (parsed.projectId) {
    qb.andWhere({ projectId: parsed.projectId })
  }

  if (parsed.taskId) {
    qb.andWhere({ taskId: parsed.taskId })
  }

  if (parsed.authorUserId) {
    qb.andWhere({ authorUserId: parsed.authorUserId })
  }

  if (parsed.sortBy === 'updatedAt') {
    qb.orderBy({ updatedAt: 'DESC' })
  } else {
    qb.orderBy({ createdAt: 'DESC' })
  }

  const total = await qb.getCount()
  const items = await qb.limit(parsed.pageSize).offset((parsed.page - 1) * parsed.pageSize).getResult()

  return NextResponse.json({
    items: items.map(serializeComment),
    total,
    page: parsed.page,
    pageSize: parsed.pageSize,
  })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createSchema.parse(body)
  const orm = await getOrm()

  const comment = new ProjectComment()
  comment.organizationId = auth.organizationId
  comment.tenantId = auth.tenantId
  comment.projectId = parsed.projectId
  comment.taskId = parsed.taskId ?? null
  comment.authorUserId = auth.userId
  comment.parentCommentId = parsed.parentCommentId ?? null
  comment.content = parsed.content

  await orm.em.persistAndFlush(comment)

  return NextResponse.json(serializeComment(comment), { status: 201 })
}