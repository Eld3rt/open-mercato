import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthFromRequest } from '@open-mercato/shared/lib/auth/server'
import { getOrm } from '@open-mercato/shared/lib/db/mikro'
import { ProjectTimeEntry } from '../../data/entities'
import { createTimeEntrySchema, updateTimeEntrySchema, queryTimeEntriesSchema } from '../../data/validators'

const routeMetadata = {
  GET: { requireAuth: true, requireFeatures: ['project_time_tracking.view'] },
  POST: { requireAuth: true, requireFeatures: ['project_time_tracking.manage'] },
  PUT: { requireAuth: true, requireFeatures: ['project_time_tracking.manage'] },
  DELETE: { requireAuth: true, requireFeatures: ['project_time_tracking.manage'] },
}

export const metadata = routeMetadata

function calculateDurationMinutes(startedAt: Date, endedAt: Date) {
  return Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))
}

function serializeEntry(entry: ProjectTimeEntry) {
  return {
    id: entry.id,
    organizationId: entry.organizationId,
    tenantId: entry.tenantId,
    projectId: entry.projectId,
    taskId: entry.taskId,
    userId: entry.userId,
    description: entry.description ?? null,
    startedAt: entry.startedAt.toISOString(),
    endedAt: entry.endedAt?.toISOString() ?? null,
    durationMinutes: entry.durationMinutes ?? null,
    status: entry.status,
    billable: entry.billable,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = queryTimeEntriesSchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()))
  const orm = await getOrm()

  const qb = orm.em.createQueryBuilder(ProjectTimeEntry, 't').select('*').where({
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

  if (parsed.userId) {
    qb.andWhere({ userId: parsed.userId })
  }

  if (parsed.status) {
    qb.andWhere({ status: parsed.status })
  }

  if (parsed.dateFrom) {
    qb.andWhere({ startedAt: { $gte: new Date(parsed.dateFrom) } })
  }

  if (parsed.dateTo) {
    qb.andWhere({ startedAt: { $lte: new Date(parsed.dateTo) } })
  }

  if (parsed.sortBy === 'endedAt') {
    qb.orderBy({ endedAt: 'DESC', startedAt: 'DESC' })
  } else if (parsed.sortBy === 'createdAt') {
    qb.orderBy({ createdAt: 'DESC' })
  } else {
    qb.orderBy({ startedAt: 'DESC' })
  }

  const total = await qb.getCount()
  const items = await qb
    .limit(parsed.pageSize)
    .offset((parsed.page - 1) * parsed.pageSize)
    .getResult()

  return NextResponse.json({
    items: items.map(serializeEntry),
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
  const parsed = createTimeEntrySchema.parse(body)
  const orm = await getOrm()

  const startedAt = parsed.startedAt ? new Date(parsed.startedAt) : new Date()
  const endedAt = parsed.endedAt ? new Date(parsed.endedAt) : null

  if (endedAt && endedAt < startedAt) {
    return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
  }

  const entry = new ProjectTimeEntry()
  entry.organizationId = auth.organizationId
  entry.tenantId = auth.tenantId
  entry.projectId = parsed.projectId
  entry.taskId = parsed.taskId ?? null
  entry.userId = auth.userId
  entry.description = parsed.description ?? null
  entry.startedAt = startedAt
  entry.endedAt = endedAt
  entry.status = endedAt ? 'stopped' : 'running'
  entry.durationMinutes = endedAt ? calculateDurationMinutes(startedAt, endedAt) : null
  entry.billable = parsed.billable

  await orm.em.persistAndFlush(entry)

  return NextResponse.json(serializeEntry(entry), { status: 201 })
}

export async function PUT(request: NextRequest) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = updateTimeEntrySchema.parse(body)
  const orm = await getOrm()

  const entry = await orm.em.findOne(ProjectTimeEntry, {
    id: parsed.id,
    organizationId: auth.organizationId,
    tenantId: auth.tenantId,
    deletedAt: null,
  })

  if (!entry) {
    return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
  }

  if (parsed.projectId) {
    entry.projectId = parsed.projectId
  }
  if (parsed.taskId !== undefined) {
    entry.taskId = parsed.taskId ?? null
  }
  if (parsed.description !== undefined) {
    entry.description = parsed.description ?? null
  }
  if (parsed.billable !== undefined) {
    entry.billable = parsed.billable
  }
  if (parsed.startedAt) {
    entry.startedAt = new Date(parsed.startedAt)
  }
  if (parsed.endedAt !== undefined) {
    entry.endedAt = parsed.endedAt ? new Date(parsed.endedAt) : null
  }
  if (parsed.status) {
    if (parsed.status === 'running') {
      entry.endedAt = null
    } else if (parsed.status === 'stopped' && !entry.endedAt) {
      entry.endedAt = new Date()
    }
    entry.status = parsed.status
  }

  if (entry.endedAt && entry.endedAt < entry.startedAt) {
    return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
  }

  if (entry.endedAt) {
    entry.durationMinutes = calculateDurationMinutes(entry.startedAt, entry.endedAt)
  } else {
    entry.durationMinutes = null
  }

  await orm.em.flush()

  return NextResponse.json(serializeEntry(entry))
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Time entry id is required' }, { status: 400 })
  }

  const orm = await getOrm()
  const entry = await orm.em.findOne(ProjectTimeEntry, {
    id,
    organizationId: auth.organizationId,
    tenantId: auth.tenantId,
    deletedAt: null,
  })

  if (!entry) {
    return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
  }

  entry.deletedAt = new Date()
  await orm.em.flush()

  return NextResponse.json({ ok: true })
}
