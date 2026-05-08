import { getRequestContext } from '@open-mercato/shared/lib/crud/request'
import { buildCrudOpenApiFactory } from '@open-mercato/shared/lib/openapi/crud'
import { Tag } from '../data/entities'
import { createTagSchema, updateTagSchema, listTagsSchema } from '../data/validators'

const buildTagsCrudOpenApi = buildCrudOpenApiFactory({
  defaultTag: 'Tags',
})

const listEndpoint = buildTagsCrudOpenApi.endpoint({
  method: 'GET',
  path: '/tags',
  summary: 'List tags',
  description: 'Get a paginated list of tags for the current organization',
  tags: ['Tags'],
})

export const GET = listEndpoint.handler(async (request) => {
  const ctx = getRequestContext(request)
  const db = ctx.em
  const userId = ctx.userId
  const organizationId = ctx.organizationId
  const tenantId = ctx.tenantId

  const url = new URL(request.url)
  const input = listTagsSchema.parse({
    search: url.searchParams.get('search') || undefined,
    color: url.searchParams.get('color') || undefined,
    isActive: url.searchParams.get('isActive') ? url.searchParams.get('isActive') === 'true' : undefined,
    page: url.searchParams.get('page') || undefined,
    pageSize: url.searchParams.get('pageSize') || undefined,
  })

  const qb = db.createQueryBuilder(Tag)
    .where({
      organizationId,
      tenantId,
      deletedAt: null,
    })

  if (input.search) {
    qb.andWhere({
      name: { $ilike: `%${input.search}%` },
    })
  }

  if (input.color) {
    qb.andWhere({ color: input.color })
  }

  if (input.isActive !== undefined) {
    qb.andWhere({ isActive: input.isActive })
  }

  const total = await qb.getCount()
  const tags = await qb
    .orderBy({ createdAt: 'DESC' })
    .limit(input.pageSize)
    .offset((input.page - 1) * input.pageSize)
    .getResult()

  return {
    items: tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      description: tag.description,
      color: tag.color,
      isActive: tag.isActive,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    })),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.ceil(total / input.pageSize),
    },
  }
})

const createEndpoint = buildTagsCrudOpenApi.endpoint({
  method: 'POST',
  path: '/tags',
  summary: 'Create tag',
  description: 'Create a new tag',
  tags: ['Tags'],
})

export const POST = createEndpoint.handler(async (request) => {
  const ctx = getRequestContext(request)
  const db = ctx.em
  const organizationId = ctx.organizationId
  const tenantId = ctx.tenantId

  const input = createTagSchema.parse(await request.json())

  const tag = new Tag()
  tag.organizationId = organizationId
  tag.tenantId = tenantId
  tag.name = input.name
  tag.description = input.description
  tag.color = input.color

  await db.persistAndFlush(tag)

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

export const openApi = {
  ...listEndpoint.openapi({
    query: {
      search: { type: 'string', description: 'Search by tag name' },
      color: { type: 'string', enum: ['gray', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'] },
      isActive: { type: 'boolean', description: 'Filter by active status' },
      page: { type: 'number', minimum: 1, default: 1 },
      pageSize: { type: 'number', minimum: 1, maximum: 100, default: 20 },
    },
    responses: {
      '200': {
        description: 'List of tags',
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
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'number' },
                    pageSize: { type: 'number' },
                    total: { type: 'number' },
                    totalPages: { type: 'number' },
                  },
                  required: ['page', 'pageSize', 'total', 'totalPages'],
                },
              },
              required: ['items', 'pagination'],
            },
          },
        },
      },
    },
  }),
  ...createEndpoint.openapi({
    requestBody: {
      description: 'Tag data',
      content: {
        'application/json': {
          schema: createTagSchema,
        },
      },
    },
    responses: {
      '201': {
        description: 'Tag created',
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
    },
  }),
}