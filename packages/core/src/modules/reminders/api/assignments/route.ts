import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { EntityManager } from '@mikro-orm/postgresql'
import type { OpenApiRouteDoc } from '@open-mercato/shared/lib/openapi'
import { CrudHttpError } from '@open-mercato/shared/lib/crud/errors'
import { readJsonSafe } from '@open-mercato/shared/lib/http/readJsonSafe'
import { ReminderAssignment } from '../data/entities'
import { reminderAssignmentSchema } from '../data/validators'

const createAssignmentSchema = z.object({
  reminderId: z.string().uuid(),
  entityType: z.string().min(1).max(100),
  entityId: z.string().uuid(),
})

const deleteAssignmentSchema = z.object({
  reminderId: z.string().uuid(),
  entityType: z.string().min(1).max(100),
  entityId: z.string().uuid(),
})

export const metadata = {
  POST: { requireAuth: true, requireFeatures: ['reminders.manage'] },
  DELETE: { requireAuth: true, requireFeatures: ['reminders.manage'] },
}

export const openApi: OpenApiRouteDoc = {
  tags: ['Reminders'],
  summary: 'Manage reminder assignments',
  description: 'Assign and unassign reminders to/from entities',
  responses: {
    200: {
      description: 'Successful operation',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              assignment: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  reminderId: { type: 'string', format: 'uuid' },
                  entityType: { type: 'string' },
                  entityId: { type: 'string', format: 'uuid' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    400: { description: 'Bad request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    500: { description: 'Internal server error' },
  },
}

export async function POST(request: NextRequest) {
  try {
    const em = request.em as EntityManager
    const auth = request.auth
    const organizationId = auth.organizationId
    const tenantId = auth.tenantId

    const body = await readJsonSafe(request)
    const data = createAssignmentSchema.parse(body)

    // Check if reminder exists and belongs to the organization/tenant
    const reminder = await em.findOne(ReminderAssignment, {
      reminderId: data.reminderId,
      organizationId,
      tenantId,
    })

    if (!reminder) {
      // Verify the reminder exists
      const reminderExists = await em.findOne('reminders', {
        id: data.reminderId,
        organizationId,
        tenantId,
        deletedAt: null,
      })

      if (!reminderExists) {
        throw new CrudHttpError(404, 'Reminder not found')
      }
    }

    // Check if assignment already exists
    const existingAssignment = await em.findOne(ReminderAssignment, {
      reminderId: data.reminderId,
      entityType: data.entityType,
      entityId: data.entityId,
      organizationId,
      tenantId,
    })

    if (existingAssignment) {
      throw new CrudHttpError(400, 'Assignment already exists')
    }

    // Create new assignment
    const assignment = em.create(ReminderAssignment, {
      reminderId: data.reminderId,
      entityType: data.entityType,
      entityId: data.entityId,
      organizationId,
      tenantId,
    })

    await em.persistAndFlush(assignment)

    return NextResponse.json({
      success: true,
      assignment: {
        id: assignment.id,
        reminderId: assignment.reminderId,
        entityType: assignment.entityType,
        entityId: assignment.entityId,
        createdAt: assignment.createdAt.toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof CrudHttpError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('Error creating reminder assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const em = request.em as EntityManager
    const auth = request.auth
    const organizationId = auth.organizationId
    const tenantId = auth.tenantId

    const body = await readJsonSafe(request)
    const data = deleteAssignmentSchema.parse(body)

    // Find and delete the assignment
    const assignment = await em.findOne(ReminderAssignment, {
      reminderId: data.reminderId,
      entityType: data.entityType,
      entityId: data.entityId,
      organizationId,
      tenantId,
    })

    if (!assignment) {
      throw new CrudHttpError(404, 'Assignment not found')
    }

    await em.removeAndFlush(assignment)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    if (error instanceof CrudHttpError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('Error deleting reminder assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}