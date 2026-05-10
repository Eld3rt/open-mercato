import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { EntityManager } from '@mikro-orm/postgresql'
import type { OpenApiRouteDoc } from '@open-mercato/shared/lib/openapi'
import { CrudHttpError } from '@open-mercato/shared/lib/crud/errors'
import { readJsonSafe } from '@open-mercato/shared/lib/http/readJsonSafe'
import { parseBooleanToken } from '@open-mercato/shared/lib/boolean'
import { makeCrudRoute } from '@open-mercato/shared/lib/crud/route'
import { Shortcut } from '../data/entities'
import {
  shortcutCreateSchema,
  shortcutUpdateSchema,
  shortcutQuerySchema,
  type ShortcutCreateInput,
  type ShortcutUpdateInput,
  type ShortcutQueryInput,
} from '../data/validators'

const querySchema = shortcutQuerySchema.extend({
  onlyPinned: z.string().optional(),
})

export const metadata = {
  GET: { requireAuth: true, requireFeatures: ['shortcuts.view'] },
  POST: { requireAuth: true, requireFeatures: ['shortcuts.manage'] },
  PUT: { requireAuth: true, requireFeatures: ['shortcuts.manage'] },
  DELETE: { requireAuth: true, requireFeatures: ['shortcuts.manage'] },
}

export const openApi: OpenApiRouteDoc = {
  tags: ['Shortcuts'],
  summary: 'Manage shortcuts',
  description: 'CRUD operations for user shortcuts and bookmarks',
  parameters: [
    {
      name: 'page',
      in: 'query',
      schema: { type: 'integer', minimum: 1, default: 1 },
    },
    {
      name: 'pageSize',
      in: 'query',
      schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
    },
    {
      name: 'search',
      in: 'query',
      schema: { type: 'string' },
    },
    {
      name: 'sortBy',
      in: 'query',
      schema: { type: 'string', enum: ['name', 'created', 'accessed', 'pinned'], default: 'pinned' },
    },
    {
      name: 'onlyPinned',
      in: 'query',
      schema: { type: 'boolean' },
    },
  ],
  responses: {
    200: {
      description: 'Success',
    },
  },
}

async function getShortcuts(
  em: EntityManager,
  query: ShortcutQueryInput & { onlyPinned?: string },
  organizationId: string,
  tenantId: string,
  userId: string
) {
  const qb = em.createQueryBuilder(Shortcut, 's')
    .select('*')
    .where({
      organizationId,
      tenantId,
      createdByUserId: userId,
      deletedAt: null,
    })

  // Apply filters
  if (query.search) {
    qb.andWhere({
      $or: [
        { name: { $ilike: `%${query.search}%` } },
        { description: { $ilike: `%${query.search}%` } },
        { url: { $ilike: `%${query.search}%` } },
      ],
    })
  }

  if (parseBooleanToken(query.onlyPinned)) {
    qb.andWhere({ isPinned: true })
  }

  // Apply sorting
  if (query.sortBy === 'name') {
    qb.orderBy({ name: 'ASC' })
  } else if (query.sortBy === 'created') {
    qb.orderBy({ createdAt: 'DESC' })
  } else if (query.sortBy === 'accessed') {
    qb.orderBy({ lastAccessedAt: 'DESC', createdAt: 'DESC' })
  } else {
    // Default: pinned first, then by order
    qb.orderBy({ isPinned: 'DESC', orderIndex: 'ASC', createdAt: 'DESC' })
  }

  // Count total
  const total = await qb.getCount()

  // Apply pagination
  const items = await qb
    .limit(query.pageSize)
    .offset((query.page - 1) * query.pageSize)
    .getResult()

  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(total / query.pageSize),
  }
}

async function createShortcut(
  em: EntityManager,
  data: ShortcutCreateInput,
  organizationId: string,
  tenantId: string,
  userId: string
) {
  // Get max orderIndex for new shortcuts
  const maxOrder = await em.createQueryBuilder(Shortcut, 's')
    .select('MAX(s.order_index)', 'max_order')
    .where({
      organizationId,
      tenantId,
      createdByUserId: userId,
    })
    .getRawOne<{ max_order: number | null }>()

  const shortcut = em.create(Shortcut, {
    ...data,
    organizationId,
    tenantId,
    createdByUserId: userId,
    orderIndex: (maxOrder?.max_order ?? -1) + 1,
  })

  await em.persistAndFlush(shortcut)
  return shortcut
}

async function updateShortcut(
  em: EntityManager,
  id: string,
  data: ShortcutUpdateInput,
  organizationId: string,
  tenantId: string,
  userId: string
) {
  const shortcut = await em.findOneOrFail(Shortcut, {
    id,
    organizationId,
    tenantId,
    createdByUserId: userId,
    deletedAt: null,
  })

  em.assign(shortcut, data)
  await em.flush()

  return shortcut
}

async function deleteShortcut(
  em: EntityManager,
  id: string,
  organizationId: string,
  tenantId: string,
  userId: string
) {
  const shortcut = await em.findOneOrFail(Shortcut, {
    id,
    organizationId,
    tenantId,
    createdByUserId: userId,
    deletedAt: null,
  })

  shortcut.deletedAt = new Date()
  await em.flush()

  return shortcut
}

export const { GET, POST, PUT, DELETE } = makeCrudRoute({
  entityType: 'shortcut',
  querySchema,
  createSchema: shortcutCreateSchema,
  updateSchema: shortcutUpdateSchema,
  getList: getShortcuts,
  create: createShortcut,
  update: updateShortcut,
  delete: deleteShortcut,
})