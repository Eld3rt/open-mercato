import { z } from 'zod'

export const generateReportSchema = z.object({
  groupBy: z.enum(['day', 'week', 'month', 'project', 'task', 'user']).default('day'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  projectId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  billableOnly: z.boolean().optional(),
})

export const reportSummarySchema = z.object({
  period: z.string(),
  totalMinutes: z.number(),
  totalHours: z.number(),
  billableMinutes: z.number(),
  billableHours: z.number(),
  entriesCount: z.number(),
  projectId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
})
