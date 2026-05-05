import type { EntityManager } from '@mikro-orm/core'
import type { Knex } from 'knex'
import { Notification, type NotificationStatus, type NotificationSeverity } from '../data/entities'
import type { CreateNotificationInput, CreateBatchNotificationInput, CreateRoleNotificationInput, CreateFeatureNotificationInput, ExecuteActionInput } from '../data/validators'
import type { NotificationPollData } from '@open-mercato/shared/modules/notifications/types'
import { NOTIFICATION_EVENTS, NOTIFICATION_SSE_EVENTS } from './events'
import {
  buildNotificationEntity,
  emitNotificationCreated,
  emitNotificationCreatedBatch,
  type NotificationContentInput,
  type NotificationTenantContext,
} from './notificationFactory'
import { toNotificationDto, toNotificationGroupDto } from './notificationMapper'
import { getRecipientUserIdsForFeature, getRecipientUserIdsForRole } from './notificationRecipients'
import { assertSafeNotificationHref, sanitizeNotificationActions } from './safeHref'

const DEBUG = process.env.NOTIFICATIONS_DEBUG === 'true'

function debug(...args: unknown[]): void {
  if (DEBUG) {
    console.log('[notifications]', ...args)
  }
}

function getKnex(em: EntityManager): Knex {
  return (em.getConnection() as unknown as { getKnex: () => Knex }).getKnex()
}

const UNIQUE_NOTIFICATION_ACTIVE_STATUSES: NotificationStatus[] = ['unread', 'read', 'actioned']

function normalizeOrgScope(organizationId: string | null | undefined): string | null {
  return organizationId ?? null
}

function applyNotificationContent(
  notification: Notification,
  input: NotificationContentInput,
  recipientUserId: string,
  ctx: NotificationTenantContext,
) {
  const actions = sanitizeNotificationActions(input.actions)
  const linkHref = assertSafeNotificationHref(input.linkHref)

  notification.recipientUserId = recipientUserId
  notification.type = input.type
  notification.titleKey = input.titleKey
  notification.bodyKey = input.bodyKey
  notification.titleVariables = input.titleVariables
  notification.bodyVariables = input.bodyVariables
  notification.title = input.title || input.titleKey || ''
  notification.body = input.body
  notification.icon = input.icon
  notification.severity = input.severity ?? 'info'
  notification.actionData = actions
    ? {
        actions,
        primaryActionId: input.primaryActionId,
      }
    : null
  notification.sourceModule = input.sourceModule
  notification.sourceEntityType = input.sourceEntityType
  notification.sourceEntityId = input.sourceEntityId
  notification.linkHref = linkHref
  notification.groupKey = input.groupKey
  notification.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null
  notification.tenantId = ctx.tenantId
  notification.organizationId = normalizeOrgScope(ctx.organizationId)
  notification.status = 'unread'
  notification.readAt = null
  notification.actionedAt = null
  notification.dismissedAt = null
  notification.actionTaken = null
  notification.actionResult = null
  notification.createdAt = new Date()
}

async function emitNotificationSseEvents(
  eventBus: { emit: (event: string, payload: unknown) => Promise<void> },
  notifications: Notification[],
  ctx: NotificationServiceContext,
  recipientUserIds: string[],
): Promise<void> {
  await eventBus.emit(NOTIFICATION_SSE_EVENTS.BATCH_CREATED, {
    tenantId: ctx.tenantId,
    organizationId: normalizeOrgScope(ctx.organizationId),
    recipientUserIds,
    count: notifications.length,
  })

  for (const notification of notifications) {
    await eventBus.emit(NOTIFICATION_SSE_EVENTS.CREATED, {
      tenantId: notification.tenantId,
      organizationId: notification.organizationId ?? null,
      recipientUserId: notification.recipientUserId,
      notification: toNotificationDto(notification),
    })
  }
}

async function createOrRefreshNotification(
  em: EntityManager,
  input: NotificationContentInput,
  recipientUserId: string,
  ctx: NotificationTenantContext,
): Promise<Notification> {
  if (input.groupKey && input.groupKey.trim().length > 0) {
    const orgScope = normalizeOrgScope(ctx.organizationId) ?? 'global'
    const lockKey = `notifications:${ctx.tenantId}:${orgScope}:${recipientUserId}:${input.type}:${input.groupKey}`
    try {
      const knex = getKnex(em)
      await knex.raw('select pg_advisory_xact_lock(hashtext(?))', [lockKey])
    } catch {
      // If advisory locks are unavailable, continue with best-effort dedupe.
    }

    const existing = await em.findOne(Notification, {
      recipientUserId,
      tenantId: ctx.tenantId,
      organizationId: normalizeOrgScope(ctx.organizationId),
      type: input.type,
      groupKey: input.groupKey,
      status: { $in: UNIQUE_NOTIFICATION_ACTIVE_STATUSES },
    }, {
      orderBy: { createdAt: 'desc' },
    })

    if (existing) {
      applyNotificationContent(existing, input, recipientUserId, ctx)
      return existing
    }
  }

  return buildNotificationEntity(em, input, recipientUserId, ctx)
}

export interface NotificationServiceContext {
  tenantId: string
  organizationId?: string | null
  userId?: string | null
}

export interface NotificationService {
  create(input: CreateNotificationInput, ctx: NotificationServiceContext): Promise<Notification>
  createBatch(input: CreateBatchNotificationInput, ctx: NotificationServiceContext): Promise<Notification[]>
  createForRole(input: CreateRoleNotificationInput, ctx: NotificationServiceContext): Promise<Notification[]>
  createForFeature(input: CreateFeatureNotificationInput, ctx: NotificationServiceContext): Promise<Notification[]>
  markAsRead(notificationId: string, ctx: NotificationServiceContext): Promise<Notification>
  markAllAsRead(ctx: NotificationServiceContext): Promise<number>
  dismiss(notificationId: string, ctx: NotificationServiceContext): Promise<Notification>
  restoreDismissed(
    notificationId: string,
    status: 'read' | 'unread' | undefined,
    ctx: NotificationServiceContext
  ): Promise<Notification>
  executeAction(
    notificationId: string,
    input: ExecuteActionInput,
    ctx: NotificationServiceContext
  ): Promise<{ notification: Notification; result: unknown }>
  getUnreadCount(ctx: NotificationServiceContext): Promise<number>
  getPollData(ctx: NotificationServiceContext, since?: string): Promise<NotificationPollData>
  cleanupExpired(): Promise<number>
  deleteBySource(
    sourceEntityType: string,
    sourceEntityId: string,
    ctx: NotificationServiceContext
  ): Promise<number>
  getGroups(ctx: NotificationServiceContext, filters?: {
    status?: NotificationStatus | NotificationStatus[]
    type?: string
    severity?: NotificationSeverity
    sourceEntityType?: string
    sourceEntityId?: string
    since?: string
    page?: number
    pageSize?: number
  }): Promise<{ items: any[]; total: number; page: number; pageSize: number; totalPages: number }>
}

export interface NotificationServiceDeps {
  em: EntityManager
  eventBus: { emit: (event: string, payload: unknown) => Promise<void> }
  commandBus?: {
    execute: (
      commandId: string,
      options: { input: unknown; ctx: unknown; metadata?: unknown }
    ) => Promise<{ result: unknown }>
  }
  container?: { resolve: (name: string) => unknown }
}

export function createNotificationService(deps: NotificationServiceDeps): NotificationService {
  const { em: rootEm, eventBus, commandBus, container } = deps

  return {
    async create(input, ctx) {
      const { recipientUserId, ...content } = input
      const writeEm = rootEm.fork()
      const notification = await writeEm.transactional(async (tx) => {
        const entity = await createOrRefreshNotification(tx, content, recipientUserId, ctx)
        await tx.flush()
        return entity
      })

      await emitNotificationCreated(eventBus, notification, ctx)
      await eventBus.emit(NOTIFICATION_SSE_EVENTS.CREATED, {
        tenantId: notification.tenantId,
        organizationId: notification.organizationId ?? null,
        recipientUserId: notification.recipientUserId,
        notification: toNotificationDto(notification),
      })

      return notification
    },

    async createBatch(input, ctx) {
      const recipientUserIds = Array.from(new Set(input.recipientUserIds))
      const { recipientUserIds: _recipientUserIds, ...content } = input
      const notifications: Notification[] = []
      const writeEm = rootEm.fork()

      await writeEm.transactional(async (tx) => {
        for (const recipientUserId of recipientUserIds) {
          const notification = await createOrRefreshNotification(tx, content, recipientUserId, ctx)
          notifications.push(notification)
        }
        await tx.flush()
      })

      await emitNotificationCreatedBatch(eventBus, notifications, ctx)
      await emitNotificationSseEvents(eventBus, notifications, ctx, recipientUserIds)

      return notifications
    },

    async createForRole(input, ctx) {
      const em = rootEm.fork()

      const knex = getKnex(em)
      const recipientUserIds = await getRecipientUserIdsForRole(knex, ctx.tenantId, input.roleId)
      if (recipientUserIds.length === 0) {
        return []
      }

      const { roleId: _roleId, ...content } = input
      const notifications: Notification[] = []
      const uniqueRecipientUserIds = Array.from(new Set(recipientUserIds))
      const writeEm = rootEm.fork()

      await writeEm.transactional(async (tx) => {
        for (const recipientUserId of uniqueRecipientUserIds) {
          const notification = await createOrRefreshNotification(tx, content, recipientUserId, ctx)
          notifications.push(notification)
        }
        await tx.flush()
      })

      await emitNotificationCreatedBatch(eventBus, notifications, ctx)
      await emitNotificationSseEvents(eventBus, notifications, ctx, uniqueRecipientUserIds)

      return notifications
    },

    async createForFeature(input, ctx) {
      const em = rootEm.fork()
      const knex = getKnex(em)
      const recipientUserIds = await getRecipientUserIdsForFeature(knex, ctx.tenantId, input.requiredFeature)

      if (recipientUserIds.length === 0) {
        debug('No users found with feature:', input.requiredFeature, 'in tenant:', ctx.tenantId)
        return []
      }

      debug('Creating notifications for', recipientUserIds.length, 'user(s) with feature:', input.requiredFeature)

      const { requiredFeature: _requiredFeature, ...content } = input
      const notifications: Notification[] = []
      const uniqueRecipientUserIds = Array.from(new Set(recipientUserIds))
      const writeEm = rootEm.fork()

      await writeEm.transactional(async (tx) => {
        for (const recipientUserId of uniqueRecipientUserIds) {
          const notification = await createOrRefreshNotification(tx, content, recipientUserId, ctx)
          notifications.push(notification)
        }
        await tx.flush()
      })

      await emitNotificationCreatedBatch(eventBus, notifications, ctx)
      await emitNotificationSseEvents(eventBus, notifications, ctx, uniqueRecipientUserIds)

      return notifications
    },

    async markAsRead(notificationId, ctx) {
      const em = rootEm.fork()
      const notification = await em.findOneOrFail(Notification, {
        id: notificationId,
        recipientUserId: ctx.userId,
        tenantId: ctx.tenantId,
      })

      if (notification.status === 'unread') {
        notification.status = 'read'
        notification.readAt = new Date()
        await em.flush()

        await eventBus.emit(NOTIFICATION_EVENTS.READ, {
          notificationId: notification.id,
          userId: ctx.userId,
          tenantId: ctx.tenantId,
        })
      }

      return notification
    },

    async markAllAsRead(ctx) {
      const em = rootEm.fork()
      const knex = getKnex(em)

      const result = await knex('notifications')
        .where({
          recipient_user_id: ctx.userId,
          tenant_id: ctx.tenantId,
          status: 'unread',
        })
        .update({
          status: 'read',
          read_at: knex.fn.now(),
        })

      return result
    },

    async dismiss(notificationId, ctx) {
      const em = rootEm.fork()
      const notification = await em.findOneOrFail(Notification, {
        id: notificationId,
        recipientUserId: ctx.userId,
        tenantId: ctx.tenantId,
      })

      notification.status = 'dismissed'
      notification.dismissedAt = new Date()
      await em.flush()

      await eventBus.emit(NOTIFICATION_EVENTS.DISMISSED, {
        notificationId: notification.id,
        userId: ctx.userId,
        tenantId: ctx.tenantId,
      })

      return notification
    },

    async restoreDismissed(notificationId, status, ctx) {
      const em = rootEm.fork()
      const notification = await em.findOneOrFail(Notification, {
        id: notificationId,
        recipientUserId: ctx.userId,
        tenantId: ctx.tenantId,
      })

      if (notification.status !== 'dismissed') {
        return notification
      }

      const targetStatus = status ?? 'read'
      notification.status = targetStatus
      notification.dismissedAt = null

      if (targetStatus === 'unread') {
        notification.readAt = null
      } else if (!notification.readAt) {
        notification.readAt = new Date()
      }

      await em.flush()

      await eventBus.emit(NOTIFICATION_EVENTS.RESTORED, {
        notificationId: notification.id,
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        status: targetStatus,
      })

      return notification
    },

    async executeAction(notificationId, input, ctx) {
      const em = rootEm.fork()
      const notification = await em.findOneOrFail(Notification, {
        id: notificationId,
        recipientUserId: ctx.userId,
        tenantId: ctx.tenantId,
      })

      const actionData = notification.actionData
      const action = actionData?.actions?.find((a) => a.id === input.actionId)

      if (!action) {
        throw new Error('Action not found')
      }

      let result: unknown = null

      if (action.commandId && commandBus && container) {
        const commandInput = {
          id: notification.sourceEntityId,
          ...input.payload,
        }

        // Build a CommandRuntimeContext from the notification service context
        const commandCtx = {
          container,
          auth: {
            sub: ctx.userId,
            tenantId: ctx.tenantId,
            orgId: ctx.organizationId,
          },
          organizationScope: null,
          selectedOrganizationId: ctx.organizationId ?? null,
          organizationIds: ctx.organizationId ? [ctx.organizationId] : null,
        }

        const commandResult = await commandBus.execute(action.commandId, {
          input: commandInput,
          ctx: commandCtx,
          metadata: {
            tenantId: ctx.tenantId,
            organizationId: ctx.organizationId,
            resourceKind: 'notifications',
          },
        })

        result = commandResult.result
      }

      notification.status = 'actioned'
      notification.actionedAt = new Date()
      notification.actionTaken = input.actionId
      notification.actionResult = result as Record<string, unknown>

      if (!notification.readAt) {
        notification.readAt = new Date()
      }

      await em.flush()

      await eventBus.emit(NOTIFICATION_EVENTS.ACTIONED, {
        notificationId: notification.id,
        actionId: input.actionId,
        userId: ctx.userId,
        tenantId: ctx.tenantId,
      })

      return { notification, result }
    },

    async getUnreadCount(ctx) {
      const em = rootEm.fork()
      return em.count(Notification, {
        recipientUserId: ctx.userId,
        tenantId: ctx.tenantId,
        status: 'unread',
      })
    },

    async getPollData(ctx, since) {
      const em = rootEm.fork()
      const filters: Record<string, unknown> = {
        recipientUserId: ctx.userId,
        tenantId: ctx.tenantId,
      }

      if (since) {
        filters.createdAt = { $gt: new Date(since) }
      }

      const [notifications, unreadCount] = await Promise.all([
        em.find(Notification, filters, {
          orderBy: { createdAt: 'desc' },
          limit: 50,
        }),
        em.count(Notification, {
          recipientUserId: ctx.userId,
          tenantId: ctx.tenantId,
          status: 'unread',
        }),
      ])

      const recent = notifications.map(toNotificationDto)
      const hasNew = since ? recent.length > 0 : false

      return {
        unreadCount,
        recent,
        hasNew,
        lastId: recent[0]?.id,
      }
    },

    async cleanupExpired() {
      const em = rootEm.fork()
      const knex = getKnex(em)

      const result = await knex('notifications')
        .where('expires_at', '<', knex.fn.now())
        .whereNotIn('status', ['actioned', 'dismissed'])
        .update({
          status: 'dismissed',
          dismissed_at: knex.fn.now(),
        })

      return result
    },

    async deleteBySource(sourceEntityType, sourceEntityId, ctx) {
      const em = rootEm.fork()
      const knex = getKnex(em)

      const result = await knex('notifications')
        .where({
          source_entity_type: sourceEntityType,
          source_entity_id: sourceEntityId,
          tenant_id: ctx.tenantId,
        })
        .delete()

      return result
    },

    async getGroups(ctx, filters = {}) {
      const em = rootEm.fork()
      const knex = getKnex(em)

      const query = knex('notifications')
        .select([
          'group_key',
          'type',
          knex.raw('COUNT(*) as count'),
          knex.raw('COUNT(CASE WHEN status = \'unread\' THEN 1 END) as unread_count'),
          knex.raw('MAX(id) as latest_id'),
          knex.raw('MAX(created_at) as latest_created_at'),
          knex.raw('MAX(title) as title'),
          knex.raw('MAX(title_key) as title_key'),
          knex.raw('MAX(body) as body'),
          knex.raw('MAX(body_key) as body_key'),
          knex.raw('MAX(icon) as icon'),
          knex.raw('MAX(severity) as severity'),
          knex.raw('MAX(source_module) as source_module'),
          knex.raw('MAX(source_entity_type) as source_entity_type'),
          knex.raw('MAX(source_entity_id) as source_entity_id'),
          knex.raw('MAX(link_href) as link_href'),
        ])
        .where({
          recipient_user_id: ctx.userId,
          tenant_id: ctx.tenantId,
          group_key: knex.raw('IS NOT NULL'),
        })
        .whereNot('group_key', '')
        .groupBy(['group_key', 'type'])
        .orderBy('latest_created_at', 'desc')

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query.whereIn('status', filters.status)
        } else {
          query.where('status', filters.status)
        }
      } else {
        query.whereNot('status', 'dismissed')
      }

      if (filters.type) {
        query.where('type', filters.type)
      }

      if (filters.severity) {
        query.where('severity', filters.severity)
      }

      if (filters.sourceEntityType) {
        query.where('source_entity_type', filters.sourceEntityType)
      }

      if (filters.sourceEntityId) {
        query.where('source_entity_id', filters.sourceEntityId)
      }

      if (filters.since) {
        query.where('created_at', '>', filters.since)
      }

      const page = filters.page ?? 1
      const pageSize = filters.pageSize ?? 20
      const offset = (page - 1) * pageSize

      query.limit(pageSize).offset(offset)

      const groups = await query

      // Get total count
      const countQuery = knex('notifications')
        .countDistinct(knex.raw('group_key || type'), { as: 'total' })
        .where({
          recipient_user_id: ctx.userId,
          tenant_id: ctx.tenantId,
          group_key: knex.raw('IS NOT NULL'),
        })
        .whereNot('group_key', '')

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          countQuery.whereIn('status', filters.status)
        } else {
          countQuery.where('status', filters.status)
        }
      } else {
        countQuery.whereNot('status', 'dismissed')
      }

      if (filters.type) {
        countQuery.where('type', filters.type)
      }

      if (filters.severity) {
        countQuery.where('severity', filters.severity)
      }

      if (filters.sourceEntityType) {
        countQuery.where('source_entity_type', filters.sourceEntityType)
      }

      if (filters.sourceEntityId) {
        countQuery.where('source_entity_id', filters.sourceEntityId)
      }

      if (filters.since) {
        countQuery.where('created_at', '>', filters.since)
      }

      const countResult = await countQuery.first()
      const total = parseInt(countResult?.total as string || '0', 10)

      const items = groups.map(toNotificationGroupDto)

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    },
  }
}

/**
 * Helper to create notification service from a DI container.
 * Use this in API routes and commands to avoid DI resolution issues.
 */
export function resolveNotificationService(container: {
  resolve: (name: string) => unknown
}): NotificationService {
  const em = container.resolve('em') as EntityManager
  const eventBus = container.resolve('eventBus') as { emit: (event: string, payload: unknown) => Promise<void> }

  // commandBus may not be registered in all contexts, so resolve it safely
  let commandBus: NotificationServiceDeps['commandBus']
  try {
    commandBus = container.resolve('commandBus') as typeof commandBus
  } catch {
    // commandBus not available - actions with commandId won't work
    commandBus = undefined
  }

  return createNotificationService({ em, eventBus, commandBus, container })
}
