import { Migration } from '@mikro-orm/migrations';

export class Migration20260510000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "shortcuts" ("id" uuid not null default gen_random_uuid(), "organization_id" uuid not null, "tenant_id" uuid not null, "created_by_user_id" uuid not null, "name" varchar(100) not null, "description" text null, "url" text not null, "icon" varchar(50) null, "order_index" integer not null default 0, "is_pinned" boolean not null default false, "access_count" integer not null default 0, "last_accessed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "shortcuts_pkey" primary key ("id"));`);

    this.addSql(`create index "shortcuts_org_tenant_idx" on "shortcuts" ("organization_id", "tenant_id");`);
    this.addSql(`create index "shortcuts_user_idx" on "shortcuts" ("created_by_user_id");`);
    this.addSql(`create index "shortcuts_order_idx" on "shortcuts" ("order_index");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table "shortcuts";`);
  }

}