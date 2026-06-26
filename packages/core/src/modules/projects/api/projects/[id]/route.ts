import { NextRequest, NextResponse } from 'next/server'
import { getOrm } from '@/core/orm'
import { Project } from '../../data/entities'
import { withAuth } from '@/core/utils/auth'
import { updateProjectSchema } from '../../data/validators'

export const GET = withAuth(async (request: NextRequest, { user, params }) => {
  const orm = await getOrm()
  const projectId = params.id as string

  const project = await orm.em.findOne(Project, {
    id: projectId,
    organizationId: user.organizationId,
    tenantId: user.tenantId,
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json(project)
})

export const PUT = withAuth(async (request: NextRequest, { user, params }) => {
  const orm = await getOrm()
  const projectId = params.id as string

  const project = await orm.em.findOne(Project, {
    id: projectId,
    organizationId: user.organizationId,
    tenantId: user.tenantId,
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  let data: Record<string, unknown>
  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsedResult = updateProjectSchema.safeParse(data)

  if (!parsedResult.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsedResult.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const parsed = parsedResult.data

  if (parsed.name !== undefined) project.name = parsed.name
  if (parsed.description !== undefined) project.description = parsed.description
  if (parsed.status !== undefined) project.status = parsed.status
  if (parsed.priority !== undefined) project.priority = parsed.priority
  if (parsed.startDate !== undefined) project.startDate = new Date(parsed.startDate)
  if (parsed.dueDate !== undefined) project.dueDate = new Date(parsed.dueDate)
  if (parsed.progressPercentage !== undefined) project.progressPercentage = parsed.progressPercentage

  await orm.em.persistAndFlush(project)

  return NextResponse.json(project)
})

export const DELETE = withAuth(async (request: NextRequest, { user, params }) => {
  const orm = await getOrm()
  const projectId = params.id as string

  const project = await orm.em.findOne(Project, {
    id: projectId,
    organizationId: user.organizationId,
    tenantId: user.tenantId,
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  project.deletedAt = new Date()
  await orm.em.persistAndFlush(project)

  return NextResponse.json({ success: true })
})
