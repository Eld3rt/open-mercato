import { formatDuration, getTimeEntrySummary } from '../backend/page.client'

describe('project_time_tracking backend summary helpers', () => {
  it('formats duration as hours and minutes', () => {
    expect(formatDuration(0)).toBe('0m')
    expect(formatDuration(15)).toBe('15m')
    expect(formatDuration(60)).toBe('1h 0m')
    expect(formatDuration(95)).toBe('1h 35m')
  })

  it('calculates summary values from time entries', () => {
    const entries = [
      {
        id: '1',
        projectId: 'p1',
        taskId: null,
        userId: 'u1',
        description: 'Test',
        startedAt: '',
        endedAt: null,
        durationMinutes: 30,
        status: 'stopped',
        billable: true,
      },
      {
        id: '2',
        projectId: 'p1',
        taskId: 't1',
        userId: 'u2',
        description: 'Run',
        startedAt: '',
        endedAt: null,
        durationMinutes: null,
        status: 'running',
        billable: false,
      },
      {
        id: '3',
        projectId: 'p2',
        taskId: null,
        userId: 'u3',
        description: null,
        startedAt: '',
        endedAt: null,
        durationMinutes: 90,
        status: 'stopped',
        billable: true,
      },
    ]

    const summary = getTimeEntrySummary(entries)

    expect(summary.totalEntries).toBe(3)
    expect(summary.activeTimers).toBe(1)
    expect(summary.totalTrackedMinutes).toBe(120)
  })
})
