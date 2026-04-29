---
status: resolved
trigger: "Frontend crashes on ParticipantsPage with `list.filter is not a function` and on FinanceiroPage with `despesas.filter is not a function` after TanStack Query fetches data."
created: 2026-04-26
updated: 2026-04-26
---

# Debug Session: array-response-filter-crashes

## Symptoms

- expected_behavior: Participants and financial pages should render fetched collections and allow filtering without crashing.
- actual_behavior: `ParticipantsPage` and `FinanceiroPage` crash during render when calling `.filter()` on values returned from query hooks.
- error_messages: `ParticipantsPage.tsx:93 Uncaught TypeError: list.filter is not a function`; `FinanceiroPage.tsx:180 Uncaught TypeError: despesas.filter is not a function`; React Router future flag warnings are also present but appear unrelated.
- timeline: Observed in local web app at `http://localhost:3000` after query data resolves.
- reproduction: Open the protected participants page or financial page in the local Vite app while authenticated; wait for TanStack Query to populate data.

## Current Focus

- hypothesis: API list endpoints or client query functions now return an object envelope while page components still assume a raw array.
- test:
- expecting:
- next_action: gather initial evidence from page components, frontend API client hooks, and backend route responses
- reasoning_checkpoint:
- tdd_checkpoint:

## Evidence

- timestamp: 2026-04-26T15:34:45-0300
  observation: `ParticipanteController.list` returns the `ListParticipantesUseCase` result directly, and that use case returns `{ data, pagination }`; `ParticipantsPage` was typed and rendered as if `/api/v1/participantes` returned a raw array.
  source: apps/api/src/modules/pessoas/controllers/ParticipanteController.ts, apps/api/src/modules/pessoas/usecases/ListParticipantesUseCase.ts, apps/web/src/pages/ParticipantsPage.tsx
- timestamp: 2026-04-26T15:34:45-0300
  observation: `FinanceiroController.listDespesas` sends `{ data: despesas }`; `FinanceiroPage` was typed and rendered as if `/api/v1/financeiro/despesas` returned a raw array.
  source: apps/api/src/modules/financeiro/controllers/FinanceiroController.ts, apps/web/src/pages/FinanceiroPage.tsx
- timestamp: 2026-04-26T15:34:45-0300
  observation: Added a frontend `apiFetchList` helper that unwraps either raw arrays or API list envelopes, then switched the affected participant and finance list queries to use it.
  source: apps/web/src/lib/api.ts, apps/web/src/pages/ParticipantsPage.tsx, apps/web/src/pages/FinanceiroPage.tsx
- timestamp: 2026-04-26T15:34:45-0300
  observation: `pnpm --filter @koinonia/web type-check` passed.
  source: terminal
- timestamp: 2026-04-26T15:34:45-0300
  observation: `pnpm --filter @koinonia/web build` passed; Vite reported only the existing large chunk size warning.
  source: terminal

## Eliminated

## Resolution

- root_cause: Frontend list queries assumed raw array responses, but the participant endpoint returns a paginated `{ data, pagination }` object and the finance expenses endpoint returns a `{ data }` envelope, so render-time `.filter()` calls were invoked on objects.
- fix: Added a list-aware frontend fetch helper and changed `ParticipantsPage` and `FinanceiroPage` to unwrap API list envelopes before storing query data.
- verification: `pnpm --filter @koinonia/web type-check`; `pnpm --filter @koinonia/web build`.
- files_changed: apps/web/src/lib/api.ts, apps/web/src/pages/ParticipantsPage.tsx, apps/web/src/pages/FinanceiroPage.tsx
