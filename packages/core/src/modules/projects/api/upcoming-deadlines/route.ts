import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@open-mercato/shared/lib/auth/server'
import { getOrm } from '@open-mercato/shared/lib/db/mikro'
import { Project } from '../../data/entities'

const routeMetadata = {
  GET: { requireAuth: true, requireFeatures: ['projects.view'] },
}

export const metadata = routeMetadata

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orm = await getOrm()

  // Calculate date 7 days from now
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const projects = await orm.em.find(Project, {
    organizationId: auth.organizationId,
    tenantId: auth.tenantId,
    deletedAt: null,
    dueDate: {
      $gte: now,
      $lte: sevenDaysFromNow,
    },
  })

  return NextResponse.json({
    items: projects.map(p => ({
      id: p.id,
      name: p.name,
      dueDate: p.dueDate,
      status: p.status ?? 'active',
    })),
    total: projects.length,
  })
}
