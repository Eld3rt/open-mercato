import { Migration } from '@mikro-orm/migrations';

export class Migration20260509000000 extends Migration {

  override async up(): Promise<void> {
    // Create reminders table
    this.addSql(`create table "reminders" ("id" uuid not null default gen_random_uuid(), "organization_id" uuid not null, "tenant_id" uuid not null, "title" varchar(200) not null, "description" text null, "due_at" timestamptz null, "priority" text not null default 'medium', "status" text not null default 'pending', "assigned_to_user_id" uuid null, "created_by_user_id" uuid null, "completed_at" timestamptz null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "reminders_pkey" primary key ("id"));`);

    // Create indexes for reminders table
    this.addSql(`create index "reminders_org_tenant_idx" on "reminders" ("organization_id", "tenant_id");`);
    this.addSql(`create index "reminders_due_at_idx" on "reminders" ("due_at");`);
    this.addSql(`create index "reminders_assigned_to_idx" on "reminders" ("assigned_to_user_id");`);

    // Create reminder_assignments table
    this.addSql(`create table "reminder_assignments" ("id" uuid not null default gen_random_uuid(), "organization_id" uuid not null, "tenant_id" uuid not null, "reminder_id" uuid not null, "entity_type" varchar(100) not null, "entity_id" uuid not null, "created_at" timestamptz not null default now(), constraint "reminder_assignments_pkey" primary key ("id"));`);

    // Create indexes for reminder_assignments table
    this.addSql(`create index "reminder_assignments_org_tenant_idx" on "reminder_assignments" ("organization_id", "tenant_id");`);
    this.addSql(`create index "reminder_assignments_reminder_idx" on "reminder_assignments" ("reminder_id");`);
    this.addSql(`create index "reminder_assignments_entity_idx" on "reminder_assignments" ("entity_type", "entity_id");`);
    this.addSql(`alter table "reminder_assignments" add constraint "reminder_assignments_unique" unique ("organization_id", "tenant_id", "reminder_id", "entity_type", "entity_id");`);

    // Add foreign key constraint
    this.addSql(`alter table "reminder_assignments" add constraint "reminder_assignments_reminder_id_fkey" foreign key ("reminder_id") references "reminders" ("id") on delete cascade;`);
  }

  override async down(): Promise<void> {
    // Drop foreign key constraint first
    this.addSql(`alter table "reminder_assignments" drop constraint "reminder_assignments_reminder_id_fkey";`);

    // Drop tables
    this.addSql(`drop table "reminder_assignments";`);
    this.addSql(`drop table "reminders";`);
  }

}