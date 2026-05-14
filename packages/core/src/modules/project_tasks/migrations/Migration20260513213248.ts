import { Migration } from '@mikro-orm/migrations'

export class Migration20260513213248 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create table "project_tasks" (
        "id" uuid not null default gen_random_uuid(),
        "organization_id" uuid not null,
        "tenant_id" uuid not null,
        "project_id" uuid not null,
        "created_by_user_id" uuid not null,
        "assigned_to_user_id" uuid null,
        "title" varchar(150) not null,
        "description" text null,
        "status" varchar(20) not null default 'todo',
        "priority" varchar(20) not null default 'medium',
        "due_date" timestamptz null,
        "completed_at" timestamptz null,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        "deleted_at" timestamptz null,
        constraint "project_tasks_pkey" primary key ("id")
      );
    `)

    this.addSql(`create index "project_tasks_org_tenant_idx" on "project_tasks" ("organization_id", "tenant_id");`)
    this.addSql(`create index "project_tasks_project_idx" on "project_tasks" ("project_id");`)
    this.addSql(`create index "project_tasks_assigned_idx" on "project_tasks" ("assigned_to_user_id");`)
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "project_tasks" cascade;')
  }
}
