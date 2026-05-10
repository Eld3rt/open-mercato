import {
  Entity,
  PrimaryKey,
  Property,
  Index,
  Unique,
  OptionalProps,
} from '@mikro-orm/core'

export type ReminderPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ReminderStatus = 'pending' | 'completed' | 'cancelled'

@Entity({ tableName: 'reminders' })
@Index({ name: 'reminders_org_tenant_idx', properties: ['organizationId', 'tenantId'] })
@Index({ name: 'reminders_due_at_idx', properties: ['dueAt'] })
@Index({ name: 'reminders_assigned_to_idx', properties: ['assignedToUserId'] })
export class Reminder {
  [OptionalProps]?: 'isActive' | 'createdAt' | 'updatedAt' | 'deletedAt'

  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property({ name: 'organization_id', type: 'uuid' })
  organizationId!: string

  @Property({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string

  @Property({ type: 'text' })
  title!: string

  @Property({ type: 'text', nullable: true })
  description?: string | null

  @Property({ name: 'due_at', type: Date, nullable: true })
  dueAt?: Date | null

  @Property({ name: 'priority', type: 'text', default: 'medium' })
  priority: ReminderPriority = 'medium'

  @Property({ name: 'status', type: 'text', default: 'pending' })
  status: ReminderStatus = 'pending'

  @Property({ name: 'assigned_to_user_id', type: 'uuid', nullable: true })
  assignedToUserId?: string | null

  @Property({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId?: string | null

  @Property({ name: 'completed_at', type: Date, nullable: true })
  completedAt?: Date | null

  @Property({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean = true

  @Property({ name: 'created_at', type: Date, onCreate: () => new Date() })
  createdAt: Date = new Date()

  @Property({ name: 'updated_at', type: Date, onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @Property({ name: 'deleted_at', type: Date, nullable: true })
  deletedAt?: Date | null
}

@Entity({ tableName: 'reminder_assignments' })
@Index({ name: 'reminder_assignments_org_tenant_idx', properties: ['organizationId', 'tenantId'] })
@Index({ name: 'reminder_assignments_reminder_idx', properties: ['reminderId'] })
@Index({ name: 'reminder_assignments_entity_idx', properties: ['entityType', 'entityId'] })
@Unique({ name: 'reminder_assignments_unique', properties: ['organizationId', 'tenantId', 'reminderId', 'entityType', 'entityId'] })
export class ReminderAssignment {
  [OptionalProps]?: 'createdAt'

  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property({ name: 'organization_id', type: 'uuid' })
  organizationId!: string

  @Property({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string

  @Property({ name: 'reminder_id', type: 'uuid' })
  reminderId!: string

  @Property({ name: 'entity_type', type: 'varchar', length: 100 })
  entityType!: string

  @Property({ name: 'entity_id', type: 'uuid' })
  entityId!: string

  @Property({ name: 'created_at', type: Date, onCreate: () => new Date() })
  createdAt: Date = new Date()
}