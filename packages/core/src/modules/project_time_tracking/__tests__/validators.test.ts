import { z } from 'zod'
import { createTimeEntrySchema } from '../data/validators'

describe('project_time_tracking time entry validators', () => {
  it('accepts null endedAt for create schema', () => {
    const parsed = createTimeEntrySchema.parse({
      projectId: '00000000-0000-0000-0000-000000000000',
      endedAt: null,
    })

    expect(parsed.endedAt).toBeNull()
  })

  it('still accepts omitted endedAt for create schema', () => {
    const parsed = createTimeEntrySchema.parse({
      projectId: '00000000-0000-0000-0000-000000000000',
    })

    expect(parsed.endedAt).toBeUndefined()
  })
})
