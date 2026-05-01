# Phase 08: Eventos CRUD UI + Design System Alignment - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 08-eventos-crud-ui
**Areas discussed:** Design system source, frontend organization, Eventos scope, deferred work

---

## Design System Source

| Option | Description | Selected |
|--------|-------------|----------|
| Keep Phase 6.5 JSX redesign as canonical | Continue using `doc/Koinonia-redesign/*` as primary visual source. | |
| Promote `doc/Design System Koinonia.html` | Use the design team's HTML as canonical source for tokens, typography, primitives, shell and patterns. | ✓ |
| Treat both as equal references | Let planner choose per component, risking drift. | |

**User's choice:** The design team provided `doc/Design System Koinonia.html`; Phase 8 discussion should be updated so the frontend is organized according to the official design standard.
**Notes:** The previous context relied on `doc/Koinonia-redesign/*`. Those files remain useful for flow references, but the HTML design system is now the visual authority.

---

## Frontend Organization

| Option | Description | Selected |
|--------|-------------|----------|
| Events page only | Build `/eventos` without touching shared primitives/shell beyond the minimum. | |
| Align touched shared UI first | Audit and adjust tokens, primitives and shell pieces that Eventos depends on, so the frontend stops diverging from the design system. | ✓ |
| Full app-wide redesign | Rewrite all existing pages in this phase. | |

**User's choice:** Organize the frontend in this phase because the current implementation is wrong relative to the design standard.
**Notes:** Captured as shared frontend alignment inside Phase 8, bounded to primitives/shell/Eventos and direct shared effects. Full unrelated page rewrites remain deferred.

---

## Eventos Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Keep original Phase 8 event CRUD | Add route, event list, create/edit drawer, status/capacity and event selector. | ✓ |
| Expand to check-in and payments | Include QR check-in, inscriptions and payments in the same phase. | |
| Backend preference/event analytics | Add persisted event preference and rich occupancy/revenue aggregates now. | |

**User's choice:** Preserve the Eventos CRUD phase while updating the discussion to include the design system and frontend organization.
**Notes:** Runtime contracts remain canonical: Better Auth, `/api/v1/eventos`, admin-only writes and shared `StatusEventoEnum`.

---

## Deferred Ideas

- Check-in QR persistido.
- Evento inicial como tela obrigatoria antes do dashboard.
- Agregados ricos de ocupacao/receita por evento.
- Preferencia de evento selecionado persistida no servidor.
- Redesign completo de paginas fora do caminho de Eventos quando nao for consequencia de primitive/shell compartilhado.

