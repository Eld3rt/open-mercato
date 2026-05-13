import {
  Entity,
  PrimaryKey,
  Property,
  Index,
  OptionalProps,
} from '@mikro-orm/core'

@Entity({ tableName: 'projects' })
@Index({ name: 'projects_org_tenant_idx', properties: ['organizationId', 'tenantId'] })
@Index({ name: 'projects_user_idx', properties: ['createdByUserId'] })
export class Project {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'deletedAt'

  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property({ name: 'organization_id', type: 'uuid' })
  organizationId!: string

  @Property({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string

  @Property({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId!: string

  @Property({ type: 'varchar', length: 100 })
  name!: string

  @Property({ type: 'text', nullable: true })
  description?: string | null

  @Property({ name: 'status', type: 'varchar', length: 20, default: 'active' })
  status: string = 'active'

  @Property({ name: 'priority', type: 'varchar', length: 20, default: 'medium' })
  priority: string = 'medium'

  @Property({ name: 'start_date', type: Date, nullable: true })
  startDate?: Date | null

  @Property({ name: 'due_date', type: Date, nullable: true })
  dueDate?: Date | null

  @Property({ name: 'progress_percentage', type: 'integer', default: 0 })
  progressPercentage: number = 0

  @Property({ name: 'created_at', type: Date, onCreate: () => new Date() })
  createdAt: Date = new Date()

  @Property({ name: 'updated_at', type: Date, onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @Property({ name: 'deleted_at', type: Date, nullable: true })
  deletedAt?: Date | null
}