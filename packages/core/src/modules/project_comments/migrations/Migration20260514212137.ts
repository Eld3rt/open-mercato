import { Migration } from '@mikro-orm/migrations'

export class Migration20260514212137 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create table "project_comments" (
        "id" uuid not null default gen_random_uuid(),
        "organization_id" uuid not null,
        "tenant_id" uuid not null,
        "project_id" uuid not null,
        "task_id" uuid null,
        "author_user_id" uuid not null,
        "parent_comment_id" uuid null,
        "content" text not null,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        "deleted_at" timestamptz null,
        constraint "project_comments_pkey" primary key ("id")
      );
    `)

    this.addSql(`create index "project_comments_org_tenant_idx" on "project_comments" ("organization_id", "tenant_id");`)
    this.addSql(`create index "project_comments_project_idx" on "project_comments" ("project_id");`)
    this.addSql(`create index "project_comments_task_idx" on "project_comments" ("task_id");`)
    this.addSql(`create index "project_comments_author_idx" on "project_comments" ("author_user_id");`)
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "project_comments" cascade;')
  }
}