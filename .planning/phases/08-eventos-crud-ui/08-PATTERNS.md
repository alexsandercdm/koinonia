# Phase 08: Eventos CRUD UI - Pattern Map

**Mapped:** 2026-04-27
**Status:** Ready for planning

## Source Contracts

- `.planning/phases/08-eventos-crud-ui/08-CONTEXT.md` locks Phase 8 decisions D-01 through D-28.
- `.planning/phases/08-eventos-crud-ui/08-UI-SPEC.md` locks the visual and interaction contract.
- `.planning/phases/08-eventos-crud-ui/08-RESEARCH.md` defines the backend aggregate and frontend hook strategy.
- `.planning/ROADMAP.md` defines `UI-EVT-01` and `UI-EVT-02` success criteria.

## Target Files And Closest Analogs

| Target | Role | Closest analog | Concrete pattern to reuse |
|--------|------|----------------|---------------------------|
| `packages/shared/src/index.ts` | Shared event list DTO | Existing `EventoSchema` and DTO exports | Extend existing schemas in place; export a named `EventoListItem` type rather than duplicating in apps. |
| `apps/api/src/modules/inscricoes/repositories/EventoRepository.ts` | Event persistence/query boundary | Existing `list()`, `findById()`, Drizzle schema imports | Keep persistence details here; add aggregate list query/count helper without putting query logic in controller. |
| `apps/api/src/modules/inscricoes/usecases/ListEventosUseCase.ts` | Event list business action | `ListParticipantesUseCase.ts`, `UpdateEventoUseCase.ts` | Constructor receives repository; `execute()` maps repository rows into response contract. |
| `apps/api/src/modules/inscricoes/usecases/ListEventosUseCase.test.ts` | Backend use case test | `UpdateEventoUseCase.test.ts` | Use mocked repository and assert computed `ocupacao_percentual` and count handling. |
| `apps/api/src/modules/inscricoes/controllers/EventoController.ts` | Thin HTTP controller | Current `create`, `update`, `getById` methods | Instantiate usecase, call `execute`, map errors to Fastify replies. |
| `apps/api/src/modules/inscricoes/routes/inscricoes.ts` | Event route schemas/RBAC | Existing event POST/PUT route objects | Keep `requireAdmin` on writes, `requireAuth` on reads; align date fields to `format: 'date'`. |
| `apps/web/src/hooks/use-eventos.ts` | Shared event server-state boundary | `use-participantes.ts`, `use-acomodacoes.ts` | Key factory, list/detail queries, mutations, query invalidation, typed payloads. |
| `apps/web/src/hooks/use-inscricoes.ts` | Event hook consumer | Current duplicated `useEventos` | Re-export/import event query functions from `use-eventos.ts`; keep inscription-specific keys local. |
| `apps/web/src/hooks/use-acomodacoes.ts` | Event hook consumer | Current duplicated `useEventos` | Remove duplicated event query function and reuse `eventosKeys`. |
| `apps/web/src/components/layout/AppLayout.tsx` | Authenticated shell and EventPill | `doc/Koinonia-redesign/koinonia-layout.jsx` plus current AppLayout | Preserve current responsive shell; add Eventos nav and replace static event label with query-backed EventPill. |
| `apps/web/src/components/eventos/EventoForm.tsx` | Create/edit form | `ParticipanteForm.tsx` | Local state, on-blur validation, shared DTO payload, submit/cancel props. |
| `apps/web/src/components/eventos/EventoCard.tsx` | Operational event card | `ParticipanteCard` and UI-SPEC card contract | Status badge, dates, capacity metric, progress bar, admin edit action. |
| `apps/web/src/pages/EventosPage.tsx` | Page orchestration | `ParticipantsPage.tsx` | `AppLayout`, query state, filters, sheet state, role-aware actions, `EmptyState`. |
| `apps/web/src/App.tsx` | Route registration | Existing protected route blocks | Add `/eventos` protected route importing `EventosPage`. |

## Exact Existing Patterns

### Query keys and mutation invalidation

Use the key factory style from `use-participantes.ts` and `use-acomodacoes.ts`:

```ts
export const eventosKeys = {
  all: ['eventos'] as const,
  lists: () => [...eventosKeys.all, 'list'] as const,
  list: () => eventosKeys.lists(),
  detail: (id: string) => [...eventosKeys.all, 'detail', id] as const,
}
```

Mutations must invalidate:

- `eventosKeys.lists()` after create/update.
- `eventosKeys.detail(id)` after update.

### Backend aggregate pattern

Use Drizzle inside `EventoRepository`, not inside `EventoController`.

Recommended output row:

```ts
{
  ...evento,
  inscritos_count: number,
  ocupacao_percentual: number,
}
```

Use the use case to keep percentage math out of the repository if the repository returns raw count.

### AppLayout pattern

Keep:

- `useNavigate`, `useLocation`, `useAuthContext`.
- Mobile menu state.
- Protected pages pass actions through `AppLayout`.

Change:

- Add `{ icon: 'event', label: 'Eventos', path: '/eventos' }`.
- Active nav state uses the UI-SPEC gold active treatment.
- Header event placeholder becomes an EventPill component backed by `useEventos`.

## Non-Regression Anchors

- `apps/web/src/lib/auth.ts` remains the Better Auth client boundary.
- `apps/web/src/components/protected-route.tsx` remains the route auth boundary.
- `apps/web/src/lib/api.ts` remains the API fetch/error boundary.
- Event write RBAC remains backend-enforced by `requireRole('admin')`.
- Existing inscription and accommodation pages must continue to compile after event hook consolidation.

## Implementation Landmines

- Current route body schema expects `date-time`, but event form date inputs naturally produce `YYYY-MM-DD`.
- `EventoRepository.list()` has no occupancy aggregate, so UI capacity bars would be misleading without backend work.
- `local_id` is a UUID, not a display name; event cards must gracefully render no location name until a local relation is available.
- The official design system asks for Material Symbols Rounded for nav/domain icons; do not expand lucide usage for new domain icons.
- Shared primitive changes can affect Phase 7 pages; verification must include web type-check/build.
