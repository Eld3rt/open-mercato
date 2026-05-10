import {
  Entity,
  PrimaryKey,
  Property,
  Index,
  OptionalProps,
} from '@mikro-orm/core'

@Entity({ tableName: 'shortcuts' })
@Index({ name: 'shortcuts_org_tenant_idx', properties: ['organizationId', 'tenantId'] })
@Index({ name: 'shortcuts_user_idx', properties: ['createdByUserId'] })
@Index({ name: 'shortcuts_order_idx', properties: ['orderIndex'] })
export class Shortcut {
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

  @Property({ type: 'text' })
  url!: string

  @Property({ type: 'varchar', length: 50, nullable: true })
  icon?: string | null

  @Property({ name: 'order_index', type: 'integer', default: 0 })
  orderIndex: number = 0

  @Property({ name: 'is_pinned', type: 'boolean', default: false })
  isPinned: boolean = false

  @Property({ name: 'access_count', type: 'integer', default: 0 })
  accessCount: number = 0

  @Property({ name: 'last_accessed_at', type: Date, nullable: true })
  lastAccessedAt?: Date | null

  @Property({ name: 'created_at', type: Date, onCreate: () => new Date() })
  createdAt: Date = new Date()

  @Property({ name: 'updated_at', type: Date, onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @Property({ name: 'deleted_at', type: Date, nullable: true })
  deletedAt?: Date | null
}