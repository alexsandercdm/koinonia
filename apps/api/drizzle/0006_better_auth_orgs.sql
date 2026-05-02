ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "active_organization_id" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "logo" text,
  "metadata" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "member" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "organization_id" text NOT NULL,
  "role" varchar(30) DEFAULT 'MEMBRO' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invitation" (
  "id" text PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "inviter_id" text NOT NULL,
  "organization_id" text NOT NULL,
  "team_id" text,
  "role" varchar(30) DEFAULT 'MEMBRO' NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'member_user_id_user_id_fk'
  ) THEN
    ALTER TABLE "member"
      ADD CONSTRAINT "member_user_id_user_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")
      ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'member_organization_id_organization_id_fk'
  ) THEN
    ALTER TABLE "member"
      ADD CONSTRAINT "member_organization_id_organization_id_fk"
      FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id")
      ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invitation_inviter_id_user_id_fk'
  ) THEN
    ALTER TABLE "invitation"
      ADD CONSTRAINT "invitation_inviter_id_user_id_fk"
      FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id")
      ON DELETE no action ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invitation_organization_id_organization_id_fk'
  ) THEN
    ALTER TABLE "invitation"
      ADD CONSTRAINT "invitation_organization_id_organization_id_fk"
      FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id")
      ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_orgId_idx" ON "member" USING btree ("organization_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_userId_idx" ON "member" USING btree ("user_id");
