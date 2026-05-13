import { z } from 'zod'
import { makeCrudRoute } from '@/core/utils/crud'
import { Project } from '../data/entities'

const querySchema = z.object({
  name: z.string().optional(),
  status: z.enum(['active', 'completed', 'on-hold', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  createdByUserId: z.string().uuid().optional(),
})

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(['active', 'completed', 'on-hold', 'cancelled']).default('active'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  progressPercentage: z.number().min(0).max(100).default(0),
})

const updateSchema = createSchema.partial()

export const { GET, POST, PUT, DELETE } = makeCrudRoute({
  entity: Project,
  querySchema,
  createSchema,
  updateSchema,
  searchFields: ['name', 'description'],
  defaultSort: { createdAt: 'DESC' },
})