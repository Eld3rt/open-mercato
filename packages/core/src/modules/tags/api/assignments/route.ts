import { getRequestContext } from '@open-mercato/shared/lib/crud/request'
import { buildCrudOpenApiFactory } from '@open-mercato/shared/lib/openapi/crud'
import { TagAssignment } from '../../data/entities'
import { assignTagsSchema, unassignTagsSchema, getEntityTagsSchema } from '../../data/validators'

const buildTagsCrudOpenApi = buildCrudOpenApiFactory({
  defaultTag: 'Tags',
})

const assignEndpoint = buildTagsCrudOpenApi.endpoint({
  method: 'POST',
  path: '/tags/assign',
  summary: 'Assign tags to entity',
  description: 'Assign multiple tags to a specific entity',
  tags: ['Tags'],
})

export const POST = assignEndpoint.handler(async (request) => {
  const ctx = getRequestContext(request)
  const db = ctx.em
  const organizationId = ctx.organizationId
  const tenantId = ctx.tenantId

  const input = assignTagsSchema.parse(await request.json())

  // Check if tags exist and belong to the organization
  const existingTags = await db.find('Tag', {
    id: { $in: input.tagIds },
    organizationId,
    tenantId,
    deletedAt: null,
    isActive: true,
  })

  if (existingTags.length !== input.tagIds.length) {
    const foundIds = new Set(existingTags.map(t => t.id))
    const missingIds = input.tagIds.filter(id => !foundIds.has(id))
    return new Response(JSON.stringify({
      error: 'Some tags not found or inactive',
      missingTagIds: missingIds
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Remove existing assignments to avoid duplicates
  await db.nativeDelete(TagAssignment, {
    organizationId,
    tenantId,
    entityType: input.entityType,
    entityId: input.entityId,
    tagId: { $in: input.tagIds },
  })

  // Create new assignments
  const assignments = input.tagIds.map(tagId => {
    const assignment = new TagAssignment()
    assignment.organizationId = organizationId
    assignment.tenantId = tenantId
    assignment.tagId = tagId
    assignment.entityType = input.entityType
    assignment.entityId = input.entityId
    return assignment
  })

  await db.persistAndFlush(assignments)

  return {
    ok: true,
    assigned: assignments.length,
  }
})

const unassignEndpoint = buildTagsCrudOpenApi.endpoint({
  method: 'POST',
  path: '/tags/unassign',
  summary: 'Unassign tags from entity',
  description: 'Remove multiple tags from a specific entity',
  tags: ['Tags'],
})

export const unassignTags = unassignEndpoint.handler(async (request) => {
  const ctx = getRequestContext(request)
  const db = ctx.em
  const organizationId = ctx.organizationId
  const tenantId = ctx.tenantId

  const input = unassignTagsSchema.parse(await request.json())

  const result = await db.nativeDelete(TagAssignment, {
    organizationId,
    tenantId,
    entityType: input.entityType,
    entityId: input.entityId,
    tagId: { $in: input.tagIds },
  })

  return {
    ok: true,
    unassigned: result,
  }
})

const getEntityTagsEndpoint = buildTagsCrudOpenApi.endpoint({
  method: 'GET',
  path: '/tags/entity/{entityType}/{entityId}',
  summary: 'Get entity tags',
  description: 'Get all tags assigned to a specific entity',
  tags: ['Tags'],
})

export const getEntityTags = getEntityTagsEndpoint.handler(async (request, { params }) => {
  const ctx = getRequestContext(request)
  const db = ctx.em
  const organizationId = ctx.organizationId
  const tenantId = ctx.tenantId

  const input = getEntityTagsSchema.parse({
    entityType: params.entityType,
    entityId: params.entityId,
  })

  const assignments = await db.find(TagAssignment, {
    organizationId,
    tenantId,
    entityType: input.entityType,
    entityId: input.entityId,
  }, {
    populate: ['tag'],
  })

  const tags = assignments
    .filter(assignment => assignment.tag && !assignment.tag.deletedAt)
    .map(assignment => ({
      id: assignment.tag!.id,
      name: assignment.tag!.name,
      description: assignment.tag!.description,
      color: assignment.tag!.color,
      isActive: assignment.tag!.isActive,
      assignedAt: assignment.createdAt.toISOString(),
    }))

  return {
    entityType: input.entityType,
    entityId: input.entityId,
    tags,
  }
})

export const openApi = {
  ...assignEndpoint.openapi({
    requestBody: {
      description: 'Tag assignment data',
      content: {
        'application/json': {
          schema: assignTagsSchema,
        },
      },
    },
    responses: {
      '200': {
        description: 'Tags assigned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                ok: { type: 'boolean' },
                assigned: { type: 'number' },
              },
              required: ['ok', 'assigned'],
            },
          },
        },
      },
      '400': {
        description: 'Some tags not found or inactive',
      },
    },
  }),
  ...unassignEndpoint.openapi({
    requestBody: {
      description: 'Tag unassignment data',
      content: {
        'application/json': {
          schema: unassignTagsSchema,
        },
      },
    },
    responses: {
      '200': {
        description: 'Tags unassigned successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                ok: { type: 'boolean' },
                unassigned: { type: 'number' },
              },
              required: ['ok', 'unassigned'],
            },
          },
        },
      },
    },
  }),
  ...getEntityTagsEndpoint.openapi({
    parameters: [
      {
        name: 'entityType',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'Entity type (e.g., "customer", "product")',
      },
      {
        name: 'entityId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Entity ID',
      },
    ],
    responses: {
      '200': {
        description: 'Entity tags',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                entityType: { type: 'string' },
                entityId: { type: 'string', format: 'uuid' },
                tags: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      name: { type: 'string' },
                      description: { type: 'string' },
                      color: { type: 'string' },
                      isActive: { type: 'boolean' },
                      assignedAt: { type: 'string', format: 'date-time' },
                    },
                    required: ['id', 'name', 'color', 'isActive', 'assignedAt'],
                  },
                },
              },
              required: ['entityType', 'entityId', 'tags'],
            },
          },
        },
      },
    },
  }),
}