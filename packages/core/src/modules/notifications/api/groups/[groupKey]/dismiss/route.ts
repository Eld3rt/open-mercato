import { resolveNotificationContext } from '../../../lib/routeHelpers'

export const metadata = {
  POST: { requireAuth: true },
}

export async function POST(req: Request, { params }: { params: Promise<{ groupKey: string }> }) {
  const { groupKey } = await params
  const { service, scope } = await resolveNotificationContext(req)

  const em = service['em'] || req.container?.resolve('em')
  if (!em) {
    return Response.json({ error: 'Database connection not available' }, { status: 500 })
  }

  // Update all notifications in the group
  const result = await em.nativeUpdate('notifications', {
    groupKey,
    recipientUserId: scope.userId,
    tenantId: scope.tenantId,
    status: { $ne: 'dismissed' },
  }, {
    status: 'dismissed',
    dismissedAt: new Date(),
  })

  return Response.json({ updated: result })
}