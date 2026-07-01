import { z } from 'zod'
import { createTimeEntrySchema, updateTimeEntrySchema } from '../data/validators'

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

  it('accepts null taskId and description for create schema', () => {
    const parsed = createTimeEntrySchema.parse({
      projectId: '00000000-0000-0000-0000-000000000000',
      taskId: null,
      description: null,
    })

    expect(parsed.taskId).toBeNull()
    expect(parsed.description).toBeNull()
  })

  it('accepts null taskId and description for update schema', () => {
    const parsed = updateTimeEntrySchema.parse({
      id: '00000000-0000-0000-0000-000000000000',
      taskId: null,
      description: null,
    })

    expect(parsed.taskId).toBeNull()
    expect(parsed.description).toBeNull()
  })
})
