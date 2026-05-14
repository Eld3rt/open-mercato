import { z } from 'zod'

export const createProjectCommentSchema = z.object({
  projectId: z.string().uuid(),
  taskId: z.string().uuid().optional(),
  parentCommentId: z.string().uuid().optional(),
  content: z.string().min(1).max(10000),
})

export const updateProjectCommentSchema = z.object({
  content: z.string().min(1).max(10000),
})

export const queryProjectCommentsSchema = z.object({
  projectId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  authorUserId: z.string().uuid().optional(),
  parentCommentId: z.string().uuid().optional(),
  pageSize: z.number().int().min(1).max(100).default(20),
  page: z.number().int().min(1).default(1),
  sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})