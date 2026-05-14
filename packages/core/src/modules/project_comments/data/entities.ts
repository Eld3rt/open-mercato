import {
  Entity,
  Index,
  OptionalProps,
  PrimaryKey,
  Property,
} from '@mikro-orm/core'

@Entity({ tableName: 'project_comments' })
@Index({ name: 'project_comments_org_tenant_idx', properties: ['organizationId', 'tenantId'] })
@Index({ name: 'project_comments_project_idx', properties: ['projectId'] })
@Index({ name: 'project_comments_task_idx', properties: ['taskId'] })
@Index({ name: 'project_comments_author_idx', properties: ['authorUserId'] })
export class ProjectComment {
  [OptionalProps]?: 'taskId' | 'parentCommentId' | 'updatedAt' | 'deletedAt'

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

  @Property({ name: 'author_user_id', type: 'uuid' })
  authorUserId!: string

  @Property({ name: 'parent_comment_id', type: 'uuid', nullable: true })
  parentCommentId?: string | null

  @Property({ type: 'text' })
  content!: string

  @Property({ name: 'created_at', type: Date, onCreate: () => new Date() })
  createdAt: Date = new Date()

  @Property({ name: 'updated_at', type: Date, onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @Property({ name: 'deleted_at', type: Date, nullable: true })
  deletedAt?: Date | null
}