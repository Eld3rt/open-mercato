'use client'

import { useQuery } from '@tanstack/react-query'
import { useT } from '@open-mercato/shared/lib/i18n/context'
import { Card, CardContent, CardHeader, CardTitle } from '@open-mercato/ui/primitives/card'

interface ReportSummary {
  totalHours: number
  billableHours: number
  entriesCount: number
  groupBy: string
}

async function fetchMonthlySummary(): Promise<ReportSummary> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = now.toISOString()

  const response = await fetch(
    `/api/reports?groupBy=day&dateFrom=${encodeURIComponent(monthStart)}&dateTo=${encodeURIComponent(monthEnd)}`,
  )
  if (!response.ok) {
    throw new Error('Failed to load report summary')
  }
  const data = await response.json()
  return data.totals
}

export default function TimeReportsSummaryWidget() {
  const t = useT('projectTimeReports')
  const { data, isLoading, error } = useQuery({
    queryKey: ['projectTimeReports', 'monthlySummary'],
    queryFn: fetchMonthlySummary,
    refetchInterval: 60000,
  })

  if (isLoading) {
    return <div className="text-center py-4">{t('dashboard.loading')}</div>
  }

  if (error) {
    return <div className="text-center py-4 text-destructive">{t('dashboard.error')}</div>
  }

  if (!data) {
    return <div className="text-center py-4 text-muted-foreground">{t('dashboard.empty')}</div>
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('stats.totalHours')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalHours}h</div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.entriesCount} {t('stats.entries')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('stats.billableHours')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{data.billableHours}h</div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.totalHours > 0 ? ((data.billableHours / data.totalHours) * 100).toFixed(0) : 0}% {t('stats.ofTotal')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
