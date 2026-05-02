-- Existing-database migration for Phase 8.5 Task 6.
--
-- Requires the Task 5 default-organization backfill to have completed.
-- This step makes tenant ownership mandatory on root domain tables and
-- creates indexes needed for tenant-scoped lookups and later composite FKs.

ALTER TABLE "pessoas" ALTER COLUMN "organization_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "eventos" ALTER COLUMN "organization_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "inscricoes" ALTER COLUMN "organization_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "locais" ALTER COLUMN "organization_id" SET NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pessoas_org_fk'
  ) THEN
    ALTER TABLE "pessoas"
      ADD CONSTRAINT "pessoas_org_fk"
      FOREIGN KEY ("organization_id") REFERENCES "organization"("id");
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'eventos_org_fk'
  ) THEN
    ALTER TABLE "eventos"
      ADD CONSTRAINT "eventos_org_fk"
      FOREIGN KEY ("organization_id") REFERENCES "organization"("id");
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inscricoes_org_fk'
  ) THEN
    ALTER TABLE "inscricoes"
      ADD CONSTRAINT "inscricoes_org_fk"
      FOREIGN KEY ("organization_id") REFERENCES "organization"("id");
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'locais_org_fk'
  ) THEN
    ALTER TABLE "locais"
      ADD CONSTRAINT "locais_org_fk"
      FOREIGN KEY ("organization_id") REFERENCES "organization"("id");
  END IF;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "eventos_org_id_uidx" ON "eventos" ("organization_id", "id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pessoas_org_id_uidx" ON "pessoas" ("organization_id", "id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "locais_org_id_uidx" ON "locais" ("organization_id", "id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "inscricoes_org_id_uidx" ON "inscricoes" ("organization_id", "id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pessoas_org_lider_idx" ON "pessoas" ("organization_id", "lider_pessoa_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "eventos_org_status_idx" ON "eventos" ("organization_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inscricoes_org_evento_idx" ON "inscricoes" ("organization_id", "evento_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inscricoes_org_pessoa_idx" ON "inscricoes" ("organization_id", "pessoa_id");
