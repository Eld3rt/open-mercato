import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { EntityManager } from '@mikro-orm/postgresql'
import type { OpenApiRouteDoc } from '@open-mercato/shared/lib/openapi'
import { CrudHttpError } from '@open-mercato/shared/lib/crud/errors'
import { parseBooleanToken } from '@open-mercato/shared/lib/boolean'
import { readJsonSafe } from '@open-mercato/shared/lib/http/readJsonSafe'
import { makeCrudRoute } from '@open-mercato/shared/lib/crud/route'
import { Reminder, ReminderAssignment } from '../data/entities'
import {
  reminderCreateSchema,
  reminderUpdateSchema,
  reminderQuerySchema,
  type ReminderCreateInput,
  type ReminderUpdateInput,
  type ReminderQueryInput,
} from '../data/validators'

const querySchema = reminderQuerySchema.extend({
  includeAssignments: z.string().optional(),
})

export const metadata = {
  GET: { requireAuth: true, requireFeatures: ['reminders.view'] },
  POST: { requireAuth: true, requireFeatures: ['reminders.manage'] },
  PUT: { requireAuth: true, requireFeatures: ['reminders.manage'] },
  DELETE: { requireAuth: true, requireFeatures: ['reminders.manage'] },
}

export const openApi: OpenApiRouteDoc = {
  tags: ['Reminders'],
  summary: 'Manage reminders',
  description: 'CRUD operations for reminders with assignment support',
  parameters: [
    {
      name: 'page',
      in: 'query',
      schema: { type: 'integer', minimum: 1, default: 1 },
      description: 'Page number for pagination',
    },
    {
      name: 'pageSize',
      in: 'query',
      schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
      description: 'Number of items per page',
    },
    {
      name: 'search',
      in: 'query',
      schema: { type: 'string' },
      description: 'Search query for filtering reminders by title or description',
    },
    {
      name: 'status',
      in: 'query',
      schema: { type: 'string', enum: ['pending', 'completed', 'cancelled'] },
      description: 'Filter by reminder status',
    },
    {
      name: 'priority',
      in: 'query',
      schema: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
      description: 'Filter by reminder priority',
    },
    {
      name: 'assignedToUserId',
      in: 'query',
      schema: { type: 'string', format: 'uuid' },
      description: 'Filter by assigned user',
    },
    {
      name: 'entityType',
      in: 'query',
      schema: { type: 'string' },
      description: 'Filter by entity type',
    },
    {
      name: 'entityId',
      in: 'query',
      schema: { type: 'string', format: 'uuid' },
      description: 'Filter by entity ID',
    },
    {
      name: 'dueBefore',
      in: 'query',
      schema: { type: 'string', format: 'date-time' },
      description: 'Filter reminders due before this date',
    },
    {
      name: 'dueAfter',
      in: 'query',
      schema: { type: 'string', format: 'date-time' },
      description: 'Filter reminders due after this date',
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
              items: {
                type: 'array',
                items: {
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
              total: { type: 'integer' },
              page: { type: 'integer' },
              pageSize: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
    },
    400: { description: 'Bad request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    500: { description: 'Internal server error' },
  },
}

async function getReminders(
  em: EntityManager,
  query: ReminderQueryInput & { includeAssignments?: boolean },
  organizationId: string,
  tenantId: string
) {
  const qb = em.createQueryBuilder(Reminder, 'r')
    .select('*')
    .where({
      organizationId,
      tenantId,
      deletedAt: null,
    })

  // Apply filters
  if (query.search) {
    qb.andWhere({
      $or: [
        { title: { $ilike: `%${query.search}%` } },
        { description: { $ilike: `%${query.search}%` } },
      ],
    })
  }

  if (query.status) {
    qb.andWhere({ status: query.status })
  }

  if (query.priority) {
    qb.andWhere({ priority: query.priority })
  }

  if (query.assignedToUserId) {
    qb.andWhere({ assignedToUserId: query.assignedToUserId })
  }

  if (query.dueBefore) {
    qb.andWhere({ dueAt: { $lte: new Date(query.dueBefore) } })
  }

  if (query.dueAfter) {
    qb.andWhere({ dueAt: { $gte: new Date(query.dueAfter) } })
  }

  // Handle entity-based filtering
  if (query.entityType && query.entityId) {
    const assignmentQb = em.createQueryBuilder(ReminderAssignment, 'ra')
      .select('ra.reminderId')
      .where({
        organizationId,
        tenantId,
        entityType: query.entityType,
        entityId: query.entityId,
      })

    qb.andWhere({ id: { $in: assignmentQb.getKnexQuery() } })
  }

  // Apply pagination
  const total = await qb.getCount()
  const items = await qb
    .orderBy({ dueAt: 'ASC', createdAt: 'DESC' })
    .limit(query.pageSize)
    .offset((query.page - 1) * query.pageSize)
    .getResult()

  // Load assignments if requested
  let remindersWithAssignments = items
  if (query.includeAssignments) {
    const reminderIds = items.map(r => r.id)
    if (reminderIds.length > 0) {
      const assignments = await em.find(ReminderAssignment, {
        reminderId: { $in: reminderIds },
        organizationId,
        tenantId,
      })

      // Group assignments by reminder ID
      const assignmentsByReminder = new Map<string, ReminderAssignment[]>()
      assignments.forEach(assignment => {
        const list = assignmentsByReminder.get(assignment.reminderId) || []
        list.push(assignment)
        assignmentsByReminder.set(assignment.reminderId, list)
      })

      remindersWithAssignments = items.map(reminder => ({
        ...reminder,
        assignments: assignmentsByReminder.get(reminder.id) || [],
      }))
    }
  }

  return {
    items: remindersWithAssignments,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(total / query.pageSize),
  }
}

async function createReminder(
  em: EntityManager,
  data: ReminderCreateInput,
  organizationId: string,
  tenantId: string,
  userId: string
) {
  const reminder = em.create(Reminder, {
    ...data,
    organizationId,
    tenantId,
    createdByUserId: userId,
    dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
  })

  await em.persistAndFlush(reminder)

  // Create assignments if provided
  if (data.entityAssignments && data.entityAssignments.length > 0) {
    const assignments = data.entityAssignments.map(assignment =>
      em.create(ReminderAssignment, {
        reminderId: reminder.id,
        entityType: assignment.entityType,
        entityId: assignment.entityId,
        organizationId,
        tenantId,
      })
    )
    await em.persistAndFlush(assignments)
  }

  return reminder
}

async function updateReminder(
  em: EntityManager,
  id: string,
  data: ReminderUpdateInput,
  organizationId: string,
  tenantId: string
) {
  const reminder = await em.findOneOrFail(Reminder, {
    id,
    organizationId,
    tenantId,
    deletedAt: null,
  })

  // Handle status change to completed
  if (data.status === 'completed' && reminder.status !== 'completed') {
    data.completedAt = new Date()
  } else if (data.status !== 'completed') {
    data.completedAt = undefined
  }

  em.assign(reminder, data)
  await em.flush()

  return reminder
}

async function deleteReminder(
  em: EntityManager,
  id: string,
  organizationId: string,
  tenantId: string
) {
  const reminder = await em.findOneOrFail(Reminder, {
    id,
    organizationId,
    tenantId,
    deletedAt: null,
  })

  reminder.deletedAt = new Date()
  await em.flush()

  return reminder
}

export const { GET, POST, PUT, DELETE } = makeCrudRoute({
  entityType: 'reminder',
  querySchema,
  createSchema: reminderCreateSchema,
  updateSchema: reminderUpdateSchema,
  getList: getReminders,
  create: createReminder,
  update: updateReminder,
  delete: deleteReminder,
})