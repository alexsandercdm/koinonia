# State

This file is the current operating snapshot for AI agents.

## Current Goal

- Implement Phase 8.5 — Multi-Tenant Foundation before Phase 8 Eventos CRUD UI.

## Active Work

- Phase 8.5 onboarding/switcher flow is in progress: web now has org setup + selection paths, and backend participants now require `tenantCtx` instead of the default-org fallback.

## Next Step

- Resume verification once the API test database is reachable on `localhost:5432`, then run the updated tenant-aware API suites and commit the backend/web transition slice.

## Blockers

- API E2E verification is currently blocked for two reasons: there is no reachable Postgres test instance on `localhost:5432` for `apps/api/.env.test`, and `src/scripts/test-migrate.ts` still expects a Drizzle `meta/_journal.json` history that no longer exists in this repo.
