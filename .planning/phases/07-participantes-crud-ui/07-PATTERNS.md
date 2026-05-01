# Phase 07: Participantes CRUD UI - Pattern Map

**Mapped:** 2026-04-26
**Status:** Ready for planning

## Source Contracts

- `.planning/phases/07-participantes-crud-ui/07-CONTEXT.md` captures Phase 7 decisions `D-01` through `D-14`.
- `.planning/phases/06.5-frontend-redesign-migration/06.5-UI-SPEC.md` is the visual and interaction baseline for Hallowed Weight UI.
- `.planning/ROADMAP.md` defines Phase 7 success criteria and requirement IDs `UI-PES-01` through `UI-PES-04`.
- `.planning/REQUIREMENTS.md` defines the v1.1 participant UI requirements and the v1 pessoa domain requirements.

## Target Files And Closest Analogs

| Target | Role | Closest analog | Concrete pattern to reuse |
|--------|------|----------------|---------------------------|
| `apps/api/src/modules/pessoas/usecases/UpdateParticipanteUseCase.ts` | Backend business action | `UpdateParticipanteSaudeUseCase.ts` | Constructor receives `Database` and `AuditLogRepository`; update `pessoas`, filter `deleted_at IS NULL`, return updated row, write audit log. |
| `apps/api/src/modules/pessoas/usecases/UpdateParticipanteUseCase.test.ts` | Backend integration test | `UpdateParticipanteSaudeUseCase.test.ts` | Build Fastify app, create authenticated `lider`, create participant through API, patch endpoint, verify persisted fields and `auditLogs`. |
| `apps/api/src/modules/pessoas/controllers/ParticipanteController.ts` | Thin HTTP orchestration | Existing `updateSaude` method | Extract `id`, `request.body`, `(request as any).user.id`, call use case, map errors to 400/500. |
| `apps/api/src/modules/pessoas/routes/participantes.ts` | HTTP route | Existing `patch('/participantes/:id/saude')` | Add `PATCH /participantes/:id` with `requireRole('lider')` and body schema matching `UpdatePessoaDTO` allowed fields. |
| `apps/web/src/hooks/use-participantes.ts` | Server-state boundary | `use-acomodacoes.ts` and `use-inscricoes.ts` | Export key factory, list/detail/history queries, mutations, `apiFetch`, and explicit invalidation. |
| `apps/web/src/components/participantes/ParticipanteForm.tsx` | Three-tab form | `FormField`, `Input`, `Select`, `Textarea`, `FilterTabs` | Keep validation state local or with React Hook Form; show inline error after blur; submit shared DTO payload. |
| `apps/web/src/components/participantes/ParticipanteFichaSheet.tsx` | Detail/edit/history sheet | `AssignCamaSheet` pattern in accommodation components | `Sheet`, `SheetContent`, `SheetHeader`, accessible title/description, mobile full-width behavior. |
| `apps/web/src/pages/ParticipantsPage.tsx` | Page orchestration | Current ParticipantsPage + `AcomodacoesPage` | Use `AppLayout`, header actions, local filter state, `EmptyState`, role-aware actions, and sheets. |

## Exact Existing Patterns

### Query keys and mutation invalidation

Use the shape from `apps/web/src/hooks/use-acomodacoes.ts`:

```ts
export const participantesKeys = {
  all: ['participantes'] as const,
  lists: () => [...participantesKeys.all, 'list'] as const,
  list: (params: ParticipantesListParams) => [...participantesKeys.lists(), params] as const,
  detail: (id: string) => [...participantesKeys.all, 'detail', id] as const,
  historico: (id: string) => [...participantesKeys.all, 'historico', id] as const,
}
```

Mutation invalidation should include:

- `participantesKeys.lists()`
- `participantesKeys.detail(id)` after update
- `participantesKeys.historico(id)` only when actions can affect participant history display.

### Backend audit pattern

Use `UpdateParticipanteSaudeUseCase.ts` as the closest current pattern:

- `this.db.update(pessoas).set({ ...data, updated_at: new Date() })`
- `.where(and(eq(pessoas.id, id), isNull(pessoas.deleted_at)))`
- `.returning()`
- `auditLogRepo.logAction({ user_id, target_id: id, action: 'UPDATE_HEALTH', changes: data as any })`

Phase 7 full update should use `UPDATE_PARTICIPANT` and still preserve the focused `UPDATE_HEALTH` endpoint.

### UI primitive pattern

Use Phase 6.5 primitives:

- `Button` variants: `gold`, `outline`, `danger`, `ghost`
- `Badge` variants: `gold`, `neutral`, `warning`, `danger`
- `FormField` for label/error/hint
- `Sheet` for the ficha workflow
- `FilterTabs` for top filters and form tabs
- `EmptyState` for no filtered records and no history

## Non-Regression Anchors

- `apps/web/src/lib/auth.ts` remains the Better Auth client boundary.
- `apps/web/src/components/protected-route.tsx` remains the protected navigation boundary.
- `apps/web/src/lib/api.ts` remains the API error and auth header boundary.
- `packages/shared/src/index.ts` remains the shared DTO/type boundary; do not duplicate schemas in page code.
- `apps/api/src/modules/pessoas/routes/participantes.ts` remains under `/api/v1` through app registration.
- `DELETE /api/v1/participantes/:id` remains soft-delete, not hard delete.

## Implementation Landmines

- Current `ListParticipantesUseCase` total calculation uses `select({ count: pessoas.id }).then(result => result.length)`, which counts the current result set rather than an aggregate count. Do not expand Phase 7 into pagination overhaul unless needed; the page can still consume `data`.
- `ParticipanteListItem` currently adds UI-only `papel`, `quarto`, and `setor`; real participant rows may not include those. Cards must degrade gracefully.
- Backend write role is `lider` for create/update/health and `admin` for delete. Frontend can present disabled actions for non-write roles, but backend remains canonical.
- Date input should submit `YYYY-MM-DD` because `PessoaSchema.data_nascimento` uses `z.string().date().optional()`.

