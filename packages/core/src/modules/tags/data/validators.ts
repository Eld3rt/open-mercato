import { z } from 'zod'

const uuid = () => z.string().uuid()

export const tagColorSchema = z.enum(['gray', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'])

export const createTagSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  color: tagColorSchema.optional().default('gray'),
})

export const updateTagSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  color: tagColorSchema.optional(),
  isActive: z.boolean().optional(),
})

export const assignTagsSchema = z.object({
  entityType: z.string().trim().min(1).max(100),
  entityId: uuid(),
  tagIds: z.array(uuid()).min(1).max(50),
})

export const unassignTagsSchema = z.object({
  entityType: z.string().trim().min(1).max(100),
  entityId: uuid(),
  tagIds: z.array(uuid()).min(1).max(50),
})

export const listTagsSchema = z.object({
  search: z.string().optional(),
  color: tagColorSchema.optional(),
  isActive: z.boolean().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export const getEntityTagsSchema = z.object({
  entityType: z.string().trim().min(1).max(100),
  entityId: uuid(),
})

export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
export type AssignTagsInput = z.infer<typeof assignTagsSchema>
export type UnassignTagsInput = z.infer<typeof unassignTagsSchema>
export type ListTagsInput = z.infer<typeof listTagsSchema>
export type GetEntityTagsInput = z.infer<typeof getEntityTagsSchema>