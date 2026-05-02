# Memory

Record durable project knowledge here.

## Required Entries

- Stable project facts
- Architectural constraints
- Reusable implementation patterns
- Known risks
- Lessons from completed work
- Open questions that affect future decisions

## ERROR_PATTERN - API type-check requires shared declarations

- Date: 2026-05-01
- Context: `pnpm --filter @koinonia/api type-check` failed with TS6305 because `packages/shared/dist/index.d.ts` had not been generated from `packages/shared/src/index.ts`.
- Correction: Run `pnpm --filter @koinonia/shared build` first when a fresh worktree has dependencies but no ignored shared `dist` output, then rerun the API type-check.
- Evidence: After building `@koinonia/shared`, `pnpm --filter @koinonia/api type-check` passed.

## ERROR_PATTERN - Better Auth organization invitations require team_id

- Date: 2026-05-01
- Context: Phase 8.5 Task 1 review found that Better Auth 1.6.2 organization invitation creation passes a `teamId` property even when teams are not enabled.
- Correction: Keep the Drizzle `invitation` table schema compatible by including nullable `teamId: text("team_id")`; otherwise the Drizzle adapter rejects invitation inserts because the payload contains a field missing from the table schema.
- Evidence: Added nullable `team_id` to `apps/api/src/db/auth-schema.ts`; migration remains intentionally assigned to Phase 8.5 Task 2.

## GATE_ADJUSTMENT - Drizzle migrate requires DATABASE_URL in environment

- Date: 2026-05-01
- Context: Phase 8.5 Task 2 generated `apps/api/drizzle/0000_old_gorgon.sql`, then `pnpm db:migrate` failed before connecting because Drizzle config read `process.env.DATABASE_URL` as undefined.
- Adjustment: Treat migration application as blocked until `DATABASE_URL` is supplied to `apps/api` during `pnpm db:migrate`; generated migration files can still be reviewed for correctness.
- Evidence: `pnpm db:migrate` output: `Error  Please provide required params for Postgres driver: [x] url: undefined`.
- Correction: Loaded the existing API environment from the checkout at `/Users/alexsandercdm/Projetos/koinonia/apps/api/.env` without printing secrets, then reran migration with elevated local DB access.

## GATE_ADJUSTMENT - Drizzle migration history is not tracked

- Date: 2026-05-01
- Context: Phase 8.5 Task 2 expected a narrow `0006_better_auth_orgs.sql`, but `apps/api/drizzle/` was ignored and no prior Drizzle migration history existed in git, so `pnpm db:generate` produced a full baseline `0000_old_gorgon.sql`.
- Adjustment: Do not apply or commit the generated baseline against an existing database. A future agent must choose a migration strategy explicitly: either track a baseline for a fresh database, or author incremental manual migrations for the existing schema and include the required Drizzle metadata.
- Evidence: Generated SQL contained `CREATE TABLE` for all existing domain tables, not only Better Auth organization changes.
- Correction: User chose the existing-database path. Removed the generated baseline, unignored `apps/api/drizzle/`, authored `0006_better_auth_orgs.sql` as an incremental migration only for Better Auth organization tables/session column, and applied it successfully.

## ERROR_PATTERN - Migration index names must match Drizzle schema names

- Date: 2026-05-01
- Context: Phase 8.5 Task 2 spec review found the manual migration created `member_orgId_idx` while `auth-schema.ts` declares `member_organizationId_idx`.
- Correction: Use the exact Drizzle schema index names in manual migrations; renamed the local database index and migration SQL to `member_organizationId_idx`.
- Evidence: PostgreSQL index check returned `member_organizationId_idx` and `member_userId_idx`.

## GATE_ADJUSTMENT - Incremental tenant migration is existing-DB-only

- Date: 2026-05-02
- Context: Task 2 quality review found that tracking only incremental `0006` inside `apps/api/drizzle/` would break clean DB migrations and future Drizzle generation because no historical baseline/snapshots exist.
- Adjustment: Keep `apps/api/drizzle/` ignored as before and store the Phase 8.5 organization migration under `apps/api/src/db/manual-migrations/` with an explicit manual runner.
- Evidence: Added `apps/api/src/scripts/apply-manual-migration.ts` and `db:migrate:manual`; clean DB Drizzle stream remains unchanged while existing DB migration remains reproducible.

## ERROR_PATTERN - pnpm script args may include `--`

- Date: 2026-05-02
- Context: `pnpm db:migrate:manual -- src/db/manual-migrations/0006_better_auth_orgs.sql` passed `--` through to the TS script as `process.argv[2]`, causing the runner to try opening a file literally named `--`.
- Correction: Manual migration scripts should parse `process.argv.slice(2)` and ignore standalone `--` separators.
- Evidence: Updated `apply-manual-migration.ts` to select the first non-`--` argument.

## PROJECT_RULE - Better Auth organization session contract

- Date: 2026-05-02
- Context: Phase 8.5 Task 3 validated Better Auth Organizations behavior in the running Fastify API before implementing tenant middleware.
- Rule: `require("better-auth/plugins").organization` is available and `typeof organization === "function"`.
- Rule: The active organization is exposed at `session.activeOrganizationId` in both `GET /api/v1/auth/get-session` and `auth.api.getSession(...)`; there is no nested `session.session.activeOrganizationId` in the returned object.
- Rule: Better Auth 1.6.2 uses singular organization routes. Use `POST /api/v1/auth/organization/set-active`; the plural `/api/v1/auth/organizations/set-active` returns `404`.
- Rule: `auth.api.getSession({ headers })` accepted both a Web `Headers` instance and a plain Fastify-style headers object containing `authorization` and `cookie`.
- Rule: Creating an organization automatically sets it active unless `keepCurrentActiveOrganization` is sent; unsetting with `{ "organizationId": null }` returns `null` and leaves `session.activeOrganizationId` as `null`.
- Rule: Successful `POST /api/v1/auth/organization/set-active` returns the organization object with keys `createdAt`, `id`, `logo`, `metadata`, `name`, and `slug`, and the next `get-session` call reflects the selected organization id.
- Evidence: Runtime spike signed up/signed in a temporary user, created an organization, unset/set active org, confirmed session shape, confirmed plural endpoint `404`, and cleaned up the temporary user/org records.

## ERROR_PATTERN - Better Auth baseURL must include mounted auth prefix

- Date: 2026-05-02
- Context: Phase 8.5 Task 3 spike returned internal Better Auth `404` when `BETTER_AUTH_URL` was set to only the host/port while the Fastify handler is mounted under `/api/v1/auth`.
- Correction: In API runtime and auth tests, set `BETTER_AUTH_URL` to the full mounted auth base path, e.g. `http://127.0.0.1:3137/api/v1/auth`, when exercising `/api/v1/auth/*` endpoints.
- Risk: `apps/api/.env.example` currently still shows `BETTER_AUTH_URL="http://localhost:3001"` and must be aligned in a follow-up before relying on it as setup guidance.
- Evidence: The same spike succeeded after using the full auth base path; sign-up/sign-in, organization create, set-active, and get-session all returned `200`.

## PROJECT_RULE - Default tenant during Phase 8.5 transition

- Date: 2026-05-02
- Context: Phase 8.5 Task 6 made root domain `organization_id` columns non-null before TenantMiddleware has been introduced into all write paths.
- Rule: Until request-scoped tenant context is implemented, root domain creation flows must assign `DEFAULT_ORGANIZATION_ID` from `apps/api/src/db/default-organization.ts`; enrollment creation should inherit `organization_id` from its event.
- Evidence: Type-check failed after `.notNull()` because `CreateLocalUseCase` and `CreateParticipanteUseCase` inserted rows without `organization_id`; adding the default tenant to local/participant/event creation and inheriting event org for inscriptions restored `pnpm --filter @koinonia/api type-check`.

## ERROR_PATTERN - Composite FK columns must match UUID target types

- Date: 2026-05-02
- Context: Phase 8.5 Task 7 needed `(organization_id, lider_pessoa_id) -> pessoas(organization_id, id)`, but the phase plan's Task 4 snippet had introduced `lider_pessoa_id` as `text` while the design spec and live `pessoas.id` are `uuid`.
- Correction: Convert `pessoas.lider_pessoa_id` to `uuid` before adding `fk_lider_pessoa_org`; keep the Drizzle schema as `uuid('lider_pessoa_id')`.
- Evidence: A preflight query failed with `operator does not exist: uuid = text`; after migration `0009_tenant_step3_composite_fks.sql`, `information_schema` reported `lider_pessoa_id` as `uuid` and all four composite FK constraints existed.

## ERROR_PATTERN - Drizzle eq helper needs a typed column in generic tenant helpers

- Date: 2026-05-02
- Context: Phase 8.5 Task 11 initially typed `whereOrg(table)` as `{ organization_id: unknown }`, which let the Vitest unit test pass but made `pnpm --filter @koinonia/api type-check` fail with `TS2769` because `eq()` requires a Drizzle column/SQL wrapper on the left side.
- Correction: In generic repository helpers, type `organization_id` as `AnyColumn` from `drizzle-orm` before passing it to `eq(...)`.
- Evidence: After changing `whereOrg(table: { organization_id: AnyColumn })`, the BaseRepository unit test still passed and the API type-check stopped failing on `base-repository.ts`.
