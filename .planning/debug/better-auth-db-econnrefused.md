---
status: resolved
trigger: "Better Auth login/query fails with ECONNREFUSED while selecting user by email"
created: 2026-04-26
updated: 2026-04-26
---

# Debug Session: better-auth-db-econnrefused

## Symptoms

- expected_behavior: Better Auth login/session-related requests should query the PostgreSQL-backed `user` table and return an auth response instead of a server error.
- actual_behavior: The API logs a database connection failure while Better Auth attempts to select a user by email; the request completes with HTTP 500.
- error_messages: |
    DATA_START
    async <anonymous> (/Users/alexsandercdm/Projetos/koinonia/node_modules/.pnpm/better-auth@1.6.2_@opentelemetry+api@1.9.1_drizzle-kit@0.31.10_drizzle-orm@0.45.2_@openteleme_76tjhgezshyp57mmndpy4zmqm4/node_modules/better-auth/dist/api/to-auth-endpoints.mjs:73:21)
    at async processRequest (/Users/alexsandercdm/Projetos/koinonia/node_modules/.pnpm/better-call@1.3.5_zod@4.3.6/node_modules/better-call/src/router.ts:257:22) {
      query: 'select "id", "name", "email", "email_verified", "image", "role", "created_at", "updated_at" from "user" where "user"."email" = $1',
      params: [ 'alexsandercmoura@gmail.com' ],
      cause: AggregateError [ECONNREFUSED]
    }
    request completed statusCode=500
    GET /api/v1/auth/get-session statusCode=200
    DATA_END
- timeline: Reported on 2026-04-26 after the dev API was running and receiving auth requests.
- reproduction: Trigger a Better Auth flow from the dev web app/API so the API executes a user lookup for `alexsandercmoura@gmail.com`.

## Current Focus

- hypothesis: The API was configured to connect to localhost:5434 while the local Docker PostgreSQL service exposes localhost:5432.
- test: Compare API env files with docker-compose.dev.yml and local listening ports.
- expecting: The configured DATABASE_URL port does not have a listener; the Docker Compose database does.
- next_action: verify the auth/database path after correcting DATABASE_URL.
- reasoning_checkpoint:
- tdd_checkpoint:

## Evidence

- timestamp: 2026-04-26T12:00:16-03:00
  observation: `apps/api/.env` was observed with `DATABASE_URL="postgresql://koinonia:koinonia123@localhost:5434/koinonia"` earlier in the session, while the current file now points to `localhost:5432`.
  interpretation: The development auth database URL needed to align with the Compose-exposed PostgreSQL port.
- timestamp: 2026-04-26T12:00:16-03:00
  observation: `apps/api/.env.test` configured `DATABASE_URL="postgresql://test:test@localhost:5434/koinonia_test"` before the fix.
  interpretation: Test auth/database flows would hit the same closed port.
- timestamp: 2026-04-26T12:00:16-03:00
  observation: `docker-compose.dev.yml` maps the local PostgreSQL service as `"5432:5432"`.
  interpretation: The project-provided development database is exposed on host port 5432, not 5434.
- timestamp: 2026-04-26T12:00:16-03:00
  observation: `lsof -nP -iTCP:5432 -sTCP:LISTEN` showed Docker listening on `*:5432`; `lsof -nP -iTCP:5434 -sTCP:LISTEN` returned no listener.
  interpretation: ECONNREFUSED is expected for connections to localhost:5434.
- timestamp: 2026-04-26T12:00:45-03:00
  observation: `docker compose -f docker-compose.dev.yml ps` showed `koinonia-postgres-dev` up with `0.0.0.0:5432->5432/tcp`.
  interpretation: The local database service itself was running; the API config pointed at the wrong host port.
- timestamp: 2026-04-26T12:02:00-03:00
  observation: After updating `apps/api/.env` to port 5432, a local `postgres` package query using the API environment returned `[{"ok":1}]`.
  interpretation: The API development database URL can establish a connection to the running local PostgreSQL service.
- timestamp: 2026-04-26T12:02:00-03:00
  observation: The exact Better Auth lookup query for `alexsandercmoura@gmail.com` returned one matching user row.
  interpretation: The reported failure path no longer fails with `ECONNREFUSED` after the development database URL correction.
- timestamp: 2026-04-26T12:02:00-03:00
  observation: `pnpm --filter @koinonia/api db:test:migrate` completed successfully with the local `.env.test` database URL on port 5432.
  interpretation: Test database connectivity is also repaired for DB-backed auth tests.
- timestamp: 2026-04-26T12:02:00-03:00
  observation: `pnpm --filter @koinonia/api exec vitest run src/tests/auth.test.ts` passed 4 tests.
  interpretation: The narrow auth regression suite passes after the local database URL fixes.
- timestamp: 2026-04-26T12:04:00-03:00
  observation: `pnpm --filter @koinonia/api type-check` completed successfully.
  interpretation: The backend TypeScript surface remains valid after the environment/config-only fix.

## Eliminated

- Better Auth/Drizzle schema mismatch: the failing query reached the expected Better Auth `user` table lookup; the immediate failure was connection refusal before SQL execution could succeed or fail semantically.
- PostgreSQL container down: Docker Compose showed `koinonia-postgres-dev` up and bound to host port 5432.
- Supabase Auth/JWT flow issue: the live code uses Better Auth with the Drizzle adapter; no Supabase Auth path was involved in the failing query.

## Specialist Review

- specialist_hint: general
- result: No separate `engineering:debug` specialist skill was available in this Codex session; fix direction was reviewed against local evidence and kept to environment/database configuration only.

## Resolution

- root_cause: API environment files pointed Better Auth/Drizzle at `localhost:5434`, but the local Docker PostgreSQL service is exposed on `localhost:5432`, causing ECONNREFUSED during user lookup queries.
- fix: Updated `apps/api/.env.test` DATABASE_URL from port 5434 to port 5432; `apps/api/.env` is now also set to port 5432.
- verification: Verified development DB connectivity with `select 1`, verified the exact Better Auth user lookup returns one row, verified test DB migrations with `pnpm --filter @koinonia/api db:test:migrate`, verified `src/tests/auth.test.ts` passes, and ran `pnpm --filter @koinonia/api type-check`.
- files_changed: `apps/api/.env`, `apps/api/.env.test`, `.planning/debug/better-auth-db-econnrefused.md`
