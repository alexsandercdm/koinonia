# Phase 07: Participantes CRUD UI - Research

**Researched:** 2026-04-26
**Status:** Ready for planning

## Research Complete

Phase 7 should be planned as a frontend-led integration with one narrow backend completion: the current API supports list, create, get-by-id, health/contact updates, history, and soft-delete, but it does not expose a full participant update endpoint for personal fields such as `nome`, `genero`, `data_nascimento`, `telefone`, `email`, and `padrinho_id`.

The safest implementation path is:

1. Complete the backend update contract in the existing pessoas module, preserving `routes -> controllers -> usecases -> repositories`.
2. Add a participant hook module in `apps/web/src/hooks` that owns query keys, paginated list unwrapping, detail/history queries, and create/update/delete mutations.
3. Replace `ParticipantsPage.tsx` local inline fetching with a mobile-first operational page using the Phase 6.5 primitives and a sheet-based participant record workflow.

## Phase Requirement Coverage

| Requirement | Research conclusion |
|-------------|---------------------|
| UI-PES-01 | Use TanStack Query cache as the first source for local filtering; keep list query data cached for offline grace and avoid new backend fetches on every keystroke. |
| UI-PES-02 | Implement one three-tab form experience backed by shared `CreatePessoaDTO` / `UpdatePessoaDTO` types and on-blur validation. |
| UI-PES-03 | Use `GET /api/v1/participantes/:id/historico` inside the same sheet experience instead of adding a new route. |
| UI-PES-04 | Use existing `DELETE /api/v1/participantes/:id` soft-delete endpoint, with confirmation copy that explicitly says history is preserved. |

## Current Backend Contract

Existing endpoints in `apps/api/src/modules/pessoas/routes/participantes.ts`:

- `GET /api/v1/participantes`
- `POST /api/v1/participantes`
- `GET /api/v1/participantes/:id`
- `GET /api/v1/participantes/:id/historico`
- `PATCH /api/v1/participantes/:id/saude`
- `DELETE /api/v1/participantes/:id`

The list endpoint returns `{ data, pagination }`, while the current page uses `apiFetchList` to unwrap arrays. That works for basic display but hides pagination metadata and leaves no domain-specific query key structure.

Backend gap:

- Full participant edit is not available outside `/saude`.
- Phase success criterion 3 only names allergy editing, but the phase goal and UI-PES-02 require create/edit participant with a complete form. Add `PATCH /api/v1/participantes/:id` for personal + health + emergency data rather than forcing the UI to patch only health fields.

Recommended backend shape:

- New `UpdateParticipanteUseCase.ts`
- New `UpdateParticipanteUseCase.test.ts`
- Controller method `update`
- Route `PATCH /participantes/:id` guarded by `requireRole('lider')`
- Audit action `UPDATE_PARTICIPANT`
- Keep `/participantes/:id/saude` for backward compatibility and focused health updates.

## Current Frontend Contract

`apps/web/src/pages/ParticipantsPage.tsx` already has the post-redesign visual baseline: warm cards, `FilterTabs`, `Input`, `Button`, `EmptyState`, and Hallowed Weight tokens.

Missing frontend pieces:

- `useParticipantes` is currently inline in the page.
- There is no participant detail/history query.
- There are no create/update/delete mutations.
- CTA and "Ver ficha" are not wired.
- Form primitives exist, but there is no participant form component.
- Role-aware destructive action states are not connected to `useAuthContext`.

Recommended frontend shape:

- `apps/web/src/hooks/use-participantes.ts`
- `apps/web/src/components/participantes/ParticipanteForm.tsx`
- `apps/web/src/components/participantes/ParticipanteFichaSheet.tsx`
- `ParticipantsPage.tsx` owns search/filter/sheet open state and delegates data operations to hooks/components.

## Validation Architecture

Static checks:

- `pnpm --filter @koinonia/api type-check`
- `pnpm --filter @koinonia/api test -- UpdateParticipanteUseCase`
- `pnpm --filter @koinonia/web type-check`
- `pnpm --filter @koinonia/web build`

Behavior checks:

- `GET /api/v1/participantes` response is consumed as `{ data, pagination }`.
- Searching `João` filters immediately from cached query data without changing the query key on each keystroke.
- Create flow posts `nome` and `genero` plus optional health/emergency fields, then invalidates `participantesKeys.lists()`.
- Edit flow can update `alergias` and personal fields, then reload detail/list data.
- Soft-delete calls `DELETE /api/v1/participantes/:id`, removes the item from active list cache, and does not call any inscription delete endpoint.
- Inline errors appear after blur for `nome`, `genero`, `email`, `telefone`, and emergency phone fields before final submit.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Sensitive health fields become un-audited through a broad update endpoint | Route full updates through an audited use case and log `UPDATE_PARTICIPANT` with changed fields. |
| Frontend role behavior diverges from backend RBAC | Use backend as enforcement source; frontend only disables/hides write actions based on `user.role` and still handles 403/401 via `ApiError`. |
| Offline search accidentally becomes server search on every keystroke | Keep search state local and filter `participantesQuery.data?.data`; backend `q` can be reserved for future explicit refresh/search. |
| Form invents fields outside shared schema | Build payload from `CreatePessoaDTO` / `UpdatePessoaDTO` fields only. |
| Soft-delete appears like permanent deletion | Confirmation copy must include "historico de inscricoes preservado" and success state must remove from active list only. |

## Planning Recommendation

Create three executable plans:

1. Backend full participant update contract and tests.
2. Participant frontend hook layer and sheet/form components.
3. Participants page integration, role-aware soft-delete, history tab, and final verification.

