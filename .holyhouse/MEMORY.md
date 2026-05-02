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
