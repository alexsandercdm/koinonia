---
phase: 03-gest-o-visual-cama-a-cama
fixed_at: 2026-04-11T00:00:00Z
review_path: .planning/phases/03-gest-o-visual-cama-a-cama/03-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 6
skipped: 0
status: all_fixed
---

# Phase 03: Code Review Fix Report

**Fixed at:** 2026-04-11
**Source review:** .planning/phases/03-gest-o-visual-cama-a-cama/03-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 6 (1 Critical, 5 Warning)
- Fixed: 6
- Skipped: 0

## Fixed Issues

### CR-01: Missing auth headers silently on session failure

**Files modified:** `apps/web/src/lib/api.ts`
**Commit:** 9db6e42
**Applied fix:** `getAuthHeaders` now extracts the token first; if absent, calls `window.location.replace('/login')` and throws `'Unauthenticated'` so the request never proceeds unauthenticated.

### WR-01: `useliberarCama` calls wrong URL

**Files modified:** `apps/web/src/hooks/use-acomodacoes.ts`, `apps/web/src/components/acomodacoes/AssignCamaSheet.tsx`
**Commit:** 3425833
**Applied fix:** Changed the release endpoint from `/camas/${camaId}/atribuir` to `/camas/${camaId}/atribuicao` (DELETE) to match the correct REST convention and API plan. Fixed alongside WR-02 in the same commit.

### WR-02: Hook named `useliberarCama` violates React naming convention

**Files modified:** `apps/web/src/hooks/use-acomodacoes.ts`, `apps/web/src/components/acomodacoes/AssignCamaSheet.tsx`
**Commit:** 3425833
**Applied fix:** Renamed `useliberarCama` to `useLiberarCama` in the hook file and updated the import and call-site in `AssignCamaSheet.tsx`.

### WR-03: `EstruturaAcomodacaoPanel` fetches camas list but never displays it

**Files modified:** `apps/web/src/components/acomodacoes/EstruturaAcomodacaoPanel.tsx`
**Commit:** e85f0c7
**Applied fix:** Added `useCamas` to the import list, called `useCamas(selectedQuartoId)` in the panel body, and replaced the static placeholder with a rendered list showing `identificacao`, `tipo`, and `bloqueada` status per bed. Edit button guarded by `canEdit` following the same pattern as quartos.

### WR-04: `useInscricoesSemCama` fires unconditionally when sheet is closed

**Files modified:** `apps/web/src/hooks/use-acomodacoes.ts`, `apps/web/src/components/acomodacoes/AssignCamaSheet.tsx`
**Commit:** 9333b5d
**Applied fix:** Added optional `enabled` parameter (default `true`) to `useInscricoesSemCama`; combined with `!!eventoId` in query's `enabled` option. Call-site in `AssignCamaSheet` now passes `open && isDisponivel` so the query only fires when the sheet is open and the bed is available.

### WR-05: PDF export clips tall maps on single page

**Files modified:** `apps/web/src/lib/pdf/exportMapaAcomodacao.ts`
**Commit:** ea3098d
**Applied fix:** Replaced the single `addImage` call with a loop that slices the source canvas into vertical segments fitting the A4 content area. Each slice is drawn into a temporary canvas, converted to PNG, and added as a separate page via `addImage`, continuing until `remainingImgHeight` reaches zero.

---

_Fixed: 2026-04-11_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
