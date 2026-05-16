import { Migration } from '@mikro-orm/migrations'

export class Migration20260515192449 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create table "project_time_entries" (
        "id" uuid not null default gen_random_uuid(),
        "organization_id" uuid not null,
        "tenant_id" uuid not null,
        "project_id" uuid not null,
        "task_id" uuid null,
        "user_id" uuid not null,
        "description" text null,
        "started_at" timestamptz not null,
        "ended_at" timestamptz null,
        "duration_minutes" int null,
        "status" varchar(20) not null default 'running',
        "billable" boolean not null default true,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        "deleted_at" timestamptz null,
        constraint "project_time_entries_pkey" primary key ("id")
      );
    `)

    this.addSql(
      `create index "project_time_entries_org_tenant_idx" on "project_time_entries" ("organization_id", "tenant_id");`,
    )
    this.addSql(`create index "project_time_entries_project_idx" on "project_time_entries" ("project_id");`)
    this.addSql(`create index "project_time_entries_task_idx" on "project_time_entries" ("task_id");`)
    this.addSql(`create index "project_time_entries_user_idx" on "project_time_entries" ("user_id");`)
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "project_time_entries" cascade;')
  }
}
