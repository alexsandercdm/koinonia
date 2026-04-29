# Koinonia Project Rules

## Objective

Koinonia is a monorepo for managing spiritual retreats. Every change must preserve operational stability for registration, accommodation, payments, participant management, and authentication/authorization flows.

## Canonical Sources

1. Runtime code is the primary source of truth when documentation conflicts with implementation.
2. This file defines the project rules for AI agents and automation tools working in this repository.
3. `doc/koinonia-doc-tec.md` is the functional and architectural reference, but it contains legacy sections that still mention Supabase Auth.
4. Authentication must follow the current implementation in code: Better Auth with PostgreSQL/Drizzle.

## Mandatory Stack

- Monorepo managed with `pnpm` workspaces and Turborepo.
- Frontend: React 18, Vite, TypeScript, Tailwind CSS, TanStack Query.
- Backend: Fastify, TypeScript, Drizzle ORM, PostgreSQL.
- Auth: Better Auth, not Supabase Auth.
- Shared contracts must live in `packages/shared` when reused across apps.

## Architecture Rules

### Monorepo Boundaries

- `apps/api` owns HTTP APIs, auth server integration, business orchestration, and database access.
- `apps/web` owns UI, navigation, forms, and server-state consumption.
- `packages/shared` owns reusable types and shared contracts only.
- Do not duplicate shared schemas or types across apps when they belong in `packages/shared`.

### Backend Rules

- Preserve the current module organization: `routes` -> `controllers` -> `usecases` -> `repositories`.
- Each use case should handle one business action with explicit business intent.
- Controllers must stay thin: parse request data, call use case, map response/errors.
- Repositories encapsulate persistence details and database queries.
- New API endpoints must stay under `/api/v1`.
- Prefer explicit domain behavior over generic CRUD abstractions.
- Keep business rules out of Fastify route registration and out of React components.

### Frontend Rules

- Use TanStack Query for server state and request synchronization.
- Keep auth flows aligned with Better Auth client usage already present in `apps/web/src/lib/auth.ts`.
- Protected navigation must continue to respect authenticated and unauthenticated states.
- Build mobile-first screens because the system is expected to work in church/retreat operational contexts.
- Reuse the existing UI primitives before introducing new component patterns.

### Auth and Authorization

- Better Auth is the canonical auth solution for this project.
- Do not introduce new Supabase Auth dependencies or JWT flows that bypass Better Auth without an explicit migration decision.
- Role-based access must remain explicit and compatible with current roles such as `admin`, `lider`, and `servo`.
- Any auth change must consider backend middleware, frontend session state, protected routes, and test coverage together.

### Data and Domain Rules

- Preserve soft-delete semantics where they already exist.
- Preserve auditability for sensitive participant health data and operational changes.
- Accommodation rules, participant data, registrations, and payments are domain-critical flows and must not regress.
- Prefer additive schema evolution and explicit migrations over silent data shape changes.

## GSD Execution Rules

- Follow GSD as the default execution model for non-trivial work: discuss -> plan -> execute -> verify.
- Use the smallest viable workflow for the task, but do not skip verification when behavior changes.
- Keep changes atomic and traceable.
- When work affects multiple layers, validate the end-to-end flow instead of checking only one file or one app.
- Record assumptions explicitly when implementation details are ambiguous.

## Coding Rules

- Prefer TypeScript-first changes and keep types explicit at module boundaries.
- Validate external inputs at the boundary of the system.
- Avoid hidden magic, implicit coupling, and cross-layer shortcuts.
- Prefer small, focused changes that match the existing codebase style.
- Do not add new dependencies unless the current stack cannot solve the problem cleanly.
- Do not rewrite broad areas of the codebase when the task can be solved locally.

## Verification Rules

- For backend changes, run the relevant API tests and type-checks when feasible.
- For frontend changes, run the relevant build, type-check, and UI/E2E verification when feasible.
- For auth changes, verify login, register, protected routes, and session continuity.
- If a verification step cannot run, state that clearly in the handoff.

## Documentation Rules

- When touching architecture, auth, or workflow conventions, update the corresponding documentation if it becomes materially outdated.
- Treat mentions of Supabase Auth in legacy docs as stale unless the code has actually been migrated back.
- New documentation must describe the current stack as Better Auth + PostgreSQL + Drizzle.

## Anti-Regression Rules

- Do not break the existing participant, registration, accommodation, or payment flows.
- Do not create divergence between frontend auth flow and backend auth middleware.
- Do not bypass shared contracts when a shared type or schema is expected.
- Do not ship changes that only pass at file level but fail at workflow level.

## Agent Guidance

- Start from existing code patterns before proposing a new structure.
- When documentation and code disagree, call out the discrepancy and follow the live implementation.
- Use this file as the project rules baseline for Codex, GSD workflows, and Antigravity-compatible agent setups.
