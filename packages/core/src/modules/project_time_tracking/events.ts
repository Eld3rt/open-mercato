import { createModuleEvents } from '@open-mercato/shared/lib/events'

export const events = createModuleEvents({
  'project_time_tracking.entry.created': {
    description: 'A time entry was created',
    payload: {
      entryId: 'string',
      projectId: 'string',
      taskId: 'string | null',
      userId: 'string',
      durationMinutes: 'number | null',
    },
    clientBroadcast: true,
  },
} as const)
