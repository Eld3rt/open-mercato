import { z } from 'zod'
import type { ReminderPriority, ReminderStatus } from './entities'

export const reminderPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])
export const reminderStatusSchema = z.enum(['pending', 'completed', 'cancelled'])

export const reminderCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().optional(),
  dueAt: z.string().datetime().optional(),
  priority: reminderPrioritySchema.default('medium'),
  assignedToUserId: z.string().uuid().optional(),
  entityAssignments: z.array(z.object({
    entityType: z.string().min(1).max(100),
    entityId: z.string().uuid(),
  })).optional(),
})

export const reminderUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  priority: reminderPrioritySchema.optional(),
  status: reminderStatusSchema.optional(),
  assignedToUserId: z.string().uuid().nullable().optional(),
})

export const reminderAssignmentSchema = z.object({
  entityType: z.string().min(1).max(100),
  entityId: z.string().uuid(),
})

export const reminderQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  status: reminderStatusSchema.optional(),
  priority: reminderPrioritySchema.optional(),
  assignedToUserId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
})

export type ReminderCreateInput = z.infer<typeof reminderCreateSchema>
export type ReminderUpdateInput = z.infer<typeof reminderUpdateSchema>
export type ReminderQueryInput = z.infer<typeof reminderQuerySchema>
export type ReminderAssignmentInput = z.infer<typeof reminderAssignmentSchema>