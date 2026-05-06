import { z } from 'zod'
import type { EntityManager } from '@mikro-orm/core'
import { Notification } from '../../data/entities'
import { listNotificationGroupsSchema } from '../../data/validators'
import { toNotificationGroupDto } from '../../lib/notificationMapper'
import { resolveNotificationContext } from '../../lib/routeHelpers'
import { buildNotificationsCrudOpenApi, createPagedListResponseSchema, notificationGroupItemSchema } from '../openapi'

export const metadata = {
  GET: { requireAuth: true },
}

export async function GET(req: Request) {
  const { ctx, scope } = await resolveNotificationContext(req)
  const em = ctx.container.resolve('em') as EntityManager

  const url = new URL(req.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())
  const input = listNotificationGroupsSchema.parse(queryParams)

  const filters: Record<string, unknown> = {
    recipientUserId: scope.userId,
    tenantId: scope.tenantId,
    groupKey: { $ne: null },
  }

  if (input.status) {
    filters.status = Array.isArray(input.status) ? { $in: input.status } : input.status
  } else {
    filters.status = { $ne: 'dismissed' }
  }
  if (input.type) {
    filters.type = input.type
  }
  if (input.severity) {
    filters.severity = input.severity
  }
  if (input.sourceEntityType) {
    filters.sourceEntityType = input.sourceEntityType
  }
  if (input.sourceEntityId) {
    filters.sourceEntityId = input.sourceEntityId
  }
  if (input.since) {
    filters.createdAt = { $gt: new Date(input.since) }
  }

  // Get grouped notifications using raw SQL for better performance
  const qb = em.createQueryBuilder(Notification, 'n')
  qb.select([
    'n.group_key',
    'n.type',
    'COUNT(*) as count',
    "COUNT(CASE WHEN n.status = 'unread' THEN 1 END) as unread_count",
    'MAX(n.id) as latest_id',
    'MAX(n.created_at) as latest_created_at',
    'MAX(n.title) as title',
    'MAX(n.title_key) as title_key',
    'MAX(n.body) as body',
    'MAX(n.body_key) as body_key',
    'MAX(n.icon) as icon',
    'MAX(n.severity) as severity',
    'MAX(n.source_module) as source_module',
    'MAX(n.source_entity_type) as source_entity_type',
    'MAX(n.source_entity_id) as source_entity_id',
    'MAX(n.link_href) as link_href',
  ])
  qb.where(filters)
  qb.groupBy(['n.group_key', 'n.type'])
  qb.orderBy({ latest_created_at: 'desc' })
  qb.limit(input.pageSize)
  qb.offset((input.page - 1) * input.pageSize)

  const groups = await qb.execute()

  // Get total count
  const countQb = em.createQueryBuilder(Notification, 'n')
  countQb.select('COUNT(DISTINCT n.group_key || n.type)')
  countQb.where(filters)
  const totalResult = await countQb.execute()
  const total = parseInt(totalResult[0].count, 10)

  const items = groups.map(toNotificationGroupDto)

  return Response.json({
    items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.ceil(total / input.pageSize),
  })
}

export const openApi = buildNotificationsCrudOpenApi({
  resourceName: 'NotificationGroup',
  querySchema: listNotificationGroupsSchema,
  listResponseSchema: createPagedListResponseSchema(notificationGroupItemSchema),
})
