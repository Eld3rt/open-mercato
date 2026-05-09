import { Migration } from '@mikro-orm/migrations';

export class Migration20260508000000 extends Migration {

  override async up(): Promise<void> {
    // Create tags table
    this.addSql(`create table "tags" ("id" uuid not null default gen_random_uuid(), "organization_id" uuid not null, "tenant_id" uuid not null, "name" varchar(100) not null, "description" varchar(500) null, "color" varchar(20) not null default 'gray', "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "tags_pkey" primary key ("id"));`);

    // Create indexes for tags table
    this.addSql(`create index "tags_org_tenant_idx" on "tags" ("organization_id", "tenant_id");`);
    this.addSql(`alter table "tags" add constraint "tags_org_tenant_name_unique" unique ("organization_id", "tenant_id", "name");`);

    // Create tag_assignments table
    this.addSql(`create table "tag_assignments" ("id" uuid not null default gen_random_uuid(), "organization_id" uuid not null, "tenant_id" uuid not null, "tag_id" uuid not null, "entity_type" varchar(100) not null, "entity_id" uuid not null, "created_at" timestamptz not null default now(), constraint "tag_assignments_pkey" primary key ("id"));`);

    // Create indexes for tag_assignments table
    this.addSql(`create index "tag_assignments_org_tenant_idx" on "tag_assignments" ("organization_id", "tenant_id");`);
    this.addSql(`create index "tag_assignments_tag_idx" on "tag_assignments" ("tag_id");`);
    this.addSql(`create index "tag_assignments_entity_idx" on "tag_assignments" ("entity_type", "entity_id");`);
    this.addSql(`alter table "tag_assignments" add constraint "tag_assignments_unique" unique ("organization_id", "tenant_id", "tag_id", "entity_type", "entity_id");`);

    // Add foreign key constraint
    this.addSql(`alter table "tag_assignments" add constraint "tag_assignments_tag_id_fkey" foreign key ("tag_id") references "tags" ("id") on delete cascade;`);
  }

  override async down(): Promise<void> {
    // Drop foreign key constraint first
    this.addSql(`alter table "tag_assignments" drop constraint "tag_assignments_tag_id_fkey";`);

    // Drop tables
    this.addSql(`drop table "tag_assignments";`);
    this.addSql(`drop table "tags";`);
  }

}