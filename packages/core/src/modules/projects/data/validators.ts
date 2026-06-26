import { z } from 'zod'

export const queryProjectsSchema = z.object({
  name: z.string().optional(),
  status: z.enum(['active', 'completed', 'on-hold', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  createdByUserId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  pageSize: z.coerce.number().min(1).max(100).default(50).optional(),
})

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(['active', 'completed', 'on-hold', 'cancelled']).default('active'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  progressPercentage: z.number().min(0).max(100).default(0),
})

export const updateProjectSchema = createProjectSchema.partial()

export const getProjectParamsSchema = z.object({
  id: z.string().uuid(),
})

export const deleteProjectParamsSchema = z.object({
  id: z.string().uuid(),
})
