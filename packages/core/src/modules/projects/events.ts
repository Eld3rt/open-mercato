import { createModuleEvents } from '@open-mercato/shared/lib/events'

export const events = createModuleEvents({
  'projects.project.created': {
    description: 'A new project was created',
    payload: {
      projectId: 'string',
      name: 'string',
      createdByUserId: 'string',
    },
    clientBroadcast: true,
  },
  'projects.project.updated': {
    description: 'A project was updated',
    payload: {
      projectId: 'string',
      name: 'string',
    },
    clientBroadcast: true,
  },
  'projects.project.deleted': {
    description: 'A project was deleted',
    payload: {
      projectId: 'string',
    },
    clientBroadcast: true,
  },
} as const)
