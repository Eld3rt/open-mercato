'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useT } from '@open-mercato/shared/lib/i18n/context'

interface ReportRow {
  period?: string
  projectId?: string
  taskId?: string
  userId?: string
  totalHours: number
  billableHours: number
  entriesCount: number
}

interface ReportResponse {
  groupBy: string
  summary: ReportRow[]
  totals: {
    totalHours: number
    billableHours: number
    entriesCount: number
  }
}

async function fetchReport(groupBy: string, dateFrom?: string, dateTo?: string): Promise<ReportResponse> {
  const params = new URLSearchParams({ groupBy })
  if (dateFrom) params.append('dateFrom', dateFrom)
  if (dateTo) params.append('dateTo', dateTo)

  const response = await fetch(`/api/reports?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to load report')
  }
  return response.json()
}

export default function TimeReportsPage() {
  const t = useT('projectTimeReports')
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month' | 'project' | 'task' | 'user'>('month')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['projectTimeReports', groupBy, dateFrom, dateTo],
    queryFn: () => fetchReport(groupBy, dateFrom, dateTo),
  })

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">{t('page.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">{t('filters.groupBy')}</label>
          <select
            value={groupBy}
            onChange={e => setGroupBy(e.target.value as any)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="day">{t('groupBy.day')}</option>
            <option value="week">{t('groupBy.week')}</option>
            <option value="month">{t('groupBy.month')}</option>
            <option value="project">{t('groupBy.project')}</option>
            <option value="task">{t('groupBy.task')}</option>
            <option value="user">{t('groupBy.user')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('filters.dateFrom')}</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value ? new Date(e.target.value).toISOString() : '')}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('filters.dateTo')}</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value ? new Date(e.target.value).toISOString() : '')}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setDateFrom('')
              setDateTo('')
            }}
            className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
          >
            {t('actions.reset')}
          </button>
        </div>
      </div>

      {isLoading && <div className="text-center py-8">{t('dashboard.loading')}</div>}

      {data && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-card rounded border">
              <p className="text-sm text-muted-foreground">{t('stats.totalHours')}</p>
              <p className="text-2xl font-bold">{data.totals.totalHours}h</p>
            </div>
            <div className="p-4 bg-card rounded border">
              <p className="text-sm text-muted-foreground">{t('stats.billableHours')}</p>
              <p className="text-2xl font-bold text-green-600">{data.totals.billableHours}h</p>
            </div>
            <div className="p-4 bg-card rounded border">
              <p className="text-sm text-muted-foreground">{t('stats.entries')}</p>
              <p className="text-2xl font-bold">{data.totals.entriesCount}</p>
            </div>
          </div>

          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {groupBy === 'day' && <th className="px-4 py-2 text-left">{t('table.day')}</th>}
                  {groupBy === 'week' && <th className="px-4 py-2 text-left">{t('table.week')}</th>}
                  {groupBy === 'month' && <th className="px-4 py-2 text-left">{t('table.month')}</th>}
                  {groupBy === 'project' && <th className="px-4 py-2 text-left">{t('table.project')}</th>}
                  {groupBy === 'task' && <th className="px-4 py-2 text-left">{t('table.task')}</th>}
                  {groupBy === 'user' && <th className="px-4 py-2 text-left">{t('table.user')}</th>}
                  <th className="px-4 py-2 text-right">{t('table.hours')}</th>
                  <th className="px-4 py-2 text-right">{t('table.billable')}</th>
                  <th className="px-4 py-2 text-right">{t('table.entries')}</th>
                </tr>
              </thead>
              <tbody>
                {data.summary.map((row, idx) => (
                  <tr key={idx} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-2">
                      {groupBy === 'day' && row.period}
                      {groupBy === 'week' && row.period}
                      {groupBy === 'month' && row.period}
                      {groupBy === 'project' && row.projectId}
                      {groupBy === 'task' && (row.taskId === 'no-task' ? '—' : row.taskId)}
                      {groupBy === 'user' && row.userId}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">{row.totalHours}h</td>
                    <td className="px-4 py-2 text-right text-green-600">{row.billableHours}h</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">{row.entriesCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
