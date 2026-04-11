---
phase: 03-gest-o-visual-cama-a-cama
reviewed: 2026-04-11T00:00:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - apps/web/src/App.tsx
  - apps/web/src/pages/dashboard.tsx
  - apps/web/src/pages/AcomodacoesPage.tsx
  - apps/web/src/hooks/use-acomodacoes.ts
  - apps/web/src/lib/api.ts
  - apps/web/src/components/acomodacoes/AcomodacoesFilters.tsx
  - apps/web/src/components/acomodacoes/EstruturaAcomodacaoPanel.tsx
  - apps/web/src/components/acomodacoes/MapaQuartosGrid.tsx
  - apps/web/src/components/acomodacoes/CamaCard.tsx
  - apps/web/src/components/acomodacoes/AssignCamaSheet.tsx
  - apps/web/src/components/acomodacoes/ExportMapaPdfButton.tsx
  - apps/web/src/components/ui/sheet.tsx
  - apps/web/src/lib/pdf/exportMapaAcomodacao.ts
  - apps/web/src/tests/acomodacoes-e2e.spec.ts
findings:
  critical: 1
  warning: 5
  info: 4
  total: 10
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-11
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

This phase implements the accommodation management frontend — a mobile-first React/TypeScript module covering CRUD of locations/rooms/beds, a visual map with bed assignment, and PDF export. Overall the code is well-structured and the role-based UI gating is correctly applied throughout. However, one critical security issue exists in `api.ts` (missing auth failure handling), and several logic/correctness bugs were found in the hook layer and PDF export.

---

## Critical Issues

### CR-01: Missing auth headers silently on session failure — requests proceed unauthenticated

**File:** `apps/web/src/lib/api.ts:5-13`

**Issue:** `getAuthHeaders()` returns only `Content-Type` when `authClient.getSession()` fails or returns no token. Every subsequent `apiFetch` call proceeds with no `Authorization` header, relying entirely on the server to reject it. If the server has any misconfigured endpoint or the token check is permissive, data is silently accessed without authentication. The frontend gives no feedback to the user and never redirects to login on a missing session.

**Fix:**
```typescript
async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await authClient.getSession()
  const token = session?.data?.session?.token
  if (!token) {
    // Redirect or throw — do not silently fall through
    throw new Error('Unauthenticated')
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}
```
Callers should catch this and redirect to `/login`. Alternatively, handle 401 responses centrally in `apiFetch` and call `window.location.replace('/login')`.

---

## Warnings

### WR-01: `useliberarCama` calls wrong HTTP method/URL — uses POST endpoint with DELETE

**File:** `apps/web/src/hooks/use-acomodacoes.ts:252-253`

**Issue:** `useliberarCama` sends `DELETE` to `/api/v1/acomodacoes/camas/${camaId}/atribuir`. This is the same URL path as `useAtribuirCama`, which uses `POST`. Depending on the API contract, a dedicated `/atribuir` sub-resource may not support `DELETE` at all; the conventional REST pattern for releasing an assignment is either `DELETE /camas/:id/atribuicao` or `POST /camas/:id/liberar`. This will produce a 404 or 405 in production unless the backend explicitly handles `DELETE` on that path. The naming inconsistency (same URL, different method) also makes the intent unclear.

**Fix:** Confirm the backend route. If the correct endpoint is e.g. `DELETE /api/v1/acomodacoes/camas/:id/atribuicao`:
```typescript
mutationFn: ({ camaId }: { camaId: string }) =>
  apiFetch<void>(`/api/v1/acomodacoes/camas/${camaId}/atribuicao`, {
    method: 'DELETE',
  }),
```

### WR-02: Hook naming violates React convention — `useliberarCama` will not be recognised as a hook by lint/tooling

**File:** `apps/web/src/hooks/use-acomodacoes.ts:248`

**Issue:** The function is named `useliberarCama` (lowercase `l`). React requires hook names to start with `use` followed by an uppercase letter (`useLiberarCama`) to be recognised by the exhaustive-deps ESLint rule and Fast Refresh. The import in `AssignCamaSheet.tsx` (`useliberarCama`) perpetuates the typo. This is also exported from the hook file, so it affects every future consumer.

**Fix:**
```typescript
// use-acomodacoes.ts
export function useLiberarCama(eventoId: string) { ... }

// AssignCamaSheet.tsx
import { useAtribuirCama, useLiberarCama } from '../../hooks/use-acomodacoes'
const liberar = useLiberarCama(eventoId)
```

### WR-03: `EstruturaAcomodacaoPanel` fetches camas list but never displays it — the query result is lost

**File:** `apps/web/src/components/acomodacoes/EstruturaAcomodacaoPanel.tsx:535-538`

**Issue:** After the `CamaForm` inline editor, the panel renders only a static placeholder: `"Selecione um quarto para ver as camas no mapa abaixo."` The `useCamas` hook is imported in the hook file and is available, but is never called in this component. A `servo` user or admin viewing the Estrutura tab has no way to see existing beds for a selected room — the list is simply absent. This contradicts the phase spec (read-only view for all roles).

**Fix:** Call `useCamas(selectedQuartoId)` and render the result list similar to how quartos are rendered, showing `identificacao`, `tipo`, and `bloqueada` status for each bed. Guard mutations with `canEdit` as is done for quartos.

### WR-04: `AssignCamaSheet` — `useInscricoesSemCama` always fires even when sheet is closed for a blocked bed

**File:** `apps/web/src/components/acomodacoes/AssignCamaSheet.tsx:60-63`

**Issue:** `useInscricoesSemCama(eventoId, searchQ)` is called unconditionally regardless of the sheet's `open` state and regardless of whether `cama` is `null`. The hook itself only gates on `!!eventoId`, so when a user opens a blocked bed's sheet, the query fires and fetches all unassigned participants unnecessarily. When `cama` is `null` and the component returns early at line 98, the hook has already been called (React hooks cannot be conditioned), meaning a network request is issued for data that is never used.

**Fix:** Add `enabled: open && isDisponivel` to the `useInscricoesSemCama` query options, or pass a boolean `enabled` flag to the hook:
```typescript
export function useInscricoesSemCama(eventoId: string, q: string, enabled = true) {
  return useQuery({
    ...
    enabled: enabled && !!eventoId,
  })
}
```
Then call it as:
```typescript
useInscricoesSemCama(eventoId, searchQ, open && isDisponivel)
```

### WR-05: PDF export — multi-page images are silently clipped; tall maps exceed a single A4 page

**File:** `apps/web/src/lib/pdf/exportMapaAcomodacao.ts:118-125`

**Issue:** The captured canvas is added as a single image at line 125. The code checks `if (yPos + imgHeight > pageHeight - margin)` and adds a page, but it only adds one extra page and places the entire image there. If `imgHeight` itself exceeds the A4 content area (297mm minus margins and header), the image will overflow off the bottom of the second page and be clipped, with no further page-break logic.

**Fix:** Slice the canvas into vertical page-height segments and add each as a separate page:
```typescript
const contentHeight = pageHeight - margin * 2
let remainingHeight = imgHeight
let srcY = 0
let destY = yPos

while (remainingHeight > 0) {
  const sliceHeight = Math.min(remainingHeight, contentHeight - destY + margin)
  // Use addImage with sy/sheight params to crop canvas (jsPDF 2.x supports this)
  pdf.addImage(imgData, 'PNG', margin, destY, imgWidth, sliceHeight)
  remainingHeight -= sliceHeight
  srcY += sliceHeight
  destY = margin
  if (remainingHeight > 0) pdf.addPage()
}
```
Alternatively render the map via pure jsPDF text/rect primitives (already done for the summary section) to avoid the screenshot approach entirely for multi-page scenarios.

---

## Info

### IN-01: Capacidade field in `LocalForm` is not validated — `parseInt` on empty string yields `NaN` sent to API

**File:** `apps/web/src/components/acomodacoes/EstruturaAcomodacaoPanel.tsx:45`

**Issue:** `capacidade_total: capacidadeTotal ? parseInt(capacidadeTotal, 10) : undefined` — `parseInt` of a non-numeric string (e.g. `"abc"`) returns `NaN`, which serialises to `null` in JSON. Same issue exists in `QuartoForm` at line 124 for `capacidade` (required field). An `isNaN` guard or HTML `type="number"` validation enforcement should be added.

**Fix:**
```typescript
const parsed = parseInt(capacidadeTotal, 10)
capacidade_total: !isNaN(parsed) ? parsed : undefined,
```

### IN-02: `dashboard.tsx` — navigation buttons for Eventos, Financeiro, Inscrições, Relatórios are non-functional

**File:** `apps/web/src/pages/dashboard.tsx:46-108`

**Issue:** Four of the six cards have buttons with no `onClick` handler, so clicking them does nothing. This is dead UI — likely placeholder code from scaffolding. Users may mistake these for broken links.

**Fix:** Either wire up routes or add `disabled` and a tooltip indicating "em breve" until those modules are implemented.

### IN-03: `acomodacoes-e2e.spec.ts` — test role mocking relies on `localStorage` key that may not match the actual auth context

**File:** `apps/web/src/tests/acomodacoes-e2e.spec.ts:14-25`

**Issue:** The tests set `mock-user-role` in localStorage, but there is no evidence the `AuthProvider` / `useAuthContext` reads from this key. If the auth context reads role from the decoded JWT or from the better-auth session response, the mock will have no effect and the tests will always behave as if no role is set. The tests may be passing only because the guards default to `servo` (read-only), masking missing lider/admin coverage.

**Fix:** Verify `AuthProvider` consumes `mock-user-role` in test mode, or intercept the `/api/auth/session` route to return the correct role in the mock session payload.

### IN-04: `ExportMapaPdfButton` — `containerRef` is always in the DOM, position `absolute -left-[9999px]`; may cause scrollbar on some browsers

**File:** `apps/web/src/components/acomodacoes/ExportMapaPdfButton.tsx:81-83`

**Issue:** The off-screen capture container is absolutely positioned at `left: -9999px`. On browsers with `overflow-x: auto` on the document body (notably some mobile WebViews), this can trigger a horizontal scrollbar or cause layout shift. The standard pattern for this is `position: fixed` with `opacity: 0` and `pointer-events: none`, or creating the container dynamically and appending/removing it to `document.body` during export.

**Fix:**
```tsx
<div
  ref={containerRef}
  style={{ position: 'fixed', top: 0, left: '-9999px', opacity: 0, pointerEvents: 'none' }}
  className="w-[900px] bg-white p-6 space-y-4"
  aria-hidden="true"
>
```

---

_Reviewed: 2026-04-11_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
