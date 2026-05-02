-- Existing-database migration for Phase 8.5 Task 8.
--
-- Adds final database-level tenant invariants for organization leadership.

CREATE UNIQUE INDEX IF NOT EXISTS "one_president_per_org"
  ON "member" ("organization_id")
  WHERE "role" = 'PRESIDENTE';
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'no_self_leadership'
  ) THEN
    ALTER TABLE "pessoas"
      ADD CONSTRAINT "no_self_leadership"
      CHECK ("lider_pessoa_id" IS NULL OR "lider_pessoa_id" <> "id");
  END IF;
END $$;
