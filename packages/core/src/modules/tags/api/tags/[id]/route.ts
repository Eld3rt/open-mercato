import { getRequestContext } from '@open-mercato/shared/lib/crud/request'
import { buildCrudOpenApiFactory } from '@open-mercato/shared/lib/openapi/crud'
import { Tag } from '../../data/entities'
import { updateTagSchema } from '../../data/validators'

const buildTagsCrudOpenApi = buildCrudOpenApiFactory({
  defaultTag: 'Tags',
})

const getEndpoint = buildTagsCrudOpenApi.endpoint({
  method: 'GET',
  path: '/tags/{id}',
  summary: 'Get tag',
  description: 'Get a specific tag by ID',
  tags: ['Tags'],
})

export const GET = getEndpoint.handler(async (request, { params }) => {
  const ctx = getRequestContext(request)
  const db = ctx.em
  const organizationId = ctx.organizationId
  const tenantId = ctx.tenantId

  const tag = await db.findOne(Tag, {
    id: params.id,
    organizationId,
    tenantId,
    deletedAt: null,
  })

  if (!tag) {
    return new Response(JSON.stringify({ error: 'Tag not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return {
    id: tag.id,
    name: tag.name,
    description: tag.description,
    color: tag.color,
    isActive: tag.isActive,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  }
})

const updateEndpoint = buildTagsCrudOpenApi.endpoint({
  method: 'PUT',
  path: '/tags/{id}',
  summary: 'Update tag',
  description: 'Update a specific tag',
  tags: ['Tags'],
})

export const PUT = updateEndpoint.handler(async (request, { params }) => {
  const ctx = getRequestContext(request)
  const db = ctx.em
  const organizationId = ctx.organizationId
  const tenantId = ctx.tenantId

  const input = updateTagSchema.parse(await request.json())

  const tag = await db.findOne(Tag, {
    id: params.id,
    organizationId,
    tenantId,
    deletedAt: null,
  })

  if (!tag) {
    return new Response(JSON.stringify({ error: 'Tag not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (input.name !== undefined) tag.name = input.name
  if (input.description !== undefined) tag.description = input.description
  if (input.color !== undefined) tag.color = input.color
  if (input.isActive !== undefined) tag.isActive = input.isActive

  await db.flush()

  return {
    id: tag.id,
    name: tag.name,
    description: tag.description,
    color: tag.color,
    isActive: tag.isActive,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  }
})

const deleteEndpoint = buildTagsCrudOpenApi.endpoint({
  method: 'DELETE',
  path: '/tags/{id}',
  summary: 'Delete tag',
  description: 'Soft delete a specific tag',
  tags: ['Tags'],
})

export const DELETE = deleteEndpoint.handler(async (request, { params }) => {
  const ctx = getRequestContext(request)
  const db = ctx.em
  const organizationId = ctx.organizationId
  const tenantId = ctx.tenantId

  const tag = await db.findOne(Tag, {
    id: params.id,
    organizationId,
    tenantId,
    deletedAt: null,
  })

  if (!tag) {
    return new Response(JSON.stringify({ error: 'Tag not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  tag.deletedAt = new Date()
  await db.flush()

  return { ok: true }
})

export const openApi = {
  ...getEndpoint.openapi({
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Tag ID',
      },
    ],
    responses: {
      '200': {
        description: 'Tag details',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                description: { type: 'string' },
                color: { type: 'string' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
              required: ['id', 'name', 'color', 'isActive', 'createdAt', 'updatedAt'],
            },
          },
        },
      },
      '404': {
        description: 'Tag not found',
      },
    },
  }),
  ...updateEndpoint.openapi({
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Tag ID',
      },
    ],
    requestBody: {
      description: 'Tag update data',
      content: {
        'application/json': {
          schema: updateTagSchema,
        },
      },
    },
    responses: {
      '200': {
        description: 'Tag updated',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                description: { type: 'string' },
                color: { type: 'string' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
              required: ['id', 'name', 'color', 'isActive', 'createdAt', 'updatedAt'],
            },
          },
        },
      },
      '404': {
        description: 'Tag not found',
      },
    },
  }),
  ...deleteEndpoint.openapi({
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Tag ID',
      },
    ],
    responses: {
      '200': {
        description: 'Tag deleted',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                ok: { type: 'boolean' },
              },
              required: ['ok'],
            },
          },
        },
      },
      '404': {
        description: 'Tag not found',
      },
    },
  }),
}