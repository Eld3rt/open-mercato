import { NextRequest, NextResponse } from 'next/server'
import { getOrm } from '@/core/orm'
import { Project } from '../../data/entities'
import { withAuth } from '@/core/utils/auth'

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
  const data = await request.json()

  const project = await orm.em.findOne(Project, {
    id: projectId,
    organizationId: user.organizationId,
    tenantId: user.tenantId,
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Update project fields
  if (data.name) project.name = data.name
  if (data.description !== undefined) project.description = data.description
  if (data.status) project.status = data.status
  if (data.priority) project.priority = data.priority
  if (data.startDate) project.startDate = new Date(data.startDate)
  if (data.dueDate) project.dueDate = new Date(data.dueDate)
  if (data.progressPercentage !== undefined) project.progressPercentage = data.progressPercentage

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