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
