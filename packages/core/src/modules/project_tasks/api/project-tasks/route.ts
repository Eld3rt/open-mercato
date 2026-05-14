import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthFromRequest } from '@open-mercato/shared/lib/auth/server'
import { getOrm } from '@open-mercato/shared/lib/db/mikro'
import { ProjectTask } from '../../data/entities'

const routeMetadata = {
  GET: { requireAuth: true, requireFeatures: ['project_tasks.view'] },
  POST: { requireAuth: true, requireFeatures: ['project_tasks.manage'] },
}

export const metadata = routeMetadata

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'blocked', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  projectId: z.string().uuid().optional(),
  assignedToUserId: z.string().uuid().optional(),
  sortBy: z.enum(['dueDate', 'createdAt']).default('dueDate'),
})

const createSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(150),
  description: z.string().max(1000).optional(),
  status: z.enum(['todo', 'in-progress', 'blocked', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().datetime().optional(),
  assignedToUserId: z.string().uuid().optional(),
})

function serializeTask(task: ProjectTask) {
  return {
    id: task.id,
    organizationId: task.organizationId,
    tenantId: task.tenantId,
    projectId: task.projectId,
    createdByUserId: task.createdByUserId,
    assignedToUserId: task.assignedToUserId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString() ?? null,
    completedAt: task.completedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()))
  const orm = await getOrm()

  const qb = orm.em.createQueryBuilder(ProjectTask, 't')
    .select('*')
    .where({
      organizationId: auth.organizationId,
      tenantId: auth.tenantId,
      deletedAt: null,
    })

  if (parsed.search) {
    qb.andWhere({
      $or: [
        { title: { $ilike: `%${parsed.search}%` } },
        { description: { $ilike: `%${parsed.search}%` } },
      ],
    })
  }

  if (parsed.status) {
    qb.andWhere({ status: parsed.status })
  }

  if (parsed.priority) {
    qb.andWhere({ priority: parsed.priority })
  }

  if (parsed.projectId) {
    qb.andWhere({ projectId: parsed.projectId })
  }

  if (parsed.assignedToUserId) {
    qb.andWhere({ assignedToUserId: parsed.assignedToUserId })
  }

  if (parsed.sortBy === 'createdAt') {
    qb.orderBy({ createdAt: 'DESC' })
  } else {
    qb.orderBy({ dueDate: 'ASC', createdAt: 'DESC' })
  }

  const total = await qb.getCount()
  const items = await qb.limit(parsed.pageSize).offset((parsed.page - 1) * parsed.pageSize).getResult()

  return NextResponse.json({
    items: items.map(serializeTask),
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

  const task = new ProjectTask()
  task.organizationId = auth.organizationId
  task.tenantId = auth.tenantId
  task.projectId = parsed.projectId
  task.createdByUserId = auth.userId
  task.assignedToUserId = parsed.assignedToUserId ?? null
  task.title = parsed.title
  task.description = parsed.description ?? null
  task.status = parsed.status
  task.priority = parsed.priority
  task.dueDate = parsed.dueDate ? new Date(parsed.dueDate) : null
  task.completedAt = parsed.status === 'done' ? new Date() : null

  await orm.em.persistAndFlush(task)

  return NextResponse.json(serializeTask(task), { status: 201 })
}
