import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthFromRequest } from '@open-mercato/shared/lib/auth/server'
import { getOrm } from '@open-mercato/shared/lib/db/mikro'
import { ProjectTask } from '../../../data/entities'

const routeMetadata = {
  GET: { requireAuth: true, requireFeatures: ['project_tasks.view'] },
  PUT: { requireAuth: true, requireFeatures: ['project_tasks.manage'] },
  DELETE: { requireAuth: true, requireFeatures: ['project_tasks.manage'] },
}

export const metadata = routeMetadata

const updateSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['todo', 'in-progress', 'blocked', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  assignedToUserId: z.string().uuid().nullable().optional(),
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orm = await getOrm()
  const task = await orm.em.findOne(ProjectTask, {
    id: params.id,
    organizationId: auth.organizationId,
    tenantId: auth.tenantId,
    deletedAt: null,
  })

  if (!task) {
    return NextResponse.json({ error: 'Project task not found' }, { status: 404 })
  }

  return NextResponse.json(serializeTask(task))
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = updateSchema.parse(body)
  const orm = await getOrm()

  const task = await orm.em.findOne(ProjectTask, {
    id: params.id,
    organizationId: auth.organizationId,
    tenantId: auth.tenantId,
    deletedAt: null,
  })

  if (!task) {
    return NextResponse.json({ error: 'Project task not found' }, { status: 404 })
  }

  if (parsed.title) task.title = parsed.title
  if (parsed.description !== undefined) task.description = parsed.description
  if (parsed.status) {
    task.status = parsed.status
    if (parsed.status === 'done') {
      task.completedAt = task.completedAt ?? new Date()
    }
  }
  if (parsed.priority) task.priority = parsed.priority
  if (parsed.dueDate !== undefined) {
    task.dueDate = parsed.dueDate ? new Date(parsed.dueDate) : null
  }
  if (parsed.assignedToUserId !== undefined) {
    task.assignedToUserId = parsed.assignedToUserId ?? null
  }

  await orm.em.persistAndFlush(task)

  return NextResponse.json(serializeTask(task))
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orm = await getOrm()
  const task = await orm.em.findOne(ProjectTask, {
    id: params.id,
    organizationId: auth.organizationId,
    tenantId: auth.tenantId,
    deletedAt: null,
  })

  if (!task) {
    return NextResponse.json({ error: 'Project task not found' }, { status: 404 })
  }

  task.deletedAt = new Date()
  await orm.em.persistAndFlush(task)

  return NextResponse.json({ ok: true })
}
