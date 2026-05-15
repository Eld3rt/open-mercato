import { Entity, Index, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'project_time_entries' })
@Index({ name: 'project_time_entries_org_tenant_idx', properties: ['organizationId', 'tenantId'] })
@Index({ name: 'project_time_entries_project_idx', properties: ['projectId'] })
@Index({ name: 'project_time_entries_task_idx', properties: ['taskId'] })
@Index({ name: 'project_time_entries_user_idx', properties: ['userId'] })
export class ProjectTimeEntry {
  [OptionalProps]?: 'taskId' | 'description' | 'endedAt' | 'durationMinutes' | 'updatedAt' | 'deletedAt'

  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property({ name: 'organization_id', type: 'uuid' })
  organizationId!: string

  @Property({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string

  @Property({ name: 'project_id', type: 'uuid' })
  projectId!: string

  @Property({ name: 'task_id', type: 'uuid', nullable: true })
  taskId?: string | null

  @Property({ name: 'user_id', type: 'uuid' })
  userId!: string

  @Property({ type: 'text', nullable: true })
  description?: string | null

  @Property({ name: 'started_at', type: Date })
  startedAt!: Date

  @Property({ name: 'ended_at', type: Date, nullable: true })
  endedAt?: Date | null

  @Property({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes?: number | null

  @Property({ type: 'varchar', length: 20, default: 'running' })
  status: string = 'running'

  @Property({ type: 'boolean', default: true })
  billable: boolean = true

  @Property({ name: 'created_at', type: Date, onCreate: () => new Date() })
  createdAt: Date = new Date()

  @Property({ name: 'updated_at', type: Date, onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @Property({ name: 'deleted_at', type: Date, nullable: true })
  deletedAt?: Date | null
}
