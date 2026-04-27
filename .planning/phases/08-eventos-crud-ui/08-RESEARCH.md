# Phase 08: Eventos CRUD UI - Research

**Researched:** 2026-04-27
**Status:** Ready for planning

## User Constraints

- [VERIFIED: .planning/phases/08-eventos-crud-ui/08-CONTEXT.md] `doc/Design System Koinonia.html` is the canonical visual source for Phase 8.
- [VERIFIED: .planning/phases/08-eventos-crud-ui/08-CONTEXT.md] Phase 8 delivers `/eventos`, list, create, edit, status/capacity display, and a real event selector in `AppLayout`.
- [VERIFIED: .planning/phases/08-eventos-crud-ui/08-CONTEXT.md] This phase must not implement registration, payments, fake check-in persistence, accommodation flows, or server-side selected-event preferences.
- [VERIFIED: .planning/phases/08-eventos-crud-ui/08-CONTEXT.md] Backend write operations for events are admin-only and frontend affordances must respect that without bypassing backend RBAC.
- [VERIFIED: .planning/phases/08-eventos-crud-ui/08-UI-SPEC.md] UI must use DM Sans, warm surfaces, restrained gold accent, Material Symbols Rounded for navigation/domain icons, 56px header, EventPill, 10px event cards, 7px inputs/buttons, and 99px badges.

## Project Constraints From AGENTS.md

- [VERIFIED: AGENTS.md] Preserve monorepo boundaries: `apps/api` owns APIs/database access, `apps/web` owns UI and server-state consumption, and shared contracts reused across apps belong in `packages/shared`.
- [VERIFIED: AGENTS.md] Backend work must preserve `routes -> controllers -> usecases -> repositories`; controllers stay thin.
- [VERIFIED: AGENTS.md] New API endpoints and event endpoints stay under `/api/v1`.
- [VERIFIED: AGENTS.md] Frontend server state must use TanStack Query.
- [VERIFIED: AGENTS.md] Auth must remain Better Auth with current role semantics including `admin`, `lider`, and `servo`.
- [VERIFIED: AGENTS.md] Avoid regressions to participant, registration, accommodation, payment, and auth flows.

## Standard Stack

- [VERIFIED: package/runtime files] Use React 18, Vite, TypeScript, Tailwind CSS, local UI primitives, TanStack Query, Fastify, Drizzle, PostgreSQL, Better Auth.
- [VERIFIED: apps/web/src/components/ui] Existing primitives already include `Button`, `Badge`, `Card`, `Input`, `Select`, `TextArea`, `FormField`, `FilterTabs`, `Sheet`, and `EmptyState`.
- [VERIFIED: apps/web/src/hooks/use-inscricoes.ts and apps/web/src/hooks/use-acomodacoes.ts] Event list query keys are duplicated today as `['eventos']`; Phase 8 should consolidate them into `apps/web/src/hooks/use-eventos.ts`.
- [VERIFIED: packages/shared/src/index.ts] `StatusEventoEnum`, `CreateEventoDTO`, and `UpdateEventoDTO` already exist and should remain the runtime enum/source for forms.

## Architecture Patterns

- [VERIFIED: apps/api/src/modules/inscricoes] Event backend code currently lives in the inscricoes module as `routes/inscricoes.ts`, `controllers/EventoController.ts`, `usecases/CreateEventoUseCase.ts`, `usecases/UpdateEventoUseCase.ts`, and `repositories/EventoRepository.ts`.
- [VERIFIED: apps/api/src/modules/inscricoes/controllers/EventoController.ts] `EventoController.list()` currently calls `repository.list()` directly. Phase 8 should add a `ListEventosUseCase` so the list path follows the required controller -> usecase -> repository pattern.
- [VERIFIED: apps/api/src/modules/inscricoes/repositories/EventoRepository.ts] `EventoRepository.list()` currently returns event rows without inscription counts. This is not enough to truthfully render occupancy bars required by the roadmap.
- [VERIFIED: apps/api/src/db/schema.ts] `inscricoes` references `eventos` and can be counted by `evento_id`. The aggregate should count active registration rows and exclude `CANCELADA` from occupied capacity.
- [VERIFIED: apps/api/src/modules/inscricoes/routes/inscricoes.ts] Route schemas for `data_inicio` and `data_fim` currently use `format: 'date-time'`, while shared schemas and date inputs use `YYYY-MM-DD` date strings. Phase 8 should align the event route body schemas to `format: 'date'`.
- [VERIFIED: apps/web/src/App.tsx] `/eventos` route is missing and must be added behind `ProtectedRoute`.
- [VERIFIED: apps/web/src/components/layout/AppLayout.tsx] The shell already has responsive navigation and a static event placeholder. Phase 8 should add `Eventos` nav and replace the placeholder with a real EventPill using `useEventos`.

## Backend Contract Recommendation

Create a shared list DTO:

```ts
export const EventoListItemSchema = EventoSchema.extend({
  inscritos_count: z.number().int().nonnegative(),
  ocupacao_percentual: z.number().min(0).max(100),
})

export type EventoListItem = z.infer<typeof EventoListItemSchema>
```

Repository/usecase contract:

- `EventoRepository.listWithStats()` returns event fields plus `inscritos_count`.
- `ListEventosUseCase.execute()` maps `ocupacao_percentual = Math.min(100, Math.round((inscritos_count / capacidade_maxima) * 100))`, with 0 when capacity is missing or zero.
- Count only rows whose `inscricoes.status !== 'CANCELADA'`.
- Keep `GET /api/v1/eventos` authenticated for all roles and keep `POST/PUT /api/v1/eventos` admin-only.

## Frontend Contract Recommendation

- `apps/web/src/hooks/use-eventos.ts` owns `eventosKeys`, `useEventos`, `useEvento`, `useCreateEvento`, `useUpdateEvento`, and helper types.
- `use-inscricoes.ts` and `use-acomodacoes.ts` should import the shared event hook/key instead of declaring duplicate event list hooks.
- `AppLayout` should receive a real EventPill backed by `useEventos`, persist selected event id in local storage, and provide admin-only "Novo evento" affordance only when useful.
- `EventosPage` should use the shared hook, status tabs, operational cards, and an event drawer form.
- The page should render capacity as factual occupancy only after the backend aggregate exists. No fake check-in or fake occupancy state.

## Don't Hand-Roll

- Do not invent a second design language inside `EventosPage`; update shared primitives/tokens where Phase 8 touches them.
- Do not create a new frontend auth or role utility outside the current Better Auth context.
- Do not duplicate event DTOs inside page components when `packages/shared` can expose the reusable contract.
- Do not create local event mocks for runtime behavior.

## Common Pitfalls

| Pitfall | Mitigation |
|---------|------------|
| Roadmap capacity success criteria become fake because list API lacks counts | Add `inscritos_count` and `ocupacao_percentual` to the event list contract before UI cards. |
| Date picker submits `YYYY-MM-DD` but route schema expects `date-time` | Change event route schemas to `format: 'date'` and verify create/update tests. |
| Event hooks stay duplicated across modules | Create `use-eventos.ts` and update inscricoes/acomodacoes consumers. |
| EventPill becomes a static label | Wire it to `useEventos`, selected id state, status badge, and dropdown rows. |
| Non-admin users see write actions that always fail | Hide create/edit actions for non-admin roles and still handle backend 403. |
| Shared primitive changes regress participants/accommodations | Run web type-check/build and visually verify touched screens after implementation. |

## Validation Architecture

Automated checks:

- `pnpm --filter @koinonia/api type-check`
- `pnpm --filter @koinonia/api test -- ListEventosUseCase`
- `pnpm --filter @koinonia/api test -- UpdateEventoUseCase`
- `pnpm --filter @koinonia/web type-check`
- `pnpm --filter @koinonia/web build`

Behavior checks:

- `GET /api/v1/eventos` returns `inscritos_count` and `ocupacao_percentual`.
- Event list cards render status labels from `StatusEventoEnum` without inventing backend enum values.
- Admin can create an event using date input values and see the new event in the list after query invalidation.
- Admin can edit an existing event and the list updates immediately.
- Non-admin cannot see create/edit controls.
- EventPill dropdown uses the same `['eventos']` query family as EventosPage.

## Planning Recommendation

Create four executable plans:

1. Backend event list DTO, aggregate use case, date contract correction, and API tests.
2. Frontend design-system primitive/token alignment for Phase 8.
3. Shared event hooks plus AppLayout navigation/EventPill integration.
4. EventosPage cards, status filters, create/edit drawer, route wiring, and final verification.

## Research Complete
