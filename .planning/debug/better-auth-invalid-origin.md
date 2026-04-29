---
status: resolved
trigger: "@koinonia/api:dev: 2026-04-26T14:45:16.353Z ERROR [Better Auth]: Invalid origin: http://localhost:3000"
created: 2026-04-26
updated: 2026-04-26
---

# Debug Session: better-auth-invalid-origin

## Symptoms

- expected_behavior: The web app running in dev should be accepted by the API auth layer when it calls Better Auth endpoints.
- actual_behavior: The API logs a Better Auth invalid origin error for `http://localhost:3000`.
- error_messages: `@koinonia/api:dev: 2026-04-26T14:45:16.353Z ERROR [Better Auth]: Invalid origin: http://localhost:3000`
- timeline: Started after `pnpm dev` was able to run far enough to start the API.
- reproduction: Run the dev stack and trigger a request from the web origin `http://localhost:3000` to the API auth flow.

## Current Focus

- hypothesis: Confirmed. Better Auth trusted origins omitted the actual Vite dev origin `http://localhost:3000`.
- test: Completed. Added Better Auth `trustedOrigins` from API `CORS_ORIGIN`, trimmed CORS list entries, and verified with type/build/config checks.
- expecting: Satisfied by runtime config probe; DB-backed E2E test could not complete because local Postgres was unavailable.
- next_action: none
- reasoning_checkpoint:
- tdd_checkpoint:

## Evidence

- timestamp: 2026-04-26T14:49:45Z
  source: `apps/api/src/config/auth.ts`
  observation: Better Auth was configured with `baseURL: process.env.BETTER_AUTH_URL` but no `trustedOrigins`.
  implication: Better Auth derived trusted origins from the API base URL only, not the Vite web origin.
- timestamp: 2026-04-26T14:49:45Z
  source: `apps/api/src/config/env.ts`, `apps/api/.env`, `apps/api/src/app.ts`
  observation: API CORS defaults and local env include `http://localhost:3000`, and Fastify CORS uses `env.CORS_ORIGIN`.
  implication: Fastify CORS allowed the dev origin, but Better Auth performs its own origin/CSRF validation.
- timestamp: 2026-04-26T14:49:45Z
  source: `node_modules/better-auth/dist/context/helpers.mjs`, `node_modules/better-auth/dist/api/middlewares/origin-check.mjs`
  observation: Better Auth builds trusted origins from `baseURL`, explicit `options.trustedOrigins`, and `BETTER_AUTH_TRUSTED_ORIGINS`; origin validation logs `Invalid origin: {origin}` when a cookie-bearing request origin is not in that list.
  implication: `http://localhost:3000` must be passed to Better Auth `trustedOrigins` or the env var, not only Fastify CORS.
- timestamp: 2026-04-26T14:54:11Z
  source: `apps/api/src/config/auth.ts`, `apps/api/src/app.ts`
  observation: Fix derives Better Auth `trustedOrigins` from `env.CORS_ORIGIN`, trims comma-separated origins, and excludes `*` from Better Auth trusted origins.
  implication: Existing API CORS configuration remains the single local origin allow-list while avoiding a global Better Auth trust wildcard.
- timestamp: 2026-04-26T14:54:11Z
  source: runtime probe with `CORS_ORIGIN='http://localhost:3000, http://localhost:3001, *'`
  observation: `auth.options.trustedOrigins` resolved to `["http://localhost:3000","http://localhost:3001"]`.
  implication: Better Auth now receives the web dev origin that produced the invalid origin log.
- timestamp: 2026-04-26T14:54:11Z
  source: verification commands
  observation: `pnpm --filter @koinonia/api type-check`, `pnpm --filter @koinonia/api build`, and `pnpm --filter @koinonia/web type-check` passed. `pnpm --filter @koinonia/api exec vitest run src/tests/auth.test.ts` could not complete because Postgres on `localhost:5434` refused connections.
  implication: Code and cross-layer typing/build checks pass; DB-backed auth E2E should be rerun once the local test database is available.

## Eliminated

- API route prefix mismatch: `apps/web/src/lib/auth.ts` already points Better Auth client at `/api/v1/auth`.
- Vite dev port mismatch: `apps/web/vite.config.ts` and Playwright config use `http://localhost:3000`.

## Resolution

- root_cause: Better Auth was only trusting the API base URL origin from `BETTER_AUTH_URL`; the frontend dev origin `http://localhost:3000` was present in Fastify CORS but not in Better Auth `trustedOrigins`.
- fix: Added `trustedOrigins` to Better Auth config from `env.CORS_ORIGIN`, trimming origin entries and excluding `*`; also trimmed Fastify CORS origin entries and added a regression test for cookie-bearing auth requests from `http://localhost:3000`.
- verification: Passed API type-check, API build, web type-check, and runtime config probe showing Better Auth trusted origins include `http://localhost:3000`; DB-backed auth E2E was blocked by `ECONNREFUSED localhost:5434`.
- files_changed: `apps/api/src/config/auth.ts`, `apps/api/src/app.ts`, `apps/api/src/tests/auth.test.ts`, `apps/api/src/tests/helpers/setupAuth.ts`, `.planning/debug/better-auth-invalid-origin.md`

## Specialist Review

- specialist_hint: typescript
- result: skipped because no `typescript-expert` specialist skill is installed in this Codex session.
