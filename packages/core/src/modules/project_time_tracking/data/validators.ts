import { z } from 'zod'

export const createTimeEntrySchema = z.object({
  projectId: z.string().uuid(),
  taskId: z.string().uuid().nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().nullable().optional(),
  billable: z.boolean().default(true),
})

export const updateTimeEntrySchema = z
  .object({
    id: z.string().uuid(),
    projectId: z.string().uuid().optional(),
    taskId: z.string().uuid().nullable().optional(),
    description: z.string().max(1000).nullable().optional(),
    startedAt: z.string().datetime().optional(),
    endedAt: z.string().datetime().nullable().optional(),
    status: z.enum(['running', 'stopped']).optional(),
    billable: z.boolean().optional(),
  })
  .partial()
  .required({ id: true })

export const queryTimeEntriesSchema = z.object({
  projectId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.enum(['running', 'stopped']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(50),
  sortBy: z.enum(['startedAt', 'endedAt', 'createdAt']).default('startedAt'),
})
