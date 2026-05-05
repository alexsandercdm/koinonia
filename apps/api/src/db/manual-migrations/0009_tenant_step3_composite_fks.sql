-- Existing-database migration for Phase 8.5 Task 7.
--
-- Requires the composite unique indexes from Task 6.
-- Corrects pessoas.lider_pessoa_id to UUID before adding its composite FK:
-- the design spec points to pessoas.id, which is UUID.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pessoas'
      AND column_name = 'lider_pessoa_id'
      AND udt_name <> 'uuid'
  ) THEN
    ALTER TABLE "pessoas"
      ALTER COLUMN "lider_pessoa_id" TYPE uuid
      USING NULLIF("lider_pessoa_id", '')::uuid;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_inscricoes_evento_org'
  ) THEN
    ALTER TABLE "inscricoes"
      ADD CONSTRAINT "fk_inscricoes_evento_org"
      FOREIGN KEY ("organization_id", "evento_id")
      REFERENCES "eventos" ("organization_id", "id");
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_inscricoes_pessoa_org'
  ) THEN
    ALTER TABLE "inscricoes"
      ADD CONSTRAINT "fk_inscricoes_pessoa_org"
      FOREIGN KEY ("organization_id", "pessoa_id")
      REFERENCES "pessoas" ("organization_id", "id");
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_lider_pessoa_org'
  ) THEN
    ALTER TABLE "pessoas"
      ADD CONSTRAINT "fk_lider_pessoa_org"
      FOREIGN KEY ("organization_id", "lider_pessoa_id")
      REFERENCES "pessoas" ("organization_id", "id");
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_eventos_local_org'
  ) THEN
    ALTER TABLE "eventos"
      ADD CONSTRAINT "fk_eventos_local_org"
      FOREIGN KEY ("organization_id", "local_id")
      REFERENCES "locais" ("organization_id", "id");
  END IF;
END $$;
