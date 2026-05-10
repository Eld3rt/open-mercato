import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { EntityManager } from '@mikro-orm/postgresql'
import type { OpenApiRouteDoc } from '@open-mercato/shared/lib/openapi'
import { CrudHttpError } from '@open-mercato/shared/lib/crud/errors'
import { Reminder, ReminderAssignment } from '../../data/entities'

const paramsSchema = z.object({
  id: z.string().uuid(),
})

const querySchema = z.object({
  includeAssignments: z.string().optional(),
})

export const metadata = {
  GET: { requireAuth: true, requireFeatures: ['reminders.view'] },
}

export const openApi: OpenApiRouteDoc = {
  tags: ['Reminders'],
  summary: 'Get reminder by ID',
  description: 'Retrieve a specific reminder with optional assignment information',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Reminder ID',
    },
    {
      name: 'includeAssignments',
      in: 'query',
      schema: { type: 'boolean' },
      description: 'Include assignment information in response',
    },
  ],
  responses: {
    200: {
      description: 'Successful operation',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              description: { type: 'string' },
              dueAt: { type: 'string', format: 'date-time' },
              priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
              status: { type: 'string', enum: ['pending', 'completed', 'cancelled'] },
              assignedToUserId: { type: 'string', format: 'uuid' },
              createdByUserId: { type: 'string', format: 'uuid' },
              completedAt: { type: 'string', format: 'date-time' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              assignments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
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
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    500: { description: 'Internal server error' },
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const em = request.em as EntityManager
    const auth = request.auth
    const organizationId = auth.organizationId
    const tenantId = auth.tenantId

    const { id } = paramsSchema.parse(params)
    const url = new URL(request.url)
    const includeAssignments = url.searchParams.get('includeAssignments') === 'true'

    // Find the reminder
    const reminder = await em.findOne(Reminder, {
      id,
      organizationId,
      tenantId,
      deletedAt: null,
    })

    if (!reminder) {
      throw new CrudHttpError(404, 'Reminder not found')
    }

    let assignments: ReminderAssignment[] = []
    if (includeAssignments) {
      assignments = await em.find(ReminderAssignment, {
        reminderId: id,
        organizationId,
        tenantId,
      })
    }

    return NextResponse.json({
      ...reminder,
      assignments: assignments.map(assignment => ({
        id: assignment.id,
        entityType: assignment.entityType,
        entityId: assignment.entityId,
        createdAt: assignment.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    if (error instanceof CrudHttpError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('Error fetching reminder:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}