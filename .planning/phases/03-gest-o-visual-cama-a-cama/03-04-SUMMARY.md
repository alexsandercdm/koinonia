---
phase: 03-gest-o-visual-cama-a-cama
plan: "04"
subsystem: web-frontend
tags: [acomodacoes, assignment, pdf-export, role-aware, sheet, playwright]
dependency_graph:
  requires: [03-02, 03-03]
  provides: [ACO-04, ACO-05, ACO-06, ACO-07]
  affects: [apps/web]
tech_stack:
  added: [jspdf, html2canvas, @radix-ui/react-dialog (sheet primitive)]
  patterns: [bottom-sheet-mobile, optimistic-query-invalidation, off-screen-pdf-capture]
key_files:
  created:
    - apps/web/src/components/ui/sheet.tsx
    - apps/web/src/components/acomodacoes/AssignCamaSheet.tsx
    - apps/web/src/components/acomodacoes/ExportMapaPdfButton.tsx
    - apps/web/src/lib/pdf/exportMapaAcomodacao.ts
    - apps/web/src/tests/acomodacoes-e2e.spec.ts
  modified:
    - apps/web/src/hooks/use-acomodacoes.ts
    - apps/web/src/components/acomodacoes/CamaCard.tsx
    - apps/web/src/components/acomodacoes/MapaQuartosGrid.tsx
    - apps/web/src/pages/AcomodacoesPage.tsx
decisions:
  - "Sheet primitive built on @radix-ui/react-dialog (already in deps) as bottom sheet for mobile-first flow"
  - "Off-screen capture div in ExportMapaPdfButton avoids modifying the live map DOM during html2canvas capture"
  - "Inline specific error messages in AssignCamaSheet (gender/occupied/blocked) rather than generic toast"
  - "CamaCard callbacks now receive full CamaMapaItem (not just ID) so sheet can show context without extra fetch"
metrics:
  duration: "~35 min"
  completed_date: "2026-04-11"
  tasks_completed: 3
  files_changed: 9
---

# Phase 03 Plan 04: Bed Assignment, Release and PDF Export Summary

**One-liner:** Role-gated bed assignment/release sheet with inline API error messages and offline-capable A4 PDF export of the live accommodation map.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Add assignment/release controls and sheet primitive | c0c165c | sheet.tsx, AssignCamaSheet.tsx, CamaCard.tsx, MapaQuartosGrid.tsx, AcomodacoesPage.tsx, use-acomodacoes.ts |
| 2 | Surface backend errors and generate printable PDF | 0afe5b8 | ExportMapaPdfButton.tsx, exportMapaAcomodacao.ts |
| 3 | Playwright e2e coverage for accommodation page | 2030f3f | acomodacoes-e2e.spec.ts |

## What Was Built

### sheet.tsx
Reusable bottom/right sheet primitive wrapping `@radix-ui/react-dialog`. Supports `side="bottom"` (default, mobile-first) and `side="right"`. Includes `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, overlay with blur, and a close button.

### AssignCamaSheet.tsx
Operator flow for bed assignment and release. Opened by clicking any non-blocked bed card on the map:
- **Disponivel bed**: shows searchable list of `inscricoes-sem-cama` candidates; "Atribuir" button per row.
- **Ocupado bed**: shows occupant name and "Liberar" button with a confirm step before calling DELETE.
- **Inline errors**: gender mismatch, occupied-bed conflict, blocked-bed conflict shown as specific red banners — not generic toasts.
- **servo role**: sees a read-only amber banner; no action controls rendered.
- After any successful mutation: invalidates `mapa` and `inscricoes-sem-cama` queries so the map updates without page refresh.

### use-acomodacoes.ts additions
- `InscricaoSemCama` interface and `useInscricoesSemCama` query hook (`GET /api/v1/eventos/:eventoId/inscricoes-sem-cama?q=`)
- `useAtribuirCama` mutation (`POST /api/v1/acomodacoes/camas/:camaId/atribuir`)
- `useliberarCama` mutation (`DELETE /api/v1/acomodacoes/camas/:camaId/atribuir`)
- Both mutations invalidate the mapa and candidate list query keys on success.

### CamaCard.tsx (updated)
Now clickable for non-blocked beds. `onAssign` and `onRelease` receive the full `CamaMapaItem` (not just the ID), so the sheet receives context without an extra fetch. Keyboard-accessible (`Enter` key triggers action). `servo` sees the card as non-interactive (no pointer cursor, no callbacks passed from page).

### MapaQuartosGrid.tsx (updated)
Callback signatures updated from `(camaId: string)` to `(cama: CamaMapaItem)`. Added `data-testid="mapa-quartos-grid"` for Playwright targeting.

### AcomodacoesPage.tsx (updated)
- Manages `sheetOpen` and `selectedCama` state.
- Passes `handleCamaAction` as both `onAssign` and `onRelease` only when `canWrite` (admin/lider); servo gets `undefined`.
- Renders `ExportMapaPdfButton` above the map grid when a mapa is loaded.
- Renders `AssignCamaSheet` at the bottom of the page tree.

### ExportMapaPdfButton.tsx
Button component with loading state. Manages an off-screen `<div>` that renders a static HTML representation of the current mapa (no interactive controls). Passes that element to `exportMapaAcomodacao()` for capture. Error state shows inline text if PDF generation fails.

### exportMapaAcomodacao.ts
- Uses `html2canvas` with `scale: 2` and `onclone` to hide `.no-print` elements during capture.
- Uses `jsPDF` in A4 portrait mode.
- PDF structure: header (event name, local name, timestamp), text room-grouping summary, color+text legend (`Disponivel` / `Ocupado` / `Bloqueado`), captured image.
- Filename: `${eventoNome}-mapa-acomodacao.pdf`.

### acomodacoes-e2e.spec.ts
Playwright spec covering:
- Navigation from dashboard to `/acomodacoes`
- `servo` role: no Atribuir/Liberar buttons, read-only estrutura tab label, role indicator in header
- `lider` role: role label visible, PDF export button present when map loaded
- Bed cards show text status labels (not only color cues) via `[data-testid="mapa-quartos-grid"]`
- API routes mocked with `page.route(...).fulfill(...)` for offline-capable test execution

## Deviations from Plan

### Structural Choices

**1. CamaMapaItem passed to callbacks (not just camaId)**
- The plan specified `onAssign?: (camaId: string)` but passing the full `CamaMapaItem` avoids a redundant lookup in the sheet to get occupant name, identificacao, and bloqueada state. The sheet receives everything it needs in one object.

**2. Off-screen div in ExportMapaPdfButton instead of capturing the live DOM**
- Capturing the live map grid would include interactive controls (sheet triggers, buttons). An off-screen static render gives clean capture output without CSS manipulation or temporary DOM changes.

## Known Stubs

None — all callbacks are wired and all data flows from live API hooks.

## Threat Flags

No new network endpoints, auth paths, or schema changes introduced (frontend-only plan). PDF generation is entirely client-side.

## Self-Check: PASSED

- apps/web/src/components/ui/sheet.tsx — created
- apps/web/src/components/acomodacoes/AssignCamaSheet.tsx — created
- apps/web/src/components/acomodacoes/ExportMapaPdfButton.tsx — created
- apps/web/src/lib/pdf/exportMapaAcomodacao.ts — created
- apps/web/src/tests/acomodacoes-e2e.spec.ts — created
- Commit c0c165c (task 1), 0afe5b8 (task 2), 2030f3f (task 3) — all present
- Type errors in new files: 0 (pre-existing errors in auth-context/shared/dashboard/login/register are out of scope, identical to 03-03 baseline)
