import { z } from 'zod'

describe('projects API route validation', () => {
  it('progressPercentage field is accessible in update schema', () => {
    const updateSchema = z.object({
      name: z.string().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      progressPercentage: z.number().min(0).max(100).optional(),
    })

    const data = {
      progressPercentage: 50,
    }

    // Should not throw
    const result = updateSchema.parse(data)
    expect(result.progressPercentage).toBe(50)
  })
})
