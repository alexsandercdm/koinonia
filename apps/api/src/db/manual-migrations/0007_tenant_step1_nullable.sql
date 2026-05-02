-- Existing-database migration for Phase 8.5 Task 4.
--
-- Step 1 adds nullable tenant linkage columns only. Do not add NOT NULL
-- constraints or foreign keys until backfill and tenant enforcement are ready.

ALTER TABLE "pessoas" ADD COLUMN IF NOT EXISTS "organization_id" text;
--> statement-breakpoint
ALTER TABLE "pessoas" ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
ALTER TABLE "pessoas" ADD COLUMN IF NOT EXISTS "lider_pessoa_id" text;
--> statement-breakpoint
ALTER TABLE "eventos" ADD COLUMN IF NOT EXISTS "organization_id" text;
--> statement-breakpoint
ALTER TABLE "inscricoes" ADD COLUMN IF NOT EXISTS "organization_id" text;
--> statement-breakpoint
ALTER TABLE "locais" ADD COLUMN IF NOT EXISTS "organization_id" text;
