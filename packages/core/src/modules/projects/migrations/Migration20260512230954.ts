import { Migration } from '@mikro-orm/migrations'

export class Migration20260512230954 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create table "projects" (
        "id" uuid not null default gen_random_uuid(),
        "organization_id" uuid not null,
        "tenant_id" uuid not null,
        "created_by_user_id" uuid not null,
        "name" varchar(100) not null,
        "description" text null,
        "status" varchar(20) not null default 'active',
        "priority" varchar(20) not null default 'medium',
        "start_date" timestamptz null,
        "due_date" timestamptz null,
        "progress_percentage" int not null default 0,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        "deleted_at" timestamptz null,
        constraint "projects_pkey" primary key ("id")
      );
    `)

    this.addSql(`
      create index "projects_org_tenant_idx" on "projects" ("organization_id", "tenant_id");
    `)

    this.addSql(`
      create index "projects_user_idx" on "projects" ("created_by_user_id");
    `)
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "projects" cascade;`)
  }
}