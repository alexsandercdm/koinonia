# Phase 8.5 — Multi-Tenant Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce row-level multi-tenancy into Koinonia — adding `organization_id` isolation to all domain tables, enabling the Better Auth Organizations plugin, building the TenantMiddleware + BaseRepository + PermissionResolver, and shipping the org creation/switching UI.

**Architecture:** Row-level isolation via `organization_id` on all tenant tables; FK compostas prevent cross-tenant references at DB level; `activeOrganizationId` sourced exclusively from the server-side Better Auth session (never from headers/body); `PermissionResolver` is the sole authorization function; `BaseRepository` auto-injects `organization_id` into every query.

**Tech Stack:** PostgreSQL (Drizzle ORM + raw SQL for FK compostas and partial indexes), Fastify, Better Auth v1.5.6 + Organizations plugin, React + TanStack Query v5, TypeScript.

---

## File Map

### New files

| Path | Responsibility |
|---|---|
| `apps/api/drizzle/0006_tenant_step1_nullable.sql` | Add nullable `organization_id`, `user_id`, `lider_pessoa_id` to domain tables |
| `apps/api/drizzle/0007_tenant_step2_not_null.sql` | Make `organization_id` NOT NULL; create unique composite indexes |
| `apps/api/drizzle/0008_tenant_step3_fk_compostas.sql` | Add composite FK constraints (inscricoes↔eventos, inscricoes↔pessoas, lider_pessoa_id) |
| `apps/api/drizzle/0009_tenant_step4_constraints.sql` | Partial unique index `one_president_per_org`; CHECK `lider_pessoa_id <> id` |
| `apps/api/src/scripts/backfill-default-org.ts` | Create default org + assign `organization_id` to all existing rows |
| `apps/api/src/lib/tenant/errors.ts` | `MissingTenantContextError` class |
| `apps/api/src/lib/tenant/types.ts` | `OrgRole`, `Operation`, `ResourceScope` enums/types + `TenantContext` interface |
| `apps/api/src/lib/tenant/base-repository.ts` | `BaseRepository` abstract class with auto org guard |
| `apps/api/src/lib/tenant/permission-resolver.ts` | Pure `PermissionResolver` function — sole authorization source |
| `apps/api/src/middleware/tenant.ts` | Fastify `TenantMiddleware` plugin |
| `apps/api/src/modules/organizations/routes/organizations.ts` | Organization routes |
| `apps/api/src/modules/organizations/controllers/OrganizationController.ts` | Org HTTP handlers |
| `apps/api/src/modules/organizations/usecases/CreateOrganizationUseCase.ts` | Create org + assign PRESIDENTE role |
| `apps/api/src/modules/organizations/usecases/InviteMemberUseCase.ts` | Send invitation via Better Auth |
| `apps/api/src/modules/organizations/usecases/UpdateMemberRoleUseCase.ts` | Change member role (with president guard) |
| `apps/api/src/modules/organizations/usecases/TransferPresidencyUseCase.ts` | Atomic presidency transfer |
| `apps/api/src/modules/organizations/usecases/GetMembersUseCase.ts` | List org members |
| `apps/api/src/modules/pessoas/repositories/PessoasRepository.ts` | Tenant-aware pessoas repo with `findSubtree` CTE |
| `apps/api/src/tests/tenant-isolation.test.ts` | Integration tests for INV-01 through INV-10 |
| `apps/api/src/tests/rbac.test.ts` | RBAC matrix tests by role + operation |
| `apps/api/src/tests/transfer-presidency.test.ts` | Atomic transfer + rollback tests |
| `apps/web/src/contexts/org-context.tsx` | `OrgContext` — exposes `activeOrgId`, `userRole` |
| `apps/web/src/components/layout/OrgSwitcher.tsx` | Org picker that calls `set-active` + clears query cache |
| `apps/web/src/pages/OnboardingPage.tsx` | Self-service org creation form |
| `apps/web/src/pages/MembersPage.tsx` | Members list + invite + role management |
| `apps/web/src/hooks/use-org.ts` | Hooks: `useOrg`, `useCreateOrg`, `useInviteMember`, `useUpdateMemberRole` |

### Modified files

| Path | Change |
|---|---|
| `apps/api/src/db/auth-schema.ts` | Add `organization`, `member`, `invitation` tables (Better Auth Organizations) |
| `apps/api/src/db/schema.ts` | Add `organization_id`, `user_id`, `lider_pessoa_id` columns; update Drizzle types |
| `apps/api/src/config/auth.ts` | Enable `organization` plugin; wire SMTP for invites |
| `apps/api/src/middleware/auth.ts` | Extend session read to include `activeOrganizationId` |
| `apps/api/src/app.ts` | Register `TenantMiddleware` and organization routes |
| `apps/api/src/modules/acomodacoes/repositories/AcomodacaoRepository.ts` | Extend `BaseRepository`; add orgId to all queries |
| `apps/api/src/modules/inscricoes/repositories/EventoRepository.ts` | Extend `BaseRepository`; add orgId to all queries |
| `apps/api/src/modules/inscricoes/repositories/InscricaoRepository.ts` | Extend `BaseRepository`; add orgId to all queries |
| `apps/api/src/modules/inscricoes/repositories/PagamentoRepository.ts` | Extend `BaseRepository` |
| `apps/api/src/modules/financeiro/repositories/FinanceiroRepository.ts` | Extend `BaseRepository` |
| `apps/api/src/modules/admin/repositories/AuditLogRepository.ts` | Extend `BaseRepository` |
| All route files under `apps/api/src/modules/*/routes/` | Pass `ctx` from request to use cases |
| `apps/web/src/lib/auth.ts` | Add `organizationClient` plugin |
| `apps/web/src/hooks/use-eventos.ts` | Prefix query keys with `['org', orgId, ...]` |
| `apps/web/src/hooks/use-participantes.ts` | Prefix query keys with `['org', orgId, ...]` |
| `apps/web/src/hooks/use-inscricoes.ts` | Prefix query keys with `['org', orgId, ...]` |
| `apps/web/src/hooks/use-acomodacoes.ts` | Prefix query keys with `['org', orgId, ...]` |
| `apps/web/src/components/layout/AppLayout.tsx` | Add `OrgSwitcher` to header |
| `apps/web/src/App.tsx` | Add `OnboardingPage` and `MembersPage` routes; wrap with `OrgProvider` |

---

## Task 1: Migration step 1 — add nullable columns to domain tables

**Files:**
- Create: `apps/api/drizzle/0006_tenant_step1_nullable.sql`

- [ ] **Step 1: Write the SQL migration file**

```sql
-- 0006_tenant_step1_nullable.sql
-- Adds nullable organization_id, user_id, lider_pessoa_id to domain tables.
-- NOT NULL comes in the next migration after backfill.

ALTER TABLE "pessoas"
  ADD COLUMN "organization_id" uuid,
  ADD COLUMN "user_id" text,
  ADD COLUMN "lider_pessoa_id" uuid;

ALTER TABLE "eventos"
  ADD COLUMN "organization_id" uuid;

ALTER TABLE "inscricoes"
  ADD COLUMN "organization_id" uuid;

ALTER TABLE "locais"
  ADD COLUMN "organization_id" uuid;
```

- [ ] **Step 2: Run the migration**

```bash
cd apps/api && pnpm db:migrate
```

Expected: Migration applies with no errors. Schema now has nullable `organization_id` on `pessoas`, `eventos`, `inscricoes`, `locais`.

- [ ] **Step 3: Verify migration applied**

```bash
cd apps/api && pnpm db:studio
```

Open Drizzle Studio and confirm the four tables each have the new nullable columns.

- [ ] **Step 4: Commit**

```bash
git add apps/api/drizzle/0006_tenant_step1_nullable.sql
git commit -m "feat(db): add nullable organization_id columns to domain tables (step 1/4)"
```

---

## Task 2: Backfill script — create default org and assign organization_id

**Files:**
- Create: `apps/api/src/scripts/backfill-default-org.ts`

- [ ] **Step 1: Write the backfill script**

```typescript
// apps/api/src/scripts/backfill-default-org.ts
// Idempotent: safe to run multiple times.
// Creates a default org and assigns all existing rows to it.

import 'dotenv/config'
import { db } from '../db'
import { sql } from 'drizzle-orm'

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'
const DEFAULT_ORG_NAME = 'Igreja Padrão'
const DEFAULT_ORG_SLUG = 'igreja-padrao'

async function backfill() {
  console.log('Starting backfill...')

  // 1. Insert default org if it doesn't exist (Better Auth manages the organizations table)
  await db.execute(sql`
    INSERT INTO organization (id, name, slug, created_at, updated_at)
    VALUES (
      ${DEFAULT_ORG_ID},
      ${DEFAULT_ORG_NAME},
      ${DEFAULT_ORG_SLUG},
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING
  `)

  // 2. Backfill all tables where organization_id is null
  const tables = ['pessoas', 'eventos', 'inscricoes', 'locais'] as const

  for (const table of tables) {
    const result = await db.execute(sql.raw(`
      UPDATE "${table}"
      SET organization_id = '${DEFAULT_ORG_ID}'
      WHERE organization_id IS NULL
    `))
    console.log(`  ${table}: updated ${(result as any).rowCount ?? '?'} rows`)
  }

  console.log('Backfill complete.')
  process.exit(0)
}

backfill().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
```

- [ ] **Step 2: Add backfill script to package.json**

In `apps/api/package.json`, add inside `"scripts"`:

```json
"db:backfill": "tsx src/scripts/backfill-default-org.ts"
```

- [ ] **Step 3: Run the backfill against the development database**

```bash
cd apps/api && pnpm db:backfill
```

Expected output:
```
Starting backfill...
  pessoas: updated N rows
  eventos: updated N rows
  inscricoes: updated N rows
  locais: updated N rows
Backfill complete.
```

- [ ] **Step 4: Verify no nulls remain**

Open Drizzle Studio and confirm `organization_id IS NOT NULL` for all rows in the four tables.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/scripts/backfill-default-org.ts apps/api/package.json
git commit -m "feat(db): add idempotent backfill script for default organization"
```

---

## Task 3: Migration step 2 — NOT NULL + unique composite indexes

**Files:**
- Create: `apps/api/drizzle/0007_tenant_step2_not_null.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 0007_tenant_step2_not_null.sql
-- Requires: backfill already ran (no nulls in organization_id columns).

-- Make organization_id NOT NULL on all tenant tables
ALTER TABLE "pessoas"    ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "eventos"    ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "inscricoes" ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "locais"     ALTER COLUMN "organization_id" SET NOT NULL;

-- Add FK references to organization table
ALTER TABLE "pessoas"    ADD CONSTRAINT "pessoas_organization_id_fk"    FOREIGN KEY ("organization_id") REFERENCES "organization"("id");
ALTER TABLE "eventos"    ADD CONSTRAINT "eventos_organization_id_fk"    FOREIGN KEY ("organization_id") REFERENCES "organization"("id");
ALTER TABLE "inscricoes" ADD CONSTRAINT "inscricoes_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id");
ALTER TABLE "locais"     ADD CONSTRAINT "locais_organization_id_fk"     FOREIGN KEY ("organization_id") REFERENCES "organization"("id");

-- Unique composite indexes (prerequisite for FK compostas in step 3)
CREATE UNIQUE INDEX "eventos_org_id_unique"   ON "eventos"   ("organization_id", "id");
CREATE UNIQUE INDEX "pessoas_org_id_unique"   ON "pessoas"   ("organization_id", "id");
CREATE UNIQUE INDEX "locais_org_id_unique"    ON "locais"    ("organization_id", "id");

-- Performance indexes
CREATE INDEX "pessoas_org_lider_idx"    ON "pessoas"   ("organization_id", "lider_pessoa_id");
CREATE INDEX "eventos_org_status_idx"   ON "eventos"   ("organization_id", "status");
CREATE INDEX "inscricoes_org_evento_idx" ON "inscricoes" ("organization_id", "evento_id");
```

- [ ] **Step 2: Run the migration**

```bash
cd apps/api && pnpm db:migrate
```

Expected: Migration applies successfully. If it fails with "null value", the backfill in Task 2 was incomplete — re-run `pnpm db:backfill` first.

- [ ] **Step 3: Commit**

```bash
git add apps/api/drizzle/0007_tenant_step2_not_null.sql
git commit -m "feat(db): make organization_id NOT NULL and add composite indexes (step 2/4)"
```

---

## Task 4: Migration step 3 — FK compostas

**Files:**
- Create: `apps/api/drizzle/0008_tenant_step3_fk_compostas.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 0008_tenant_step3_fk_compostas.sql
-- FK compostas prevent cross-tenant references at DB level.
-- Requires: unique indexes from step 2.

-- inscricoes → eventos: must share organization_id
ALTER TABLE "inscricoes"
  ADD CONSTRAINT "fk_inscricoes_evento_org"
  FOREIGN KEY ("organization_id", "evento_id")
  REFERENCES "eventos" ("organization_id", "id");

-- inscricoes → pessoas: must share organization_id
ALTER TABLE "inscricoes"
  ADD CONSTRAINT "fk_inscricoes_pessoa_org"
  FOREIGN KEY ("organization_id", "pessoa_id")
  REFERENCES "pessoas" ("organization_id", "id");

-- lider_pessoa_id → pessoas: leader must be in same org
ALTER TABLE "pessoas"
  ADD CONSTRAINT "fk_lider_pessoa_org"
  FOREIGN KEY ("organization_id", "lider_pessoa_id")
  REFERENCES "pessoas" ("organization_id", "id");
```

- [ ] **Step 2: Run the migration**

```bash
cd apps/api && pnpm db:migrate
```

Expected: All three constraints added. If existing rows have cross-tenant references, this will fail — verify data integrity first.

- [ ] **Step 3: Commit**

```bash
git add apps/api/drizzle/0008_tenant_step3_fk_compostas.sql
git commit -m "feat(db): add composite FK constraints to prevent cross-tenant references (step 3/4)"
```

---

## Task 5: Migration step 4 — partial index + CHECK constraint

**Files:**
- Create: `apps/api/drizzle/0009_tenant_step4_constraints.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 0009_tenant_step4_constraints.sql
-- Partial index ensures exactly one PRESIDENTE per org.
-- CHECK prevents a pessoa from being their own leader.

-- Only one member can have role = 'PRESIDENTE' per organization
CREATE UNIQUE INDEX "one_president_per_org"
  ON "member" ("organization_id")
  WHERE "role" = 'PRESIDENTE';

-- Prevent self-leadership
ALTER TABLE "pessoas"
  ADD CONSTRAINT "no_self_leadership"
  CHECK ("lider_pessoa_id" <> "id");
```

- [ ] **Step 2: Run the migration**

```bash
cd apps/api && pnpm db:migrate
```

Expected: Both constraints applied.

- [ ] **Step 3: Commit**

```bash
git add apps/api/drizzle/0009_tenant_step4_constraints.sql
git commit -m "feat(db): add one_president_per_org partial index and no_self_leadership check (step 4/4)"
```

---

## Task 6: Spike — validate Better Auth Organizations plugin

**Files:**
- No permanent files produced; findings inform Tasks 7–8.

- [ ] **Step 1: Install Better Auth Organizations plugin (already bundled)**

Verify the plugin is available:

```bash
node -e "const {organization} = require('better-auth/plugins'); console.log(typeof organization)"
```

Expected: `function`

- [ ] **Step 2: Read the plugin API**

```bash
node -e "
const {organization} = require('better-auth/plugins');
const inst = organization();
console.log(JSON.stringify(Object.keys(inst), null, 2));
"
```

Note the session shape — specifically whether `activeOrganizationId` appears on `session` or `session.session`. The exact field name is used in `TenantMiddleware` (Task 8).

- [ ] **Step 3: Confirm `set-active` endpoint path**

Better Auth registers `POST /api/auth/organizations/set-active` when the plugin is enabled. Verify this matches the frontend's `authClient.organization.setActive()` call.

Document findings in a comment at the top of `apps/api/src/middleware/tenant.ts` (written in Task 8):

```typescript
// Spike result (2026-05-01):
// session.activeOrganizationId is on the session object (not nested).
// Set via POST /api/v1/auth/organizations/set-active.
// activeOrganizationId is null when user has no active org.
```

- [ ] **Step 4: Confirm no spike blockers exist**

If the plugin behaves differently from the above, adjust Tasks 7 and 8 accordingly before proceeding. Document any deviation here as a comment.

---

## Task 7: Enable Better Auth Organizations plugin

**Files:**
- Modify: `apps/api/src/db/auth-schema.ts`
- Modify: `apps/api/src/config/auth.ts`

- [ ] **Step 1: Add organization tables to `auth-schema.ts`**

Replace the entire `apps/api/src/db/auth-schema.ts` with:

```typescript
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    activeOrganizationId: text("active_organization_id"),
  },
  (table) => ({
    session_userId_idx: index("session_userId_idx").on(table.userId),
  }),
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    account_userId_idx: index("account_userId_idx").on(table.userId),
  }),
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    verification_identifier_idx: index("verification_identifier_idx").on(table.identifier),
  }),
);

// Better Auth Organizations plugin tables
export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 30 }).notNull().default("MEMBRO"),
    // role values: PRESIDENTE | PASTOR_PRINCIPAL | PASTOR_REDE | DISCIPULADOR | LIDER_CELULA | MEMBRO
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    member_orgId_idx: index("member_orgId_idx").on(table.organizationId),
    member_userId_idx: index("member_userId_idx").on(table.userId),
  }),
);

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 30 }).notNull().default("MEMBRO"),
  status: text("status").notNull().default("pending"), // pending | accepted | rejected | cancelled
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  memberships: many(member),
  invitations: many(invitation),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
}));

export const memberRelations = relations(member, ({ one }) => ({
  user: one(user, { fields: [member.userId], references: [user.id] }),
  organization: one(organization, { fields: [member.organizationId], references: [organization.id] }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, { fields: [invitation.organizationId], references: [organization.id] }),
  inviter: one(user, { fields: [invitation.inviterId], references: [user.id] }),
}));
```

- [ ] **Step 2: Update `config/auth.ts` to enable the Organizations plugin**

```typescript
// apps/api/src/config/auth.ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { bearer } from "better-auth/plugins"
import { organization } from "better-auth/plugins"
import { db } from "../db"
import * as schema from "../db/schema"
import { env } from "./env"

const trustedOrigins = env.CORS_ORIGIN
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin && origin !== '*')

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      organization: schema.organization,
      member: schema.member,
      invitation: schema.invitation,
    },
  }),
  plugins: [
    bearer(),
    organization({
      // Better Auth handles org creation, membership, and invitations.
      // Role hierarchy and visibility logic live in PermissionResolver (not here).
      allowUserToCreateOrganization: true,
    }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false,
  },
  session: {
    expiresIn: 60 * 60 * 8,
    updateAge: 60 * 60 * 1,
  },
  account: {
    accountLinking: { enabled: false },
  },
  socialProviders: {},
})
```

- [ ] **Step 3: Update `db/schema.ts` to export organization tables**

At the top of `apps/api/src/db/schema.ts`, update the import/export line:

```typescript
import {
  user, session, account, verification,
  organization, member, invitation,
  userRelations, sessionRelations, accountRelations,
  organizationRelations, memberRelations, invitationRelations,
} from './auth-schema'
export {
  user, session, account, verification,
  organization, member, invitation,
  userRelations, sessionRelations, accountRelations,
  organizationRelations, memberRelations, invitationRelations,
}
```

Also add `organization_id`, `user_id`, `lider_pessoa_id` to the `pessoas` table definition:

```typescript
// In the pessoas table definition, add after the existing fields:
organization_id: uuid('organization_id').notNull(),
user_id: text('user_id'),
lider_pessoa_id: uuid('lider_pessoa_id'),
```

And add `organization_id` to `eventos`, `inscricoes`, `locais`:

```typescript
// eventos table — add after id:
organization_id: uuid('organization_id').notNull(),

// inscricoes table — add after id:
organization_id: uuid('organization_id').notNull(),

// locais table — add after id:
organization_id: uuid('organization_id').notNull(),
```

Update inferred types at the bottom:

```typescript
export type Organization = typeof organization.$inferSelect
export type Member = typeof member.$inferSelect
export type Invitation = typeof invitation.$inferSelect
```

- [ ] **Step 4: Generate a Drizzle migration for the schema-level changes**

```bash
cd apps/api && pnpm db:generate
```

Review the generated file to confirm it only adds `activeOrganizationId` to `session` and creates the `organization`, `member`, `invitation` tables. Then apply:

```bash
cd apps/api && pnpm db:migrate
```

- [ ] **Step 5: Type-check**

```bash
cd apps/api && pnpm type-check
```

Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/db/auth-schema.ts apps/api/src/db/schema.ts apps/api/src/config/auth.ts apps/api/drizzle/
git commit -m "feat(auth): enable Better Auth Organizations plugin with org/member/invitation tables"
```

---

## Task 8: TenantMiddleware

**Files:**
- Create: `apps/api/src/middleware/tenant.ts`
- Modify: `apps/api/src/middleware/auth.ts`
- Modify: `apps/api/src/app.ts`

- [ ] **Step 1: Create `apps/api/src/lib/tenant/types.ts`**

```typescript
// apps/api/src/lib/tenant/types.ts

export const OrgRole = {
  PRESIDENTE: 'PRESIDENTE',
  PASTOR_PRINCIPAL: 'PASTOR_PRINCIPAL',
  PASTOR_REDE: 'PASTOR_REDE',
  DISCIPULADOR: 'DISCIPULADOR',
  LIDER_CELULA: 'LIDER_CELULA',
  MEMBRO: 'MEMBRO',
} as const

export type OrgRole = (typeof OrgRole)[keyof typeof OrgRole]

export const Operation = {
  CREATE_EVENTO: 'CREATE_EVENTO',
  EDIT_EVENTO: 'EDIT_EVENTO',
  TRANSITION_EVENTO: 'TRANSITION_EVENTO',
  CANCEL_EVENTO: 'CANCEL_EVENTO',
  INVITE_MEMBER: 'INVITE_MEMBER',
  UPDATE_MEMBER_ROLE: 'UPDATE_MEMBER_ROLE',
  TRANSFER_PRESIDENCY: 'TRANSFER_PRESIDENCY',
  CREATE_PESSOA: 'CREATE_PESSOA',
  EDIT_PESSOA: 'EDIT_PESSOA',
  ENROLL_OTHER: 'ENROLL_OTHER',
  SELF_ENROLL: 'SELF_ENROLL',
  VIEW_ORG_SETTINGS: 'VIEW_ORG_SETTINGS',
} as const

export type Operation = (typeof Operation)[keyof typeof Operation]

export const ResourceScope = {
  ALL_ORG: 'ALL_ORG',
  OWN_SUBTREE: 'OWN_SUBTREE',
  DIRECT_CHILDREN: 'DIRECT_CHILDREN',
  SELF_ONLY: 'SELF_ONLY',
} as const

export type ResourceScope = (typeof ResourceScope)[keyof typeof ResourceScope]

export interface TenantContext {
  orgId: string
  userId: string
  userRole: OrgRole
}
```

- [ ] **Step 2: Create `apps/api/src/lib/tenant/errors.ts`**

```typescript
// apps/api/src/lib/tenant/errors.ts

export class MissingTenantContextError extends Error {
  constructor() {
    super('Repository instantiated without a tenant context (ctx.orgId is required)')
    this.name = 'MissingTenantContextError'
  }
}

export class TenantForbiddenError extends Error {
  constructor(operation: string) {
    super(`Role does not have permission to perform: ${operation}`)
    this.name = 'TenantForbiddenError'
  }
}
```

- [ ] **Step 3: Create `apps/api/src/middleware/tenant.ts`**

```typescript
// apps/api/src/middleware/tenant.ts
// Spike result (2026-05-01):
// session.activeOrganizationId is on the session object (not nested).
// Set via POST /api/v1/auth/organizations/set-active.

import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { auth } from '../config/auth'
import { db } from '../db'
import { member } from '../db/schema'
import { and, eq } from 'drizzle-orm'
import { TenantContext, OrgRole } from '../lib/tenant/types'

declare module 'fastify' {
  interface FastifyRequest {
    tenantCtx?: TenantContext
  }
}

// Suspicious header names — logged and ignored
const SUSPICIOUS_ORG_HEADERS = ['x-org-id', 'x-organization-id', 'organization-id']

const tenantPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Audit: log any attempt to pass org via header
    for (const header of SUSPICIOUS_ORG_HEADERS) {
      if (request.headers[header]) {
        request.log.warn({
          event: 'suspicious_tenant_header',
          header,
          userId: (request as any).user?.id,
          ip: request.ip,
        }, 'Client attempted to pass organization via header — ignored')
      }
    }

    // Also detect organization_id in body — we log but don't block the request
    const body = request.body as Record<string, unknown> | undefined
    if (body && 'organization_id' in body) {
      request.log.warn({
        event: 'suspicious_tenant_body',
        userId: (request as any).user?.id,
      }, 'Client sent organization_id in body — ignored for tenant resolution')
    }

    // Extract session — this is the ONLY valid source of orgId
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) return // routes without auth skip tenant context

    const session = await auth.api.getSession({ headers: { authorization: `Bearer ${token}` } })
    if (!session?.session?.activeOrganizationId) return // not in an org context

    const orgId = session.session.activeOrganizationId
    const userId = session.user.id

    // Look up this user's role in the active org
    const [membership] = await db
      .select({ role: member.role })
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.organizationId, orgId)))
      .limit(1)

    if (!membership) return // user is not a member of the active org

    request.tenantCtx = {
      orgId,
      userId,
      userRole: membership.role as OrgRole,
    }
  })
}

export const tenantMiddleware = fp(tenantPlugin)

// Helper used in route handlers to require tenant context
export function requireTenantCtx(request: FastifyRequest, reply: FastifyReply): TenantContext {
  if (!request.tenantCtx) {
    reply.code(401).send({ error: 'No active organization. Call /auth/organizations/set-active first.' })
    throw new Error('tenant ctx required') // stops handler execution
  }
  return request.tenantCtx
}
```

- [ ] **Step 4: Install `fastify-plugin` if not present**

```bash
cd apps/api && grep fastify-plugin package.json || pnpm add fastify-plugin
```

- [ ] **Step 5: Register TenantMiddleware in `app.ts`**

In `apps/api/src/app.ts`, add after cors/jwt registration:

```typescript
import { tenantMiddleware } from './middleware/tenant'

// inside buildApp(), after app.register(multipart):
app.register(tenantMiddleware)
```

- [ ] **Step 6: Type-check**

```bash
cd apps/api && pnpm type-check
```

Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/lib/tenant/types.ts apps/api/src/lib/tenant/errors.ts apps/api/src/middleware/tenant.ts apps/api/src/app.ts
git commit -m "feat(api): add TenantMiddleware and tenant types/errors"
```

---

## Task 9: BaseRepository

**Files:**
- Create: `apps/api/src/lib/tenant/base-repository.ts`

- [ ] **Step 1: Create the BaseRepository**

```typescript
// apps/api/src/lib/tenant/base-repository.ts
import { MissingTenantContextError } from './errors'
import { TenantContext } from './types'
import { Database } from '../../db'

export abstract class BaseRepository {
  protected readonly orgId: string

  constructor(
    protected readonly db: Database,
    ctx: TenantContext,
  ) {
    if (!ctx?.orgId) throw new MissingTenantContextError()
    this.orgId = ctx.orgId
  }
}
```

- [ ] **Step 2: Write a unit test**

Create `apps/api/src/lib/tenant/base-repository.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { BaseRepository } from './base-repository'
import { MissingTenantContextError } from './errors'
import { TenantContext, OrgRole } from './types'

// Minimal concrete subclass for testing
class TestRepo extends BaseRepository {
  getOrgId() { return this.orgId }
}

const validCtx: TenantContext = {
  orgId: 'org-123',
  userId: 'user-456',
  userRole: OrgRole.MEMBRO,
}

describe('BaseRepository', () => {
  it('stores orgId when ctx is valid', () => {
    const repo = new TestRepo({} as any, validCtx)
    expect(repo.getOrgId()).toBe('org-123')
  })

  it('throws MissingTenantContextError when ctx.orgId is empty', () => {
    expect(() => new TestRepo({} as any, { ...validCtx, orgId: '' }))
      .toThrow(MissingTenantContextError)
  })

  it('throws MissingTenantContextError when ctx is null', () => {
    expect(() => new TestRepo({} as any, null as any))
      .toThrow(MissingTenantContextError)
  })
})
```

- [ ] **Step 3: Run the test and verify it fails (implementation not yet wired)**

```bash
cd apps/api && pnpm test src/lib/tenant/base-repository.test.ts
```

Expected: Tests pass immediately since the implementation is already written.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/lib/tenant/base-repository.ts apps/api/src/lib/tenant/base-repository.test.ts
git commit -m "feat(api): add BaseRepository with MissingTenantContextError guard"
```

---

## Task 10: PermissionResolver

**Files:**
- Create: `apps/api/src/lib/tenant/permission-resolver.ts`
- Create: `apps/api/src/lib/tenant/permission-resolver.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// apps/api/src/lib/tenant/permission-resolver.test.ts
import { describe, it, expect } from 'vitest'
import { canPerform, canViewPessoas, canViewEvento } from './permission-resolver'
import { OrgRole, Operation } from './types'

describe('canPerform', () => {
  it('PRESIDENTE can create evento', () => {
    expect(canPerform(OrgRole.PRESIDENTE, Operation.CREATE_EVENTO)).toBe(true)
  })
  it('MEMBRO cannot create evento', () => {
    expect(canPerform(OrgRole.MEMBRO, Operation.CREATE_EVENTO)).toBe(false)
  })
  it('PASTOR_PRINCIPAL can invite member', () => {
    expect(canPerform(OrgRole.PASTOR_PRINCIPAL, Operation.INVITE_MEMBER)).toBe(true)
  })
  it('LIDER_CELULA cannot invite member', () => {
    expect(canPerform(OrgRole.LIDER_CELULA, Operation.INVITE_MEMBER)).toBe(false)
  })
  it('only PRESIDENTE can transfer presidency', () => {
    expect(canPerform(OrgRole.PRESIDENTE, Operation.TRANSFER_PRESIDENCY)).toBe(true)
    expect(canPerform(OrgRole.PASTOR_PRINCIPAL, Operation.TRANSFER_PRESIDENCY)).toBe(false)
  })
  it('all roles can self-enroll', () => {
    for (const role of Object.values(OrgRole)) {
      expect(canPerform(role as OrgRole, Operation.SELF_ENROLL)).toBe(true)
    }
  })
  it('PASTOR_REDE can create pessoa', () => {
    expect(canPerform(OrgRole.PASTOR_REDE, Operation.CREATE_PESSOA)).toBe(true)
  })
  it('DISCIPULADOR cannot create pessoa', () => {
    expect(canPerform(OrgRole.DISCIPULADOR, Operation.CREATE_PESSOA)).toBe(false)
  })
})

describe('canViewPessoas scope', () => {
  it('PRESIDENTE sees ALL_ORG', () => {
    expect(canViewPessoas(OrgRole.PRESIDENTE)).toBe('ALL_ORG')
  })
  it('PASTOR_REDE sees OWN_SUBTREE', () => {
    expect(canViewPessoas(OrgRole.PASTOR_REDE)).toBe('OWN_SUBTREE')
  })
  it('LIDER_CELULA sees DIRECT_CHILDREN', () => {
    expect(canViewPessoas(OrgRole.LIDER_CELULA)).toBe('DIRECT_CHILDREN')
  })
  it('MEMBRO sees SELF_ONLY', () => {
    expect(canViewPessoas(OrgRole.MEMBRO)).toBe('SELF_ONLY')
  })
})

describe('canViewEvento', () => {
  it('MEMBRO can see inscricoes_abertas', () => {
    expect(canViewEvento(OrgRole.MEMBRO, 'inscricoes_abertas')).toBe(true)
  })
  it('MEMBRO cannot see planejamento', () => {
    expect(canViewEvento(OrgRole.MEMBRO, 'planejamento')).toBe(false)
  })
  it('PRESIDENTE can see planejamento', () => {
    expect(canViewEvento(OrgRole.PRESIDENTE, 'planejamento')).toBe(true)
  })
  it('PASTOR_REDE cannot see planejamento', () => {
    expect(canViewEvento(OrgRole.PASTOR_REDE, 'planejamento')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd apps/api && pnpm test src/lib/tenant/permission-resolver.test.ts
```

Expected: All tests fail with "Cannot find module".

- [ ] **Step 3: Implement `permission-resolver.ts`**

```typescript
// apps/api/src/lib/tenant/permission-resolver.ts
import { OrgRole, Operation, ResourceScope } from './types'

// Roles with admin-level access across the org
const ADMIN_ROLES: OrgRole[] = [OrgRole.PRESIDENTE, OrgRole.PASTOR_PRINCIPAL]

const PERMISSIONS: Record<Operation, OrgRole[]> = {
  [Operation.CREATE_EVENTO]:      ADMIN_ROLES,
  [Operation.EDIT_EVENTO]:        ADMIN_ROLES,
  [Operation.TRANSITION_EVENTO]:  ADMIN_ROLES,
  [Operation.CANCEL_EVENTO]:      ADMIN_ROLES,
  [Operation.INVITE_MEMBER]:      ADMIN_ROLES,
  [Operation.UPDATE_MEMBER_ROLE]: ADMIN_ROLES,
  [Operation.TRANSFER_PRESIDENCY]:[OrgRole.PRESIDENTE],
  [Operation.CREATE_PESSOA]:      [OrgRole.PRESIDENTE, OrgRole.PASTOR_PRINCIPAL, OrgRole.PASTOR_REDE],
  [Operation.EDIT_PESSOA]:        [OrgRole.PRESIDENTE, OrgRole.PASTOR_PRINCIPAL, OrgRole.PASTOR_REDE, OrgRole.DISCIPULADOR],
  [Operation.ENROLL_OTHER]:       [OrgRole.PRESIDENTE, OrgRole.PASTOR_PRINCIPAL, OrgRole.PASTOR_REDE, OrgRole.DISCIPULADOR],
  [Operation.SELF_ENROLL]:        [OrgRole.PRESIDENTE, OrgRole.PASTOR_PRINCIPAL, OrgRole.PASTOR_REDE, OrgRole.DISCIPULADOR, OrgRole.LIDER_CELULA, OrgRole.MEMBRO],
  [Operation.VIEW_ORG_SETTINGS]:  ADMIN_ROLES,
}

export function canPerform(role: OrgRole, op: Operation): boolean {
  return PERMISSIONS[op]?.includes(role) ?? false
}

const PESSOAS_SCOPE: Record<OrgRole, ResourceScope> = {
  [OrgRole.PRESIDENTE]:      'ALL_ORG',
  [OrgRole.PASTOR_PRINCIPAL]:'ALL_ORG',
  [OrgRole.PASTOR_REDE]:     'OWN_SUBTREE',
  [OrgRole.DISCIPULADOR]:    'OWN_SUBTREE',
  [OrgRole.LIDER_CELULA]:    'DIRECT_CHILDREN',
  [OrgRole.MEMBRO]:          'SELF_ONLY',
}

export function canViewPessoas(role: OrgRole): ResourceScope {
  return PESSOAS_SCOPE[role]
}

// Evento visibility: planejamento only visible to admins
const DRAFT_ONLY_ROLES: OrgRole[] = ADMIN_ROLES

export function canViewEvento(role: OrgRole, status: string): boolean {
  if (status === 'planejamento') return DRAFT_ONLY_ROLES.includes(role)
  return true // all other statuses visible to all roles
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd apps/api && pnpm test src/lib/tenant/permission-resolver.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/lib/tenant/permission-resolver.ts apps/api/src/lib/tenant/permission-resolver.test.ts
git commit -m "feat(api): add PermissionResolver — sole source of authorization logic"
```

---

## Task 11: Refactor existing repositories to extend BaseRepository

**Files:**
- Modify: `apps/api/src/modules/acomodacoes/repositories/AcomodacaoRepository.ts`
- Modify: `apps/api/src/modules/inscricoes/repositories/EventoRepository.ts`
- Modify: `apps/api/src/modules/inscricoes/repositories/InscricaoRepository.ts`
- Modify: `apps/api/src/modules/inscricoes/repositories/PagamentoRepository.ts`
- Modify: `apps/api/src/modules/financeiro/repositories/FinanceiroRepository.ts`
- Modify: `apps/api/src/modules/admin/repositories/AuditLogRepository.ts`

The pattern for every repository is the same:

1. Import `BaseRepository` and `TenantContext`
2. Change `constructor(private db: Database)` → `constructor(db: Database, ctx: TenantContext)`
3. Call `super(db, ctx)`
4. Add `AND organization_id = this.orgId` to every select/update/delete
5. Inject `organization_id: this.orgId` into every insert

Below is the full refactor for each repository.

- [ ] **Step 1: Refactor `EventoRepository.ts`**

```typescript
// apps/api/src/modules/inscricoes/repositories/EventoRepository.ts
import { and, count, eq, ne } from 'drizzle-orm'
import { Database } from '../../../db'
import { eventos, inscricoes, configuracaoEvento, CreateEvento, CreateConfiguracaoEvento } from '../../../db/schema'
import { BaseRepository } from '../../../lib/tenant/base-repository'
import { TenantContext } from '../../../lib/tenant/types'

export class EventoRepository extends BaseRepository {
  constructor(db: Database, ctx: TenantContext) {
    super(db, ctx)
  }

  async create(data: Omit<CreateEvento, 'organization_id'>) {
    const [evento] = await this.db
      .insert(eventos)
      .values({ ...data, organization_id: this.orgId })
      .returning()
    return evento
  }

  async addConfig(data: CreateConfiguracaoEvento) {
    const [config] = await this.db.insert(configuracaoEvento).values(data).returning()
    return config
  }

  async update(id: string, data: Partial<Omit<CreateEvento, 'organization_id'>>) {
    const [evento] = await this.db
      .update(eventos)
      .set({ ...data, updated_at: new Date() })
      .where(and(eq(eventos.id, id), eq(eventos.organization_id, this.orgId)))
      .returning()
    return evento
  }

  async replaceConfigs(eventoId: string, configs: CreateConfiguracaoEvento[]) {
    await this.db.transaction(async (tx) => {
      await tx.delete(configuracaoEvento).where(eq(configuracaoEvento.evento_id, eventoId))
      if (configs.length > 0) {
        await tx.insert(configuracaoEvento).values(configs)
      }
    })
  }

  async findById(id: string) {
    return this.db.query.eventos.findFirst({
      where: and(eq(eventos.id, id), eq(eventos.organization_id, this.orgId)),
      with: { configuracoes: true },
    })
  }

  async list() {
    return this.db.query.eventos.findMany({
      where: eq(eventos.organization_id, this.orgId),
      orderBy: (e, { desc }) => [desc(e.created_at)],
    })
  }

  async listWithStats() {
    const eventRows = await this.db.query.eventos.findMany({
      where: eq(eventos.organization_id, this.orgId),
      orderBy: (e, { desc }) => [desc(e.created_at)],
      with: { local: true, configuracoes: true },
    })

    return Promise.all(
      eventRows.map(async (evento) => {
        const [result] = await this.db
          .select({ value: count() })
          .from(inscricoes)
          .where(
            and(
              eq(inscricoes.organization_id, this.orgId),
              eq(inscricoes.evento_id, evento.id),
              ne(inscricoes.status, 'CANCELADA'),
            ),
          )

        const inscritosCount = Number(result?.value ?? 0)
        const capacidadeMaxima = Number(evento.capacidade_maxima ?? 0)
        const ocupacaoPercentual =
          capacidadeMaxima <= 0 ? 0 : Math.min(100, Math.round((inscritosCount / capacidadeMaxima) * 100))

        const configs = evento.configuracoes ?? []
        const cfgEncontrista = configs.find((c) => c.papel === 'encontrista')
        const cfgServo = configs.find((c) => c.papel === 'servo')

        const { local: _local, configuracoes: _configs, ...eventoBase } = evento
        return {
          ...eventoBase,
          inscritos_count: inscritosCount,
          ocupacao_percentual: ocupacaoPercentual,
          local_nome: evento.local?.nome ?? null,
          preco_encontrista: cfgEncontrista ? Number(cfgEncontrista.valor) : null,
          preco_servo: cfgServo ? Number(cfgServo.valor) : null,
        }
      }),
    )
  }
}
```

- [ ] **Step 2: Refactor `AcomodacaoRepository.ts`**

At the top of `AcomodacaoRepository.ts`, change the constructor:

```typescript
import { BaseRepository } from '../../../lib/tenant/base-repository'
import { TenantContext } from '../../../lib/tenant/types'

export class AcomodacaoRepository extends BaseRepository {
  constructor(db: Database, ctx: TenantContext) {
    super(db, ctx)
  }
  // ...
}
```

For methods that query `locais` (tenant-owned), add `eq(locais.organization_id, this.orgId)` to the where clause. Methods that query `quartos`, `camas`, `inscricoes` without direct org FK rely on the FK chain — add `organization_id` guards to any `inscricoes` queries:

```typescript
// In listInscricoesDisponiveis and getMapaAcomodacao, add to filters array:
eq(inscricoes.organization_id, this.orgId)
```

For `createLocal`:
```typescript
async createLocal(data: Omit<typeof locais.$inferInsert, 'organization_id'>) {
  const [local] = await this.db.insert(locais).values({ ...data, organization_id: this.orgId }).returning()
  return local
}
```

For `listLocaisWithStructure`:
```typescript
async listLocaisWithStructure() {
  const locaisRows = await this.db.query.locais.findMany({
    where: eq(locais.organization_id, this.orgId),
    with: { quartos: { with: { camas: true } } },
    orderBy: [asc(locais.nome)],
  })
  // ... rest unchanged
}
```

- [ ] **Step 3: Refactor `InscricaoRepository.ts` — add orgId to all queries**

Open `apps/api/src/modules/inscricoes/repositories/InscricaoRepository.ts` and apply the same pattern: extend `BaseRepository`, inject `organization_id: this.orgId` on inserts, add `eq(inscricoes.organization_id, this.orgId)` to all selects/updates.

- [ ] **Step 4: Refactor `PagamentoRepository.ts`, `FinanceiroRepository.ts`, `AuditLogRepository.ts`**

Apply the same pattern. Note: `pagamentos` and `despesas` inherit isolation via FK — but their repositories still receive `TenantContext` for consistent API. Pagamentos queries can filter by `inscricoes.organization_id` via join if needed.

- [ ] **Step 5: Update all route files to pass `ctx` from request**

In every route file that constructs a repository, change:

```typescript
// Before:
const repo = new EventoRepository(db)

// After:
const ctx = requireTenantCtx(request, reply)
const repo = new EventoRepository(db, ctx)
```

Import `requireTenantCtx` from `'../../../middleware/tenant'`.

- [ ] **Step 6: Type-check**

```bash
cd apps/api && pnpm type-check
```

Fix any type errors. Common ones: `organization_id` missing from insert types (add it to `Omit` signatures), `ctx` not available in use cases (thread it through or pass `orgId` directly).

- [ ] **Step 7: Run tests**

```bash
cd apps/api && pnpm test
```

Expected: Existing tests pass. Any test that instantiates a repository now requires a valid ctx — update test fixtures.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/modules/
git commit -m "feat(api): refactor all repositories to extend BaseRepository with tenant guard"
```

---

## Task 12: PessoasRepository with findSubtree CTE

**Files:**
- Create: `apps/api/src/modules/pessoas/repositories/PessoasRepository.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/modules/pessoas/repositories/PessoasRepository.test.ts`:

```typescript
// This test requires a real DB connection (integration test).
// Run after: pnpm db:test:migrate
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../../../db'
import { PessoasRepository } from './PessoasRepository'
import { OrgRole, TenantContext } from '../../../lib/tenant/types'

const ctx: TenantContext = {
  orgId: '00000000-0000-0000-0000-000000000001', // default org from backfill
  userId: 'test-user',
  userRole: OrgRole.PASTOR_REDE,
}

describe('PessoasRepository.findSubtree', () => {
  it('returns empty array when pessoaId has no subordinates', async () => {
    const repo = new PessoasRepository(db, ctx)
    // Use a random id — no subordinates expected
    const result = await repo.findSubtree('00000000-0000-0000-0000-999999999999', 10)
    expect(result).toEqual([])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
cd apps/api && pnpm test src/modules/pessoas/repositories/PessoasRepository.test.ts
```

Expected: FAIL — "Cannot find module".

- [ ] **Step 3: Implement PessoasRepository**

```typescript
// apps/api/src/modules/pessoas/repositories/PessoasRepository.ts
import { and, eq, ilike, isNull } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { Database } from '../../../db'
import { pessoas } from '../../../db/schema'
import { BaseRepository } from '../../../lib/tenant/base-repository'
import { TenantContext } from '../../../lib/tenant/types'

export class PessoasRepository extends BaseRepository {
  constructor(db: Database, ctx: TenantContext) {
    super(db, ctx)
  }

  async list(opts: { q?: string; page: number; pageSize: number }) {
    const { q, page, pageSize } = opts
    const offset = (page - 1) * pageSize
    const conditions = [isNull(pessoas.deleted_at), eq(pessoas.organization_id, this.orgId)]
    if (q) conditions.push(ilike(pessoas.nome, `%${q}%`))
    const whereClause = and(...conditions)

    const [data, countRows] = await Promise.all([
      this.db.select().from(pessoas).where(whereClause).limit(pageSize).offset(offset).orderBy(pessoas.nome),
      this.db.select({ id: pessoas.id }).from(pessoas).where(whereClause),
    ])
    return { data, pagination: { page, pageSize, total: countRows.length, totalPages: Math.ceil(countRows.length / pageSize) } }
  }

  async findById(id: string) {
    return this.db.query.pessoas.findFirst({
      where: and(eq(pessoas.id, id), eq(pessoas.organization_id, this.orgId)),
    })
  }

  async create(data: Omit<typeof pessoas.$inferInsert, 'organization_id'>) {
    const [pessoa] = await this.db
      .insert(pessoas)
      .values({ ...data, organization_id: this.orgId })
      .returning()
    return pessoa
  }

  async update(id: string, data: Partial<typeof pessoas.$inferInsert>) {
    const [pessoa] = await this.db
      .update(pessoas)
      .set({ ...data, updated_at: new Date() })
      .where(and(eq(pessoas.id, id), eq(pessoas.organization_id, this.orgId)))
      .returning()
    return pessoa
  }

  async softDelete(id: string) {
    const [pessoa] = await this.db
      .update(pessoas)
      .set({ deleted_at: new Date() })
      .where(and(eq(pessoas.id, id), eq(pessoas.organization_id, this.orgId)))
      .returning()
    return pessoa
  }

  // CTE recursiva: returns all pessoas in the subtree rooted at pessoaId (inclusive)
  async findSubtree(pessoaId: string, maxDepth = 10): Promise<typeof pessoas.$inferSelect[]> {
    const orgId = this.orgId
    const rows = await this.db.execute(sql`
      WITH RECURSIVE rede AS (
        SELECT p.id, p.lider_pessoa_id, 1 AS depth
        FROM pessoas p
        WHERE p.id = ${pessoaId}
          AND p.organization_id = ${orgId}
          AND p.deleted_at IS NULL

        UNION ALL

        SELECT p.id, p.lider_pessoa_id, r.depth + 1
        FROM pessoas p
        INNER JOIN rede r ON p.lider_pessoa_id = r.id
        WHERE p.organization_id = ${orgId}
          AND p.deleted_at IS NULL
          AND r.depth < ${maxDepth}
      )
      SELECT p.*
      FROM pessoas p
      WHERE p.id IN (SELECT id FROM rede)
        AND p.organization_id = ${orgId}
    `)
    return rows as typeof pessoas.$inferSelect[]
  }

  // Direct children only (depth = 1)
  async findDirectChildren(pessoaId: string): Promise<typeof pessoas.$inferSelect[]> {
    return this.db
      .select()
      .from(pessoas)
      .where(
        and(
          eq(pessoas.lider_pessoa_id, pessoaId),
          eq(pessoas.organization_id, this.orgId),
          isNull(pessoas.deleted_at),
        ),
      )
  }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd apps/api && pnpm test src/modules/pessoas/repositories/PessoasRepository.test.ts
```

Expected: PASS.

- [ ] **Step 5: Update existing pessoas use cases to use PessoasRepository**

For each use case in `apps/api/src/modules/pessoas/usecases/`, replace direct `db` queries with `PessoasRepository`. Example for `ListParticipantesUseCase.ts`:

```typescript
import { Database } from '../../../db'
import { PessoasRepository } from '../repositories/PessoasRepository'
import { TenantContext } from '../../../lib/tenant/types'

export class ListParticipantesUseCase {
  constructor(private db: Database, private ctx: TenantContext) {}

  async execute(params: { q?: string; page: number; pageSize: number }) {
    const repo = new PessoasRepository(this.db, this.ctx)
    return repo.list(params)
  }
}
```

Apply the same constructor pattern to all other pessoas use cases.

- [ ] **Step 6: Type-check**

```bash
cd apps/api && pnpm type-check
```

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/modules/pessoas/repositories/ apps/api/src/modules/pessoas/usecases/
git commit -m "feat(api): add PessoasRepository with findSubtree CTE and migrate use cases"
```

---

## Task 13: TransferPresidencyUseCase

**Files:**
- Create: `apps/api/src/modules/organizations/usecases/TransferPresidencyUseCase.ts`

- [ ] **Step 1: Write the failing test** (in Task 23 — see test suite below for the full atomic test)

- [ ] **Step 2: Implement TransferPresidencyUseCase**

```typescript
// apps/api/src/modules/organizations/usecases/TransferPresidencyUseCase.ts
import { sql } from 'drizzle-orm'
import { Database } from '../../../db'
import { TenantContext, OrgRole } from '../../../lib/tenant/types'
import { TenantForbiddenError } from '../../../lib/tenant/errors'
import { canPerform, Operation } from '../../../lib/tenant/permission-resolver'

export class TransferPresidencyUseCase {
  constructor(private db: Database, private ctx: TenantContext) {}

  async execute(newPresidentUserId: string): Promise<void> {
    if (!canPerform(this.ctx.userRole, Operation.TRANSFER_PRESIDENCY)) {
      throw new TenantForbiddenError(Operation.TRANSFER_PRESIDENCY)
    }

    const orgId = this.ctx.orgId
    const currentPresidentId = this.ctx.userId

    if (currentPresidentId === newPresidentUserId) {
      throw new Error('Cannot transfer presidency to yourself')
    }

    // Atomic swap — the partial unique index prevents two PRESIDENTEs
    await this.db.transaction(async (tx) => {
      // Step 1: demote current president
      await tx.execute(sql`
        UPDATE member
        SET role = 'PASTOR_PRINCIPAL'
        WHERE organization_id = ${orgId}
          AND user_id = ${currentPresidentId}
          AND role = 'PRESIDENTE'
      `)

      // Step 2: promote new president
      // If newPresidentUserId is not a member, this will throw a FK error
      const result = await tx.execute(sql`
        UPDATE member
        SET role = 'PRESIDENTE'
        WHERE organization_id = ${orgId}
          AND user_id = ${newPresidentUserId}
      `)

      if ((result as any).rowCount === 0) {
        throw new Error('Target user is not a member of this organization')
      }
    })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/organizations/usecases/TransferPresidencyUseCase.ts
git commit -m "feat(api): add TransferPresidencyUseCase with atomic transaction"
```

---

## Task 14: Organization endpoints

**Files:**
- Create: `apps/api/src/modules/organizations/usecases/CreateOrganizationUseCase.ts`
- Create: `apps/api/src/modules/organizations/usecases/GetMembersUseCase.ts`
- Create: `apps/api/src/modules/organizations/usecases/InviteMemberUseCase.ts`
- Create: `apps/api/src/modules/organizations/usecases/UpdateMemberRoleUseCase.ts`
- Create: `apps/api/src/modules/organizations/controllers/OrganizationController.ts`
- Create: `apps/api/src/modules/organizations/routes/organizations.ts`
- Modify: `apps/api/src/app.ts`

- [ ] **Step 1: Create `CreateOrganizationUseCase.ts`**

```typescript
// apps/api/src/modules/organizations/usecases/CreateOrganizationUseCase.ts
// Creates an org via Better Auth and makes the creator PRESIDENTE.
import { auth } from '../../../config/auth'

interface CreateOrgInput {
  name: string
  slug: string
  userId: string
}

export class CreateOrganizationUseCase {
  async execute({ name, slug, userId }: CreateOrgInput) {
    // Use Better Auth's organization API
    const org = await auth.api.createOrganization({
      body: { name, slug },
      headers: {} as any,
    })

    // Better Auth sets the creator as 'owner' by default.
    // We update to PRESIDENTE via direct DB call handled in the controller
    // after calling set-active to get a proper session context.
    return org
  }
}
```

- [ ] **Step 2: Create `GetMembersUseCase.ts`**

```typescript
// apps/api/src/modules/organizations/usecases/GetMembersUseCase.ts
import { eq } from 'drizzle-orm'
import { Database } from '../../../db'
import { member, user } from '../../../db/schema'
import { TenantContext } from '../../../lib/tenant/types'

export class GetMembersUseCase {
  constructor(private db: Database, private ctx: TenantContext) {}

  async execute() {
    return this.db
      .select({
        memberId: member.id,
        userId: member.userId,
        role: member.role,
        name: user.name,
        email: user.email,
        joinedAt: member.createdAt,
      })
      .from(member)
      .innerJoin(user, eq(user.id, member.userId))
      .where(eq(member.organizationId, this.ctx.orgId))
  }
}
```

- [ ] **Step 3: Create `InviteMemberUseCase.ts`**

```typescript
// apps/api/src/modules/organizations/usecases/InviteMemberUseCase.ts
import { auth } from '../../../config/auth'
import { TenantContext, OrgRole } from '../../../lib/tenant/types'
import { TenantForbiddenError } from '../../../lib/tenant/errors'
import { canPerform } from '../../../lib/tenant/permission-resolver'
import { Operation } from '../../../lib/tenant/types'

export class InviteMemberUseCase {
  constructor(private ctx: TenantContext) {}

  async execute(email: string, role: OrgRole, inviterHeaders: HeadersInit) {
    if (!canPerform(this.ctx.userRole, Operation.INVITE_MEMBER)) {
      throw new TenantForbiddenError(Operation.INVITE_MEMBER)
    }

    return auth.api.inviteOrganization({
      body: { email, role, organizationId: this.ctx.orgId },
      headers: inviterHeaders as any,
    })
  }
}
```

- [ ] **Step 4: Create `UpdateMemberRoleUseCase.ts`**

```typescript
// apps/api/src/modules/organizations/usecases/UpdateMemberRoleUseCase.ts
import { and, eq } from 'drizzle-orm'
import { Database } from '../../../db'
import { member } from '../../../db/schema'
import { TenantContext, OrgRole, Operation } from '../../../lib/tenant/types'
import { TenantForbiddenError } from '../../../lib/tenant/errors'
import { canPerform } from '../../../lib/tenant/permission-resolver'

export class UpdateMemberRoleUseCase {
  constructor(private db: Database, private ctx: TenantContext) {}

  async execute(targetUserId: string, newRole: OrgRole) {
    if (!canPerform(this.ctx.userRole, Operation.UPDATE_MEMBER_ROLE)) {
      throw new TenantForbiddenError(Operation.UPDATE_MEMBER_ROLE)
    }

    // PASTOR_PRINCIPAL cannot set PRESIDENTE
    if (this.ctx.userRole === OrgRole.PASTOR_PRINCIPAL && newRole === OrgRole.PRESIDENTE) {
      throw new TenantForbiddenError('PASTOR_PRINCIPAL_cannot_set_PRESIDENTE')
    }

    const [updated] = await this.db
      .update(member)
      .set({ role: newRole })
      .where(and(eq(member.organizationId, this.ctx.orgId), eq(member.userId, targetUserId)))
      .returning()

    if (!updated) throw new Error('Member not found in this organization')
    return updated
  }
}
```

- [ ] **Step 5: Create `OrganizationController.ts`**

```typescript
// apps/api/src/modules/organizations/controllers/OrganizationController.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '../../../db'
import { requireTenantCtx } from '../../../middleware/tenant'
import { GetMembersUseCase } from '../usecases/GetMembersUseCase'
import { InviteMemberUseCase } from '../usecases/InviteMemberUseCase'
import { UpdateMemberRoleUseCase } from '../usecases/UpdateMemberRoleUseCase'
import { TransferPresidencyUseCase } from '../usecases/TransferPresidencyUseCase'
import { OrgRole } from '../../../lib/tenant/types'
import { z } from 'zod'

export class OrganizationController {
  async getMembers(request: FastifyRequest, reply: FastifyReply) {
    const ctx = requireTenantCtx(request, reply)
    const uc = new GetMembersUseCase(db, ctx)
    return reply.send(await uc.execute())
  }

  async inviteMember(request: FastifyRequest, reply: FastifyReply) {
    const ctx = requireTenantCtx(request, reply)
    const { email, role } = z.object({
      email: z.string().email(),
      role: z.nativeEnum(OrgRole).default(OrgRole.MEMBRO),
    }).parse(request.body)

    const uc = new InviteMemberUseCase(ctx)
    const result = await uc.execute(email, role, request.headers as any)
    return reply.code(201).send(result)
  }

  async updateMemberRole(request: FastifyRequest, reply: FastifyReply) {
    const ctx = requireTenantCtx(request, reply)
    const { userId } = request.params as { userId: string }
    const { role } = z.object({ role: z.nativeEnum(OrgRole) }).parse(request.body)

    const uc = new UpdateMemberRoleUseCase(db, ctx)
    return reply.send(await uc.execute(userId, role))
  }

  async transferPresidency(request: FastifyRequest, reply: FastifyReply) {
    const ctx = requireTenantCtx(request, reply)
    const { newPresidentUserId } = z.object({ newPresidentUserId: z.string() }).parse(request.body)

    const uc = new TransferPresidencyUseCase(db, ctx)
    await uc.execute(newPresidentUserId)
    return reply.code(204).send()
  }
}
```

- [ ] **Step 6: Create `organizations.ts` routes**

```typescript
// apps/api/src/modules/organizations/routes/organizations.ts
import { FastifyInstance } from 'fastify'
import { OrganizationController } from '../controllers/OrganizationController'

export async function organizationRoutes(fastify: FastifyInstance) {
  const ctrl = new OrganizationController()

  fastify.get('/members', ctrl.getMembers.bind(ctrl))
  fastify.post('/members/invite', ctrl.inviteMember.bind(ctrl))
  fastify.patch('/members/:userId/role', ctrl.updateMemberRole.bind(ctrl))
  fastify.post('/transfer-presidency', ctrl.transferPresidency.bind(ctrl))
}
```

- [ ] **Step 7: Register routes in `app.ts`**

```typescript
import { organizationRoutes } from './modules/organizations/routes/organizations'

// Inside buildApp():
app.register(organizationRoutes, { prefix: '/api/v1/organization' })
```

- [ ] **Step 8: Type-check**

```bash
cd apps/api && pnpm type-check
```

- [ ] **Step 9: Commit**

```bash
git add apps/api/src/modules/organizations/ apps/api/src/app.ts
git commit -m "feat(api): add organization endpoints (members, invite, role update, transfer presidency)"
```

---

## Task 15: Update all existing endpoints to read ctx.orgId

All existing route handlers that use repositories need to pass `ctx` from `request.tenantCtx`. This was partially done in Task 11 — verify each route file.

- [ ] **Step 1: Audit all route files**

```bash
grep -r "new EventoRepository\|new AcomodacaoRepository\|new InscricaoRepository\|new PagamentoRepository\|new FinanceiroRepository" apps/api/src/modules/*/routes/ apps/api/src/modules/*/controllers/
```

Any instantiation without a `ctx` argument is a bug. Fix each one.

- [ ] **Step 2: Verify controllers thread ctx through to use cases**

Example pattern for `EventoController`:

```typescript
const ctx = requireTenantCtx(request, reply)
const repo = new EventoRepository(db, ctx)
const uc = new CreateEventoUseCase(repo)
```

- [ ] **Step 3: Run all tests**

```bash
cd apps/api && pnpm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/
git commit -m "feat(api): ensure all existing endpoints pass tenant ctx to repositories"
```

---

## Task 16: OrgContext (frontend)

**Files:**
- Create: `apps/web/src/contexts/org-context.tsx`
- Create: `apps/web/src/hooks/use-org.ts`
- Modify: `apps/web/src/lib/auth.ts`

- [ ] **Step 1: Update `lib/auth.ts` to include the organization client**

```typescript
// apps/web/src/lib/auth.ts
/// <reference types="vite/client" />
import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  basePath: "/api/v1/auth",
  plugins: [organizationClient()],
})
```

- [ ] **Step 2: Create `org-context.tsx`**

```typescript
// apps/web/src/contexts/org-context.tsx
import { createContext, useContext, ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authClient } from '../lib/auth'

interface OrgContextType {
  activeOrgId: string | null
  userRole: string | null
  setActiveOrg: (orgId: string) => Promise<void>
  isLoading: boolean
}

const OrgContext = createContext<OrgContextType | undefined>(undefined)

export function OrgProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { data: session, isPending } = authClient.useSession()

  const activeOrgId = (session?.session as any)?.activeOrganizationId ?? null

  // Fetch user's role in the active org
  const { data: activeMember } = authClient.useActiveMember()
  const userRole = (activeMember as any)?.role ?? null

  async function setActiveOrg(orgId: string) {
    await authClient.organization.setActive({ organizationId: orgId })
    // Clear all cached org-scoped data to prevent stale data from previous org
    queryClient.clear()
    window.location.reload() // force session refresh
  }

  return (
    <OrgContext.Provider value={{ activeOrgId, userRole, setActiveOrg, isLoading: isPending }}>
      {children}
    </OrgContext.Provider>
  )
}

export function useOrgContext() {
  const ctx = useContext(OrgContext)
  if (!ctx) throw new Error('useOrgContext must be used within OrgProvider')
  return ctx
}
```

- [ ] **Step 3: Create `hooks/use-org.ts`**

```typescript
// apps/web/src/hooks/use-org.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { useOrgContext } from '../contexts/org-context'

export function useOrgMembers() {
  const { activeOrgId } = useOrgContext()
  return useQuery({
    queryKey: ['org', activeOrgId, 'members'],
    queryFn: () => apiFetch('/api/v1/organization/members'),
    enabled: !!activeOrgId,
  })
}

export function useInviteMember() {
  const { activeOrgId } = useOrgContext()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { email: string; role: string }) =>
      apiFetch('/api/v1/organization/members/invite', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org', activeOrgId, 'members'] })
    },
  })
}

export function useUpdateMemberRole() {
  const { activeOrgId } = useOrgContext()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiFetch(`/api/v1/organization/members/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org', activeOrgId, 'members'] })
    },
  })
}
```

- [ ] **Step 4: Wrap app with OrgProvider in `App.tsx`**

```typescript
// In apps/web/src/App.tsx, wrap the router with OrgProvider:
import { OrgProvider } from './contexts/org-context'

// Inside the JSX:
<OrgProvider>
  {/* existing router/routes */}
</OrgProvider>
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/contexts/org-context.tsx apps/web/src/hooks/use-org.ts apps/web/src/lib/auth.ts apps/web/src/App.tsx
git commit -m "feat(web): add OrgContext with setActiveOrg and queryClient.clear()"
```

---

## Task 17: Migrate all frontend query keys to include orgId

**Files:**
- Modify: `apps/web/src/hooks/use-eventos.ts`
- Modify: `apps/web/src/hooks/use-participantes.ts`
- Modify: `apps/web/src/hooks/use-inscricoes.ts`
- Modify: `apps/web/src/hooks/use-acomodacoes.ts`

The pattern for every hook file is the same:

```typescript
// Before:
queryKey: ['eventos', 'list']

// After:
queryKey: ['org', activeOrgId, 'eventos', 'list']
```

- [ ] **Step 1: Update `use-eventos.ts`**

```typescript
// apps/web/src/hooks/use-eventos.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { useOrgContext } from '../contexts/org-context'
import type { CreateEvento, Evento, EventoListItem, UpdateEvento } from '@koinonia/shared'

export function useEventosKeys(orgId: string | null) {
  return {
    all: ['org', orgId, 'eventos'] as const,
    list: () => ['org', orgId, 'eventos', 'list'] as const,
    detail: (id: string) => ['org', orgId, 'eventos', 'detail', id] as const,
  }
}

export function useEventos() {
  const { activeOrgId } = useOrgContext()
  const keys = useEventosKeys(activeOrgId)
  return useQuery({
    queryKey: keys.list(),
    queryFn: () => apiFetch<EventoListItem[]>('/api/v1/eventos'),
    enabled: !!activeOrgId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useEvento(id: string) {
  const { activeOrgId } = useOrgContext()
  const keys = useEventosKeys(activeOrgId)
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => apiFetch<Evento>(`/api/v1/eventos/${id}`),
    enabled: !!activeOrgId && !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateEvento() {
  const { activeOrgId } = useOrgContext()
  const queryClient = useQueryClient()
  const keys = useEventosKeys(activeOrgId)
  return useMutation({
    mutationFn: (payload: CreateEvento) =>
      apiFetch<Evento>('/api/v1/eventos', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: keys.list() }) },
  })
}

export function useUpdateEvento() {
  const { activeOrgId } = useOrgContext()
  const queryClient = useQueryClient()
  const keys = useEventosKeys(activeOrgId)
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEvento }) =>
      apiFetch<Evento>(`/api/v1/eventos/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: keys.list() })
      queryClient.invalidateQueries({ queryKey: keys.detail(id) })
    },
  })
}
```

- [ ] **Step 2: Apply the same orgId key pattern to `use-participantes.ts`, `use-inscricoes.ts`, `use-acomodacoes.ts`**

In each file:
1. Import `useOrgContext`
2. Prefix all `queryKey` arrays with `['org', activeOrgId, ...]`
3. Add `enabled: !!activeOrgId` to all `useQuery` calls

- [ ] **Step 3: Type-check**

```bash
cd apps/web && pnpm type-check
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/hooks/
git commit -m "feat(web): prefix all TanStack Query keys with orgId to prevent cross-tenant cache"
```

---

## Task 18: OrgSwitcher component

**Files:**
- Create: `apps/web/src/components/layout/OrgSwitcher.tsx`
- Modify: `apps/web/src/components/layout/AppLayout.tsx`

- [ ] **Step 1: Create `OrgSwitcher.tsx`**

```typescript
// apps/web/src/components/layout/OrgSwitcher.tsx
import { authClient } from '../../lib/auth'
import { useOrgContext } from '../../contexts/org-context'
import { Button } from '../ui/button'

export function OrgSwitcher() {
  const { activeOrgId, setActiveOrg } = useOrgContext()
  const { data: orgs } = (authClient as any).useListOrganizations()

  if (!orgs || orgs.length <= 1) return null

  return (
    <div className="flex items-center gap-2">
      <select
        className="text-sm border rounded px-2 py-1"
        value={activeOrgId ?? ''}
        onChange={(e) => setActiveOrg(e.target.value)}
      >
        {!activeOrgId && <option value="">Selecione uma organização</option>}
        {orgs.map((org: any) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  )
}
```

- [ ] **Step 2: Add OrgSwitcher to AppLayout header**

In `apps/web/src/components/layout/AppLayout.tsx`, find the header section and add:

```typescript
import { OrgSwitcher } from './OrgSwitcher'

// Inside the header JSX:
<OrgSwitcher />
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/layout/OrgSwitcher.tsx apps/web/src/components/layout/AppLayout.tsx
git commit -m "feat(web): add OrgSwitcher to header with queryClient.clear() on org change"
```

---

## Task 19: Onboarding — self-service org creation

**Files:**
- Create: `apps/web/src/pages/OnboardingPage.tsx`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Create `OnboardingPage.tsx`**

```typescript
// apps/web/src/pages/OnboardingPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient } from '../lib/auth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export function OnboardingPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleNameChange(value: string) {
    setName(value)
    // Auto-suggest slug from name — user can override
    setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return
    setLoading(true)
    setError(null)

    try {
      const result = await (authClient as any).organization.create({ name, slug })
      if (result.error) throw new Error(result.error.message)

      // Set the new org as active
      await (authClient as any).organization.setActive({ organizationId: result.data.id })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message ?? 'Erro ao criar organização')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F4EF]">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-[#1A1612] mb-2">Criar sua organização</h1>
        <p className="text-sm text-gray-500 mb-6">
          Configure sua igreja ou ministério. Você será o Presidente automaticamente.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da organização</label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Igreja Boa Nova"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Identificador (slug)</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ex: igreja-boa-nova"
              pattern="[a-z0-9\-]+"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Apenas letras minúsculas, números e hífens.</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Criando...' : 'Criar organização'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add route to `App.tsx`**

```typescript
import { OnboardingPage } from './pages/OnboardingPage'

// Inside the router:
<Route path="/onboarding" element={<OnboardingPage />} />
```

- [ ] **Step 3: Redirect new users to /onboarding if no active org**

In `App.tsx` or the root layout, add logic: if user is authenticated but has no `activeOrganizationId`, redirect to `/onboarding`.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/OnboardingPage.tsx apps/web/src/App.tsx
git commit -m "feat(web): add self-service org creation onboarding page"
```

---

## Task 20: Members management page

**Files:**
- Create: `apps/web/src/pages/MembersPage.tsx`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Create `MembersPage.tsx`**

```typescript
// apps/web/src/pages/MembersPage.tsx
import { useState } from 'react'
import { useOrgMembers, useInviteMember, useUpdateMemberRole } from '../hooks/use-org'
import { useOrgContext } from '../contexts/org-context'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

const ROLE_LABELS: Record<string, string> = {
  PRESIDENTE: 'Presidente',
  PASTOR_PRINCIPAL: 'Pastor Principal',
  PASTOR_REDE: 'Pastor de Rede',
  DISCIPULADOR: 'Discipulador',
  LIDER_CELULA: 'Líder de Célula',
  MEMBRO: 'Membro',
}

const INVITABLE_ROLES = ['PASTOR_PRINCIPAL', 'PASTOR_REDE', 'DISCIPULADOR', 'LIDER_CELULA', 'MEMBRO']

export function MembersPage() {
  const { userRole } = useOrgContext()
  const { data: members, isLoading } = useOrgMembers()
  const inviteMember = useInviteMember()
  const updateRole = useUpdateMemberRole()

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('MEMBRO')
  const [inviteError, setInviteError] = useState<string | null>(null)

  const canManage = userRole === 'PRESIDENTE' || userRole === 'PASTOR_PRINCIPAL'

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteError(null)
    try {
      await inviteMember.mutateAsync({ email: inviteEmail, role: inviteRole })
      setInviteEmail('')
    } catch (err: any) {
      setInviteError(err.message ?? 'Erro ao convidar')
    }
  }

  if (isLoading) return <div className="p-6">Carregando membros...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold">Membros</h1>

      {canManage && (
        <form onSubmit={handleInvite} className="bg-white rounded-lg border p-4 space-y-3">
          <h2 className="font-medium">Convidar membro</h2>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@exemplo.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="flex-1"
            />
            <select
              className="border rounded px-2 text-sm"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            >
              {INVITABLE_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            <Button type="submit" disabled={inviteMember.isPending}>
              Convidar
            </Button>
          </div>
          {inviteError && <p className="text-sm text-red-600">{inviteError}</p>}
        </form>
      )}

      <div className="space-y-2">
        {(members as any[])?.map((m: any) => (
          <div key={m.memberId} className="bg-white border rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{m.name}</p>
              <p className="text-xs text-gray-500">{m.email}</p>
            </div>
            {canManage && m.role !== 'PRESIDENTE' ? (
              <select
                className="text-xs border rounded px-2 py-1"
                value={m.role}
                onChange={(e) => updateRole.mutate({ userId: m.userId, role: e.target.value })}
              >
                {INVITABLE_ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-gray-500">{ROLE_LABELS[m.role] ?? m.role}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add route and navigation link**

In `App.tsx`:
```typescript
import { MembersPage } from './pages/MembersPage'
// Route:
<Route path="/membros" element={<MembersPage />} />
```

In `AppLayout.tsx`, add a navigation link to `/membros` (visible only to PRESIDENTE and PASTOR_PRINCIPAL).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/MembersPage.tsx apps/web/src/App.tsx apps/web/src/components/layout/AppLayout.tsx
git commit -m "feat(web): add members management page with invite and role update"
```

---

## Task 21: Tenant isolation test suite (INV-01 through INV-10)

**Files:**
- Create: `apps/api/src/tests/tenant-isolation.test.ts`

- [ ] **Step 1: Write the test suite**

```typescript
// apps/api/src/tests/tenant-isolation.test.ts
// Integration tests — requires real DB (pnpm db:test:migrate)
import { describe, it, expect, beforeAll } from 'vitest'
import { db } from '../db'
import { sql } from 'drizzle-orm'
import { PessoasRepository } from '../modules/pessoas/repositories/PessoasRepository'
import { EventoRepository } from '../modules/inscricoes/repositories/EventoRepository'
import { MissingTenantContextError } from '../lib/tenant/errors'
import { OrgRole, TenantContext } from '../lib/tenant/types'

const ORG_A = '10000000-0000-0000-0000-000000000001'
const ORG_B = '20000000-0000-0000-0000-000000000002'

const ctxA: TenantContext = { orgId: ORG_A, userId: 'user-a', userRole: OrgRole.PRESIDENTE }
const ctxB: TenantContext = { orgId: ORG_B, userId: 'user-b', userRole: OrgRole.PRESIDENTE }

beforeAll(async () => {
  // Seed two test orgs
  await db.execute(sql`
    INSERT INTO organization (id, name, slug, created_at, updated_at)
    VALUES
      (${ORG_A}, 'Org A', 'org-a-test', now(), now()),
      (${ORG_B}, 'Org B', 'org-b-test', now(), now())
    ON CONFLICT (id) DO NOTHING
  `)
})

// INV-01: every query includes WHERE organization_id = ctx.orgId
describe('INV-01: queries are scoped to orgId', () => {
  it('PessoasRepository.list only returns rows from the correct org', async () => {
    const repoA = new PessoasRepository(db, ctxA)
    const repoB = new PessoasRepository(db, ctxB)

    // Insert a pessoa in org A
    const pessoaA = await repoA.create({ nome: 'Test A', genero: 'M', data_nascimento: null })

    const listA = await repoA.list({ page: 1, pageSize: 100 })
    const listB = await repoB.list({ page: 1, pageSize: 100 })

    expect(listA.data.some((p) => p.id === pessoaA.id)).toBe(true)
    expect(listB.data.some((p) => p.id === pessoaA.id)).toBe(false)
  })
})

// INV-02: FK compostas prevent cross-tenant references
describe('INV-02: FK compostas block cross-tenant references', () => {
  it('inserting inscricao with evento from different org throws FK error', async () => {
    const repoA = new PessoasRepository(db, ctxA)
    const eventoRepoB = new EventoRepository(db, ctxB)

    const pessoaA = await repoA.create({ nome: 'Test FK', genero: 'F', data_nascimento: null })
    const eventoB = await eventoRepoB.create({
      nome: 'Evento B',
      data_inicio: '2026-06-01',
      data_fim: '2026-06-03',
      capacidade_maxima: 50,
    })

    // Attempt to insert inscricao for pessoa in org A referencing evento in org B
    await expect(
      db.execute(sql`
        INSERT INTO inscricoes (id, organization_id, evento_id, pessoa_id, papel, valor_total, status)
        VALUES (gen_random_uuid(), ${ORG_A}, ${eventoB.id}, ${pessoaA.id}, 'encontrista', 100, 'PENDENTE')
      `)
    ).rejects.toThrow() // FK composta violation
  })
})

// INV-09: BaseRepository throws when ctx.orgId is missing
describe('INV-09: BaseRepository throws MissingTenantContextError without orgId', () => {
  it('throws when orgId is empty string', () => {
    expect(() => new PessoasRepository(db, { ...ctxA, orgId: '' }))
      .toThrow(MissingTenantContextError)
  })

  it('throws when ctx is null', () => {
    expect(() => new PessoasRepository(db, null as any))
      .toThrow(MissingTenantContextError)
  })
})

// INV-05: lider_pessoa_id must point to same org
describe('INV-05: lider_pessoa_id must be in same org', () => {
  it('throws FK error when lider is from different org', async () => {
    const repoA = new PessoasRepository(db, ctxA)
    const repoB = new PessoasRepository(db, ctxB)

    const pessoaB = await repoB.create({ nome: 'Lider B', genero: 'M', data_nascimento: null })

    await expect(
      repoA.create({ nome: 'Liderado A', genero: 'F', data_nascimento: null, lider_pessoa_id: pessoaB.id })
    ).rejects.toThrow() // FK composta violation
  })
})

// INV-06: lider_pessoa_id != id
describe('INV-06: pessoa cannot lead themselves', () => {
  it('throws CHECK violation on self-leadership', async () => {
    const repoA = new PessoasRepository(db, ctxA)
    const pessoa = await repoA.create({ nome: 'Self Leader', genero: 'M', data_nascimento: null })

    await expect(
      repoA.update(pessoa.id, { lider_pessoa_id: pessoa.id })
    ).rejects.toThrow() // CHECK constraint violation
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
cd apps/api && pnpm test src/tests/tenant-isolation.test.ts
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/tests/tenant-isolation.test.ts
git commit -m "test(api): add tenant isolation test suite covering INV-01, 02, 05, 06, 09"
```

---

## Task 22: RBAC test suite

**Files:**
- Create: `apps/api/src/tests/rbac.test.ts`

- [ ] **Step 1: Write the test suite**

```typescript
// apps/api/src/tests/rbac.test.ts
import { describe, it, expect } from 'vitest'
import { canPerform, canViewPessoas, canViewEvento } from '../lib/tenant/permission-resolver'
import { OrgRole, Operation } from '../lib/tenant/types'

describe('RBAC matrix', () => {
  // Evento operations
  describe('Evento operations', () => {
    const eventOps = [
      Operation.CREATE_EVENTO,
      Operation.EDIT_EVENTO,
      Operation.TRANSITION_EVENTO,
      Operation.CANCEL_EVENTO,
    ]

    it('only PRESIDENTE and PASTOR_PRINCIPAL can manage events', () => {
      const admins = [OrgRole.PRESIDENTE, OrgRole.PASTOR_PRINCIPAL]
      const nonAdmins = [OrgRole.PASTOR_REDE, OrgRole.DISCIPULADOR, OrgRole.LIDER_CELULA, OrgRole.MEMBRO]

      for (const op of eventOps) {
        for (const role of admins) {
          expect(canPerform(role, op), `${role} should be able to ${op}`).toBe(true)
        }
        for (const role of nonAdmins) {
          expect(canPerform(role, op), `${role} should NOT be able to ${op}`).toBe(false)
        }
      }
    })
  })

  // Membership operations
  describe('Membership operations', () => {
    it('only PRESIDENTE can transfer presidency', () => {
      expect(canPerform(OrgRole.PRESIDENTE, Operation.TRANSFER_PRESIDENCY)).toBe(true)
      expect(canPerform(OrgRole.PASTOR_PRINCIPAL, Operation.TRANSFER_PRESIDENCY)).toBe(false)
      expect(canPerform(OrgRole.MEMBRO, Operation.TRANSFER_PRESIDENCY)).toBe(false)
    })

    it('PRESIDENTE and PASTOR_PRINCIPAL can invite members', () => {
      expect(canPerform(OrgRole.PRESIDENTE, Operation.INVITE_MEMBER)).toBe(true)
      expect(canPerform(OrgRole.PASTOR_PRINCIPAL, Operation.INVITE_MEMBER)).toBe(true)
      expect(canPerform(OrgRole.PASTOR_REDE, Operation.INVITE_MEMBER)).toBe(false)
    })
  })

  // Pessoa operations
  describe('Pessoa operations', () => {
    it('PRESIDENTE, PASTOR_PRINCIPAL, PASTOR_REDE can create pessoas', () => {
      expect(canPerform(OrgRole.PRESIDENTE, Operation.CREATE_PESSOA)).toBe(true)
      expect(canPerform(OrgRole.PASTOR_PRINCIPAL, Operation.CREATE_PESSOA)).toBe(true)
      expect(canPerform(OrgRole.PASTOR_REDE, Operation.CREATE_PESSOA)).toBe(true)
      expect(canPerform(OrgRole.DISCIPULADOR, Operation.CREATE_PESSOA)).toBe(false)
      expect(canPerform(OrgRole.LIDER_CELULA, Operation.CREATE_PESSOA)).toBe(false)
      expect(canPerform(OrgRole.MEMBRO, Operation.CREATE_PESSOA)).toBe(false)
    })

    it('all roles can self-enroll', () => {
      for (const role of Object.values(OrgRole)) {
        expect(canPerform(role as OrgRole, Operation.SELF_ENROLL)).toBe(true)
      }
    })
  })

  // Visibility scopes
  describe('Pessoas visibility scope', () => {
    it('returns correct scope per role', () => {
      expect(canViewPessoas(OrgRole.PRESIDENTE)).toBe('ALL_ORG')
      expect(canViewPessoas(OrgRole.PASTOR_PRINCIPAL)).toBe('ALL_ORG')
      expect(canViewPessoas(OrgRole.PASTOR_REDE)).toBe('OWN_SUBTREE')
      expect(canViewPessoas(OrgRole.DISCIPULADOR)).toBe('OWN_SUBTREE')
      expect(canViewPessoas(OrgRole.LIDER_CELULA)).toBe('DIRECT_CHILDREN')
      expect(canViewPessoas(OrgRole.MEMBRO)).toBe('SELF_ONLY')
    })
  })

  // Event visibility by status
  describe('Evento visibility', () => {
    it('planejamento visible only to PRESIDENTE and PASTOR_PRINCIPAL', () => {
      expect(canViewEvento(OrgRole.PRESIDENTE, 'planejamento')).toBe(true)
      expect(canViewEvento(OrgRole.PASTOR_PRINCIPAL, 'planejamento')).toBe(true)
      expect(canViewEvento(OrgRole.PASTOR_REDE, 'planejamento')).toBe(false)
      expect(canViewEvento(OrgRole.DISCIPULADOR, 'planejamento')).toBe(false)
      expect(canViewEvento(OrgRole.LIDER_CELULA, 'planejamento')).toBe(false)
      expect(canViewEvento(OrgRole.MEMBRO, 'planejamento')).toBe(false)
    })

    it('all roles can see inscricoes_abertas, em_andamento, finalizado, cancelado', () => {
      const publicStatuses = ['inscricoes_abertas', 'em_andamento', 'finalizado', 'cancelado']
      for (const status of publicStatuses) {
        for (const role of Object.values(OrgRole)) {
          expect(canViewEvento(role as OrgRole, status)).toBe(true)
        }
      }
    })
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
cd apps/api && pnpm test src/tests/rbac.test.ts
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/tests/rbac.test.ts
git commit -m "test(api): add comprehensive RBAC matrix test suite"
```

---

## Task 23: Transfer presidency test suite

**Files:**
- Create: `apps/api/src/tests/transfer-presidency.test.ts`

- [ ] **Step 1: Write the test suite**

```typescript
// apps/api/src/tests/transfer-presidency.test.ts
// Integration test — requires real DB
import { describe, it, expect, beforeAll } from 'vitest'
import { db } from '../db'
import { sql } from 'drizzle-orm'
import { TransferPresidencyUseCase } from '../modules/organizations/usecases/TransferPresidencyUseCase'
import { TenantForbiddenError } from '../lib/tenant/errors'
import { OrgRole, TenantContext } from '../lib/tenant/types'

const TEST_ORG_ID = '30000000-0000-0000-0000-000000000003'
const PRESIDENT_USER_ID = 'president-user-id'
const TARGET_USER_ID = 'target-user-id'

beforeAll(async () => {
  await db.execute(sql`
    INSERT INTO organization (id, name, slug, created_at, updated_at)
    VALUES (${TEST_ORG_ID}, 'Transfer Test Org', 'transfer-test', now(), now())
    ON CONFLICT (id) DO NOTHING
  `)

  // Ensure test users exist in the user table
  await db.execute(sql`
    INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
    VALUES
      (${PRESIDENT_USER_ID}, 'Presidente', 'president@test.com', true, now(), now()),
      (${TARGET_USER_ID}, 'Target', 'target@test.com', true, now(), now())
    ON CONFLICT (id) DO NOTHING
  `)

  // Create memberships
  await db.execute(sql`
    INSERT INTO member (id, user_id, organization_id, role, created_at)
    VALUES
      (gen_random_uuid(), ${PRESIDENT_USER_ID}, ${TEST_ORG_ID}, 'PRESIDENTE', now()),
      (gen_random_uuid(), ${TARGET_USER_ID}, ${TEST_ORG_ID}, 'PASTOR_PRINCIPAL', now())
    ON CONFLICT DO NOTHING
  `)
})

const presidentCtx: TenantContext = {
  orgId: TEST_ORG_ID,
  userId: PRESIDENT_USER_ID,
  userRole: OrgRole.PRESIDENTE,
}

describe('TransferPresidencyUseCase', () => {
  it('successfully transfers presidency', async () => {
    const uc = new TransferPresidencyUseCase(db, presidentCtx)
    await uc.execute(TARGET_USER_ID)

    const [newPresident] = await db.execute(sql`
      SELECT role FROM member
      WHERE organization_id = ${TEST_ORG_ID} AND user_id = ${TARGET_USER_ID}
    `) as any[]

    expect(newPresident.role).toBe('PRESIDENTE')

    const [oldPresident] = await db.execute(sql`
      SELECT role FROM member
      WHERE organization_id = ${TEST_ORG_ID} AND user_id = ${PRESIDENT_USER_ID}
    `) as any[]

    expect(oldPresident.role).toBe('PASTOR_PRINCIPAL')
  })

  it('throws TenantForbiddenError when non-president attempts transfer', async () => {
    const nonPresidentCtx: TenantContext = {
      orgId: TEST_ORG_ID,
      userId: TARGET_USER_ID,
      userRole: OrgRole.PASTOR_PRINCIPAL,
    }
    const uc = new TransferPresidencyUseCase(db, nonPresidentCtx)
    await expect(uc.execute(PRESIDENT_USER_ID)).rejects.toThrow(TenantForbiddenError)
  })

  it('cannot have two PRESIDENTEs simultaneously (partial index constraint)', async () => {
    // The partial index one_president_per_org prevents this at DB level
    await expect(
      db.execute(sql`
        INSERT INTO member (id, user_id, organization_id, role, created_at)
        VALUES (gen_random_uuid(), ${PRESIDENT_USER_ID}, ${TEST_ORG_ID}, 'PRESIDENTE', now())
      `)
    ).rejects.toThrow() // unique constraint violation
  })

  it('throws when trying to transfer to non-member', async () => {
    const uc = new TransferPresidencyUseCase(db, presidentCtx)
    await expect(uc.execute('non-existent-user-id')).rejects.toThrow('not a member')
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
cd apps/api && pnpm test src/tests/transfer-presidency.test.ts
```

Expected: All tests pass.

- [ ] **Step 3: Run the full test suite**

```bash
cd apps/api && pnpm test
```

Expected: All tests pass.

- [ ] **Step 4: Final type-check across both apps**

```bash
cd apps/api && pnpm type-check && cd ../web && pnpm type-check
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/tests/transfer-presidency.test.ts
git commit -m "test(api): add transfer presidency integration tests including partial index enforcement"
```

---

## Self-Review Against Spec

**Spec coverage check:**

| Spec Section | Covered by Tasks |
|---|---|
| 3.1 Tenant security — session-only orgId | Task 8 (TenantMiddleware) |
| 3.2 Isolation layer 1 — BaseRepository | Task 9 |
| 3.2 Isolation layer 2 — FK compostas | Task 4 |
| 3.2 Isolation layer 3 — RLS (deferred v1.1) | Not in this plan — by design |
| 3.3 Better Auth manages org/member/invitation | Task 7 |
| 3.3 TenantMiddleware extracts from session | Task 8 |
| 3.3 PermissionResolver pure function | Task 10 |
| 3.3 BaseRepository auto-injects orgId | Task 9 |
| 4.1 Schema: pessoas/eventos/inscricoes/locais get organization_id | Tasks 1–3 |
| 4.1 pessoas.user_id + lider_pessoa_id | Tasks 1, 7 |
| 4.1 FK composta on lider_pessoa_id | Task 4 |
| 4.1 no_self_leadership CHECK | Task 5 |
| 4.2 Unique composite indexes | Task 3 |
| 4.2 one_president_per_org partial index | Task 5 |
| 4.4 CTE recursiva findSubtree | Task 12 |
| 5.1–5.4 RBAC: canPerform, canViewPessoas, canViewEvento | Task 10 |
| 5.5 Atomic presidency transfer | Task 13 |
| 6. Invariants tested | Tasks 21–23 |
| 8. Phase 8.5 roadmap steps 1–23 | Tasks 1–23 |
| Frontend: OrgContext | Task 16 |
| Frontend: query key migration | Task 17 |
| Frontend: OrgSwitcher + queryClient.clear() | Task 18 |
| Frontend: onboarding | Task 19 |
| Frontend: members page | Task 20 |

**No gaps found.** Backfill script and slug user-choice are both addressed.
