# Koinonia Redesign Implementation Queue

**Created:** 2026-04-26
**Source:** `doc/koinonia-redesign/`
**Purpose:** Organize the new design updates and additional implementation ideas into executable frontend/backend work without mixing visual migration, CRUD delivery, and future operational flows.

## Current Reading

The redesign package is now broader than the original Phase 6.5 migration. Phase 6.5 covers the warm-light baseline, shell, auth, existing pages, and accommodation visual migration. The new material in `doc/koinonia-redesign` also introduces or sharpens functional surfaces that belong to Phases 7-10:

- `koinonia-layout.jsx` adds a first-class `Eventos` nav item and a real event context dropdown, not just a static header label.
- `koinonia-page-eventos.jsx` adds event selection, event list cards, event create drawer, and a QR check-in overlay.
- `koinonia-pages-main.jsx` gives concrete interaction patterns for participant drawer, inscription filters, finance cards, and dashboard shortcuts.
- `koinonia-page-acomodacoes.jsx` adds structure-management drawers for local/chacara and quartos, in addition to the visual map.
- `koinonia-data.jsx` exposes the status vocabulary expected by the design, but some enum names differ from runtime shared contracts.

## Organizing Principle

Keep the redesign implementation in four lanes:

| Lane | Scope | When | Guardrail |
|---|---|---|---|
| Visual baseline closeout | Finish Phase 6.5 Plan 04 and verify warm-light non-regression | Now | No new business behavior |
| Participant operations | Turn `/participantes` into real CRUD with ficha drawer and history | Phase 7 | Use existing `pessoas` contracts and soft-delete semantics |
| Event operations | Add `/eventos`, event drawer, event context selector, and nav route | Phase 8 | Follow existing `/api/v1/eventos` Better Auth/RBAC contracts |
| Field operations polish | Check-in, inscriptions/payments, accommodation structure/offline hardening | Phases 9-10 | Do not bypass payment, accommodation, or audit rules |

## Design Delta Inventory

| Source file | New or clarified surface | Runtime status | Target |
|---|---|---|---|
| `koinonia-primitives.jsx` | Badge, Button, Input, SelectInput, TextArea, FormField, Card, Drawer, EmptyState, QRCodeSVG, FilterTabs | Mostly covered by Phase 6.5 Plan 01, except QRCodeSVG | Reuse existing primitives; add QR/check-in pieces only when Phase 8/9 needs them |
| `koinonia-layout.jsx` | Sidebar includes Eventos; EventPill dropdown switches event context | AppLayout has static event affordance and no `/eventos` route | Phase 8 shell refinement |
| `koinonia-page-eventos.jsx` | Event selector screen, event cards, EventoFormDrawer, CheckinOverlay | Backend has event list/create/update; web has no EventosPage | Phase 8 for events; check-in likely Phase 9/10 unless backend exists |
| `koinonia-pages-main.jsx` | Participant 3-step drawer, participants table/list, inscription filters, finance overview | Current pages are visually migrated but participant CRUD is not connected | Phase 7 for participants, Phase 9 for inscriptions/payments |
| `koinonia-page-acomodacoes.jsx` | Structure tab, local/quarto drawers, visual room cards | Backend/hooks already have structure mutations; Plan 04 targets visual migration | Finish Phase 6.5 Plan 04; polish/offline in Phase 10 |
| `koinonia-data.jsx` | Status maps, event mock fields, participant health examples | Some design statuses use `EM_ANDAMENTO`/`PLANEJAMENTO`; runtime uses `rascunho`/`aberto`/`encerrado`/`realizado`/`cancelado` | Normalize display mapping in shared/UI helpers, not backend enum drift |

## Recommended Execution Order

### 0. Close Phase 6.5 Before New Feature Work

Finish `06.5-04-PLAN.md` first because it completes the visual migration contract and verifies the baseline.

Implementation focus:

- `apps/web/src/pages/AcomodacoesPage.tsx`
- `apps/web/src/components/acomodacoes/*`
- stale dark-token scan across runtime frontend
- web type-check/build after resolving or confirming the TanStack Query version mismatch

Exit criteria:

- Phase 6.5 summaries include Plan 04.
- `AppLayout`, auth screens, dashboard, participants, inscrições, financeiro, and acomodações are visually coherent.
- `/eventos` is still explicitly deferred unless added by Phase 8.

### 1. Phase 7: Participantes CRUD UI

Use the design drawer from `koinonia-pages-main.jsx` as the target interaction, but keep runtime contracts canonical.

Implementation slices:

1. Create `apps/web/src/hooks/use-participantes.ts` with query keys, paginated list handling, detail, history, create/update/delete mutations.
2. Replace `ParticipantsPage.tsx` local fetch assumptions with the real `{ data, pagination }` shape.
3. Add ficha drawer with tabs/steps: `Dados`, `Saude`, `Emergencia`, and `Historico`.
4. Wire `Adicionar Participante`, `Ver ficha`, edit, and soft-delete confirmation.
5. Verify role behavior: read-only users can view; write actions reflect backend permissions.

Design notes:

- Preserve the warm card/list direction already implemented.
- Use drawer on desktop and full-screen sheet behavior on mobile.
- Do not introduce CPF/nascimento unless those fields exist in shared/backend contracts.

### 2. Phase 8: Eventos CRUD UI + Event Context

The new design makes Eventos a primary module. This should become the next major UI phase after participants.

Implementation slices:

1. Add `/eventos` route in `apps/web/src/App.tsx` and navigation entry in `AppLayout`.
2. Create `apps/web/src/hooks/use-eventos.ts` around `/api/v1/eventos` and `/api/v1/eventos/:id`.
3. Implement `EventosPage` using the design's event cards, status tabs, capacity progress, and admin-only create/edit drawer.
4. Upgrade `AppLayout` event affordance into an actual event selector backed by TanStack Query.
5. Store selected event in local state or persisted app preference first; avoid backend preference work unless required.

Backend notes:

- Existing API already has `POST /eventos`, `PUT /eventos/:id`, `GET /eventos`, and `GET /eventos/:id`.
- Create/update currently require admin. UI must not show write controls as available to `lider`/`servo`.
- Design statuses must map to runtime statuses:
  - `rascunho` -> Planejamento
  - `aberto` -> Aberto
  - `encerrado` or `realizado` -> Encerrado
  - `cancelado` -> Cancelado

### 3. Phase 9: Inscrições + Pagamentos UI

The redesign already supplies good filters and finance-adjacent status language, but the implementation should stay attached to event context.

Implementation slices:

1. Use selected event from the event context selector as the default event for inscrições.
2. Build inscription create flow: participant, papel, value/config, observacoes.
3. Add payment registration flow and inadimplentes filter.
4. Add cancellation with refund note and preserve payment history.
5. Verify all payment status colors against `StatusPagamentoEnum`.

### 4. Phase 10: Acomodações Polish + Field Operations

The accommodation design has two layers: structure management and live bed assignment. Structure CRUD is already supported in backend/hooks; field reliability remains the risky part.

Implementation slices:

1. Finish visual structure tab and local/quarto/cama drawers if Plan 04 does not complete them.
2. Add optimistic assignment/release with rollback for 409 conflicts.
3. Harden `inscricoes-sem-cama` cache invalidation to remove assigned participants immediately.
4. Add offline banner and pending-operation handling if feasible within Phase 10.
5. Re-verify PDF export with the warm layout.

### 5. Check-In QR: Keep as a Separate Decision

`CheckinOverlay` and `QRCodeSVG` are visually clear, but there is no confirmed runtime check-in domain contract in the current code scan.

Recommendation:

- Treat QR check-in as a Phase 8/9 spike before implementation.
- Do not implement fake check-in persistence.
- If the MVP needs it, add a small backend contract first: check-in status per inscription, actor, timestamp, and audit trail.

## Cross-Cutting Tasks

- Create a shared status display helper for event/payment/bed statuses so pages do not duplicate label/color maps.
- Normalize all new UI against Better Auth role data from `AuthProvider`.
- Keep new hooks domain-specific: `use-participantes.ts`, `use-eventos.ts`, `use-inscricoes.ts`, `use-acomodacoes.ts`.
- Prefer additive components in `apps/web/src/components/ui` and domain components under `apps/web/src/components/<domain>`.
- Keep all new endpoints under `/api/v1` and preserve `routes -> controllers -> usecases -> repositories`.

## Open Questions Before Building

1. Should `/eventos` become available immediately after Phase 7, or should event context be implemented first as an AppLayout-only selector?
2. Should selected event be global client state, URL-driven per page, or persisted in local storage?
3. Is QR check-in in scope for v1.1, or should it remain a design reference until after deploy?
4. Should accommodation structure CRUD be completed in Phase 6.5 Plan 04, or deferred to Phase 10 to keep Phase 6.5 visual-only?

## Immediate Next Step

Execute Phase 6.5 Plan 04, then plan Phase 7 using this queue plus `.planning/phases/07-participantes-crud-ui/07-CONTEXT.md`.
