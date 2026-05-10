import { z } from 'zod'

export const shortcutCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().optional(),
  url: z.string().url(),
  icon: z.string().max(50).optional(),
  isPinned: z.boolean().default(false),
})

export const shortcutUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().optional(),
  url: z.string().url().optional(),
  icon: z.string().max(50).optional(),
  isPinned: z.boolean().optional(),
  orderIndex: z.number().int().optional(),
})

export const shortcutQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'created', 'accessed', 'pinned']).default('pinned'),
  onlyPinned: z.string().optional(),
})

export const shortcutBatchReorderSchema = z.object({
  shortcuts: z.array(z.object({
    id: z.string().uuid(),
    orderIndex: z.number().int(),
  })),
})

export type ShortcutCreateInput = z.infer<typeof shortcutCreateSchema>
export type ShortcutUpdateInput = z.infer<typeof shortcutUpdateSchema>
export type ShortcutQueryInput = z.infer<typeof shortcutQuerySchema>
export type ShortcutBatchReorderInput = z.infer<typeof shortcutBatchReorderSchema>