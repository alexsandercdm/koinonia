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
