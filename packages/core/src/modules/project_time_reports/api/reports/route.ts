import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthFromRequest } from '@open-mercato/shared/lib/auth/server'
import { getOrm } from '@open-mercato/shared/lib/db/mikro'
import { ProjectTimeEntry } from '../../project_time_tracking/data/entities'
import { generateReportSchema } from '../data/validators'

const routeMetadata = {
  GET: { requireAuth: true, requireFeatures: ['project_time_reports.view'] },
}

export const metadata = routeMetadata

type ReportGroup = 'day' | 'week' | 'month' | 'project' | 'task' | 'user'

function getPeriodKey(date: Date, groupBy: ReportGroup): string {
  const d = new Date(date)
  switch (groupBy) {
    case 'day':
      return d.toISOString().split('T')[0]
    case 'week': {
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      return `W${weekStart.toISOString().split('T')[0]}`
    }
    case 'month':
      return d.toISOString().slice(0, 7)
    default:
      return 'total'
  }
}

interface ReportRow {
  period?: string
  projectId?: string | null
  taskId?: string | null
  userId?: string | null
  totalMinutes: number
  billableMinutes: number
  entriesCount: number
}

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = generateReportSchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()))
  const orm = await getOrm()

  const qb = orm.em.createQueryBuilder(ProjectTimeEntry, 't').select(['t.*']).where({
    organizationId: auth.organizationId,
    tenantId: auth.tenantId,
    deletedAt: null,
  })

  if (parsed.dateFrom) {
    qb.andWhere({ startedAt: { $gte: new Date(parsed.dateFrom) } })
  }
  if (parsed.dateTo) {
    qb.andWhere({ startedAt: { $lte: new Date(parsed.dateTo) } })
  }
  if (parsed.projectId) {
    qb.andWhere({ projectId: parsed.projectId })
  }
  if (parsed.taskId) {
    qb.andWhere({ taskId: parsed.taskId })
  }
  if (parsed.userId) {
    qb.andWhere({ userId: parsed.userId })
  }
  if (parsed.billableOnly) {
    qb.andWhere({ billable: true })
  }

  const items = await qb.getResult()

  // Aggregate results
  const aggregated = new Map<string, ReportRow>()

  items.forEach((entry: ProjectTimeEntry) => {
    let key: string
    const groupByType = parsed.groupBy as ReportGroup

    if (groupByType === 'project') {
      key = entry.projectId
    } else if (groupByType === 'task') {
      key = entry.taskId ?? 'no-task'
    } else if (groupByType === 'user') {
      key = entry.userId
    } else {
      key = getPeriodKey(entry.startedAt, groupByType)
    }

    const existing = aggregated.get(key) || {
      [groupByType === 'project'
        ? 'projectId'
        : groupByType === 'task'
          ? 'taskId'
          : groupByType === 'user'
            ? 'userId'
            : 'period']:
        groupByType === 'project' ? key : groupByType === 'task' ? key : groupByType === 'user' ? key : key,
      totalMinutes: 0,
      billableMinutes: 0,
      entriesCount: 0,
    }

    const minutes = entry.durationMinutes ?? 0
    existing.totalMinutes += minutes
    if (entry.billable) {
      existing.billableMinutes += minutes
    }
    existing.entriesCount += 1

    aggregated.set(key, existing)
  })

  const summary = Array.from(aggregated.values()).map(row => ({
    ...row,
    totalHours: parseFloat((row.totalMinutes / 60).toFixed(2)),
    billableHours: parseFloat((row.billableMinutes / 60).toFixed(2)),
  }))

  const totals = summary.reduce(
    (acc, row) => ({
      totalMinutes: acc.totalMinutes + row.totalMinutes,
      billableMinutes: acc.billableMinutes + row.billableMinutes,
      entriesCount: acc.entriesCount + row.entriesCount,
    }),
    { totalMinutes: 0, billableMinutes: 0, entriesCount: 0 },
  )

  return NextResponse.json({
    groupBy: parsed.groupBy,
    summary,
    totals: {
      totalMinutes: totals.totalMinutes,
      totalHours: parseFloat((totals.totalMinutes / 60).toFixed(2)),
      billableMinutes: totals.billableMinutes,
      billableHours: parseFloat((totals.billableMinutes / 60).toFixed(2)),
      entriesCount: totals.entriesCount,
    },
  })
}
