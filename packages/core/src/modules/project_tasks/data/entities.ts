import {
  Entity,
  Index,
  OptionalProps,
  PrimaryKey,
  Property,
} from '@mikro-orm/core'

@Entity({ tableName: 'project_tasks' })
@Index({ name: 'project_tasks_org_tenant_idx', properties: ['organizationId', 'tenantId'] })
@Index({ name: 'project_tasks_project_idx', properties: ['projectId'] })
@Index({ name: 'project_tasks_assigned_idx', properties: ['assignedToUserId'] })
export class ProjectTask {
  [OptionalProps]?: 'assignedToUserId' | 'description' | 'dueDate' | 'completedAt' | 'deletedAt' | 'updatedAt'

  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property({ name: 'organization_id', type: 'uuid' })
  organizationId!: string

  @Property({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string

  @Property({ name: 'project_id', type: 'uuid' })
  projectId!: string

  @Property({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId!: string

  @Property({ name: 'assigned_to_user_id', type: 'uuid', nullable: true })
  assignedToUserId?: string | null

  @Property({ type: 'varchar', length: 150 })
  title!: string

  @Property({ type: 'text', nullable: true })
  description?: string | null

  @Property({ type: 'varchar', length: 20, default: 'todo' })
  status: string = 'todo'

  @Property({ type: 'varchar', length: 20, default: 'medium' })
  priority: string = 'medium'

  @Property({ name: 'due_date', type: Date, nullable: true })
  dueDate?: Date | null

  @Property({ name: 'completed_at', type: Date, nullable: true })
  completedAt?: Date | null

  @Property({ name: 'created_at', type: Date, onCreate: () => new Date() })
  createdAt: Date = new Date()

  @Property({ name: 'updated_at', type: Date, onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @Property({ name: 'deleted_at', type: Date, nullable: true })
  deletedAt?: Date | null
}
