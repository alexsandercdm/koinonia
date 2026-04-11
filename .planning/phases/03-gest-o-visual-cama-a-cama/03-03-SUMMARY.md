---
phase: 03-gest-o-visual-cama-a-cama
plan: "03"
subsystem: web-frontend
tags: [acomodacoes, mobile-first, role-aware, react-query, crud]
dependency_graph:
  requires: [03-01]
  provides: [ACO-01, ACO-02, ACO-03, ACO-04]
  affects: [apps/web]
tech_stack:
  added: []
  patterns: [tanstack-query-v5, role-gated-ui, mobile-first-tabs]
key_files:
  created:
    - apps/web/src/pages/AcomodacoesPage.tsx
    - apps/web/src/components/acomodacoes/AcomodacoesFilters.tsx
    - apps/web/src/components/acomodacoes/EstruturaAcomodacaoPanel.tsx
    - apps/web/src/components/acomodacoes/MapaQuartosGrid.tsx
    - apps/web/src/components/acomodacoes/CamaCard.tsx
  modified:
    - apps/web/src/hooks/use-acomodacoes.ts
    - apps/web/src/App.tsx
    - apps/web/src/pages/dashboard.tsx
decisions:
  - "Tab-switcher pattern chosen over single-scroll page to keep mobile viewport clean"
  - "servo role sees read-only EstruturaAcomodacaoPanel with informational banner rather than hidden panel"
  - "useEventos added to use-acomodacoes.ts as shared hook to avoid duplicate query definitions"
  - "Placeholder onAssign/onRelease callbacks passed as undefined — activated in plan 03-04"
metrics:
  duration: "~45 min"
  completed_date: "2026-04-11"
  tasks_completed: 3
  files_changed: 9
---

# Phase 03 Plan 03: Accommodation Module Web UI Summary

**One-liner:** Mobile-first accommodation module with role-gated CRUD panel (local/quarto/cama), event-scoped map grid showing bed status per room, and tab-switcher layout for field use.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Wire accommodation route, dashboard entry, query hooks | 685c9d8 | App.tsx, dashboard.tsx, lib/api.ts, use-acomodacoes.ts |
| 2 | Structure-management panel (local/quarto/cama CRUD) | 3b9adc9 | AcomodacoesPage.tsx, AcomodacoesFilters.tsx, EstruturaAcomodacaoPanel.tsx |
| 3 | Read-only accommodation map with room/bed cards | 956f8cf | MapaQuartosGrid.tsx, CamaCard.tsx |

## What Was Built

### AcomodacoesPage.tsx
Mobile-first page with sticky header, event filter at top, and a tab switcher between "Mapa Visual" and "Estrutura". All roles see both tabs — `servo` sees the Estrutura tab in read-only with an amber banner. The Mapa tab handles all states: no event selected, loading, API error, event without `local_id`, and the rendered grid.

### AcomodacoesFilters.tsx
Event picker select with 48px touch target height. Accepts `EventoOption[]` with `local_id` included so the parent can detect unmapped events.

### EstruturaAcomodacaoPanel.tsx
Three-level CRUD panel: select Local → see Quartos → see Camas. Write actions (+ Novo, Editar buttons) are shown only when `userRole === 'admin' || userRole === 'lider'`. Forms have 48px inputs/buttons throughout. Each mutation invalidates the affected query key immediately on success.

### MapaQuartosGrid.tsx
Grid of QuartoCard components. Each card shows room name, allowed gender badge, occupancy counters (occupied / available / capacity), and a 2-3 column grid of CamaCards. Empty states for no local_id and zero quartos.

### CamaCard.tsx
Bed card with high-contrast color treatment: green (Disponivel), blue (Ocupado), red (Bloqueado). Shows `identificacao`, status badge, bed type, and occupant name when `cama.ocupante` is non-null. Placeholder `onAssign`/`onRelease` props declared for plan 03-04.

### use-acomodacoes.ts additions
`EventoListItem` interface, `useEventos` query hook, and `eventos` query key added alongside existing structural hooks.

## Deviations from Plan

### Auto-fixed Issues

None — plan executed with minor structural choices documented below.

### Structural Choices

**1. servo read-only via EstruturaAcomodacaoPanel prop (not hidden tab)**
- The plan specified "servo, render the structure in read-only mode" — implemented by passing `userRole='servo'` to the panel which checks `canEdit = userRole === 'admin' || userRole === 'lider'` and hides all write controls. An amber banner in AcomodacoesPage.tsx explains the read-only state.

**2. useEventos in use-acomodacoes.ts instead of inline**
- Task 1's commit had an inline `useEventos` in the page. Moved to the hooks file to keep all API access in one place, consistent with the plan's design intent.

## Known Stubs

None — all data is wired to live API hooks. The `onAssign`/`onRelease` callbacks are intentional placeholders documented in plan 03-04.

## Threat Flags

No new network endpoints, auth paths, or schema changes introduced in this plan (frontend only).

## Self-Check: PASSED

- apps/web/src/pages/AcomodacoesPage.tsx — created
- apps/web/src/components/acomodacoes/AcomodacoesFilters.tsx — created
- apps/web/src/components/acomodacoes/EstruturaAcomodacaoPanel.tsx — created
- apps/web/src/components/acomodacoes/MapaQuartosGrid.tsx — created
- apps/web/src/components/acomodacoes/CamaCard.tsx — created
- Commit 685c9d8 (task 1), 3b9adc9 (task 2), 956f8cf (task 3) — all present
- Type errors in new files: 0 (pre-existing errors in auth-context/login/register/dashboard are out of scope)
