import {
  Entity,
  PrimaryKey,
  Property,
  Index,
  Unique,
  OptionalProps,
} from '@mikro-orm/core'

export type TagColor = 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink'

@Entity({ tableName: 'tags' })
@Index({ name: 'tags_org_tenant_idx', properties: ['organizationId', 'tenantId'] })
@Unique({ name: 'tags_org_tenant_name_idx', properties: ['organizationId', 'tenantId', 'name'] })
export class Tag {
  [OptionalProps]?: 'isActive' | 'createdAt' | 'updatedAt' | 'deletedAt'

  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property({ name: 'organization_id', type: 'uuid' })
  organizationId!: string

  @Property({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string

  @Property({ type: 'varchar', length: 100 })
  name!: string

  @Property({ type: 'varchar', length: 500, nullable: true })
  description?: string

  @Property({ type: 'varchar', length: 20, default: 'gray' })
  color!: TagColor

  @Property({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean

  @Property({ name: 'created_at', type: 'timestamptz', defaultRaw: 'now()' })
  createdAt!: Date

  @Property({ name: 'updated_at', type: 'timestamptz', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt!: Date

  @Property({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date
}

@Entity({ tableName: 'tag_assignments' })
@Index({ name: 'tag_assignments_org_tenant_idx', properties: ['organizationId', 'tenantId'] })
@Index({ name: 'tag_assignments_tag_idx', properties: ['tagId'] })
@Index({ name: 'tag_assignments_entity_idx', properties: ['entityType', 'entityId'] })
@Unique({ name: 'tag_assignments_unique_idx', properties: ['organizationId', 'tenantId', 'tagId', 'entityType', 'entityId'] })
export class TagAssignment {
  [OptionalProps]?: 'createdAt'

  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property({ name: 'organization_id', type: 'uuid' })
  organizationId!: string

  @Property({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string

  @Property({ name: 'tag_id', type: 'uuid' })
  tagId!: string

  @Property({ name: 'entity_type', type: 'varchar', length: 100 })
  entityType!: string

  @Property({ name: 'entity_id', type: 'uuid' })
  entityId!: string

  @Property({ name: 'created_at', type: 'timestamptz', defaultRaw: 'now()' })
  createdAt!: Date
}