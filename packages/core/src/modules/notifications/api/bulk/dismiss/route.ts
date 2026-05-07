import { getRequestContext } from '@open-mercato/shared/lib/crud/request'
import { buildNotificationsCrudOpenApi } from '../../openapi'
import { bulkDismissSchema } from '../../data/validators'

const endpoint = buildNotificationsCrudOpenApi.endpoint({
  method: 'PATCH',
  path: '/bulk/dismiss',
  summary: 'Dismiss multiple notifications',
  description: 'Marks one or more notifications as dismissed for the current user',
  tags: ['Notifications'],
})

export const POST = endpoint.handler(async (request) => {
  const ctx = getRequestContext(request)
  const db = ctx.em
  const userId = ctx.userId

  const input = bulkDismissSchema.parse(await request.json())

  const notifications = await db.find('Notification', {
    id: { $in: input.notificationIds },
    userId,
  })

  for (const notification of notifications) {
    if (notification.status !== 'dismissed') {
      notification.status = 'dismissed'
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
    description: 'IDs of notifications to dismiss',
    content: {
      'application/json': {
        schema: bulkDismissSchema,
      },
    },
  },
  responses: {
    '200': {
      description: 'Notifications dismissed',
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
