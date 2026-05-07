import { getRequestContext } from '@open-mercato/shared/lib/crud/request'
import { buildNotificationsCrudOpenApi } from '../../openapi'
import { bulkMarkAsReadSchema } from '../../data/validators'

const endpoint = buildNotificationsCrudOpenApi.endpoint({
  method: 'PATCH',
  path: '/bulk/read',
  summary: 'Mark multiple notifications as read',
  description: 'Marks one or more notifications as read for the current user',
  tags: ['Notifications'],
})

export const POST = endpoint.handler(async (request) => {
  const ctx = getRequestContext(request)
  const db = ctx.em
  const userId = ctx.userId

  const input = bulkMarkAsReadSchema.parse(await request.json())

  const notifications = await db.find('Notification', {
    id: { $in: input.notificationIds },
    userId,
  })

  for (const notification of notifications) {
    if (notification.status !== 'read') {
      notification.status = 'read'
      notification.readAt = new Date()
    }
  }

  await db.flush()

  return {
    ok: true,
    updated: notifications.length,
  }
})

export const openApi = endpoint.openapi({
  requestBody: {
    description: 'IDs of notifications to mark as read',
    content: {
      'application/json': {
        schema: bulkMarkAsReadSchema,
      },
    },
  },
  responses: {
    '200': {
      description: 'Notifications marked as read',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
              updated: { type: 'number' },
            },
            required: ['ok', 'updated'],
          },
        },
      },
    },
  },
})
