import { createModuleEvents } from '@open-mercato/shared/lib/events'

export const events = createModuleEvents({
  'project_time_reports.report_generated': {
    description: 'A time report was generated',
    payload: {
      groupBy: 'string',
      entriesCount: 'number',
      totalMinutes: 'number',
    },
    clientBroadcast: false,
  },
} as const)
