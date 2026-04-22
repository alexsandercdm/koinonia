# PITFALLS — v1.1 CRUD Frontend on Existing Fastify + TanStack System

**Project:** Koinonia — Retiro Espiritual
**Context:** Connecting shell frontend pages to a complete Fastify REST API
**Date:** 2026-04-22
**Scope:** TanStack Query v5, React Hook Form v7, Zod v3, mobile-first, intermittent WiFi

---

## 1. TanStack Query: No Persistence Layer for Offline Grace

**Problem:**
`main.tsx` sets `staleTime: 1000 * 60 * 5` globally but uses no persister. `gcTime` defaults to 5 minutes. If the network drops at the rural venue and the user navigates away from the map screen, the cache is garbage-collected and the next render fires a network request that hangs indefinitely. The "Offline Grace" constraint in PROJECT.md is not yet implemented.

**Warning Signs:**
- Map screen shows loading spinner after navigating back on WiFi drop
- Console: `Failed to fetch` on every remount instead of returning cached data
- No `@tanstack/query-persist-client-core` or `@tanstack/react-query-persist-client` in `package.json`

**Prevention:**
Add a localStorage or IndexedDB persister before the first user test:
```ts
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

persistQueryClient({
  queryClient,
  persister: createSyncStoragePersister({ storage: window.localStorage }),
  maxAge: 1000 * 60 * 60 * 24, // survive a full event day offline
})
```
Set `gcTime` on critical queries (`mapa`, `locais`) to at least 24h so they survive navigation while the persister hydrates.

**Phase:** Address in the infrastructure setup task of v1.1, before any feature screen ships.

---

## 2. TanStack Query: Stale Mapa After Bed Assignment (Missing Key Variant)

**Problem:**
`useAtribuirCama` and `useLiberarCama` invalidate `acomodacoesKeys.mapa(eventoId)` — correct. But `useInscricoesSemCama` uses `inscricoesSemCamaKeys.list(eventoId, q)` where `q` is the current search string. The key factory is:

```ts
list: (eventoId: string, q?: string) =>
  ['inscricoes-sem-cama', eventoId, q ?? ''] as const,
```

When `q` is omitted the factory still produces a **3-element** key `['inscricoes-sem-cama', eventoId, '']`. TanStack Query v5 `invalidateQueries` uses prefix matching by default, but prefix matching works element-by-element: `''` does not match `'Maria'`, so the active filtered query is not invalidated. If the user has typed a search string, the stale query with that `q` value remains active after assignment.

**Warning Signs:**
- After assigning a bed, the person still appears in the "sem cama" search results
- Filtering by name after assignment shows ghost entries

**Prevention:**
Pass a 2-element prefix key to cover all `q` variants:
```ts
queryClient.invalidateQueries({
  queryKey: ['inscricoes-sem-cama', eventoId],
  // exact: false is the default in v5, but the prefix must be shorter than cached key
})
```
This 2-element prefix is shorter than every cached key and matches all of them regardless of `q`.

**Phase:** Bed assignment feature in v1.1 (ACO-05 / ACO-06).

---

## 3. TanStack Query: `useInscricoes` Hook Does Not Exist Yet

**Problem:**
`use-inscricoes.ts` only exposes `useEventos`, `useEvento`, and `useInadimplentes`. There are no mutation hooks for `POST /inscricoes`, `POST /inscricoes/:id/pagamentos`, `POST /inscricoes/:id/cancelar`, or `GET /eventos/:evento_id/inscricoes`. Developers will either re-declare types locally (drift risk) or wire mutations ad-hoc without consistent key invalidation.

**Warning Signs:**
- Payment registered via mutation does not update the participant's status badge without a full page reload
- Inscription list does not refresh after cancellation
- Duplicated `InscricaoListItem` type definitions across feature files

**Prevention:**
Before building any inscription or payment screen, extend `use-inscricoes.ts` with:
- `useInscricoesByEvento(eventoId)` — `GET /eventos/:eventoId/inscricoes` (this route does not yet exist — see Pitfall 5)
- `useCreateInscricao()` — invalidates `inscricoesKeys.byEvento`
- `useAddPagamento(inscricaoId)` — invalidates `inscricoesKeys.byEvento` and `inadimplentes`
- `useCancelInscricao()` — invalidates both + `acomodacoesKeys.mapa`

**Phase:** Inscription CRUD setup — first task in v1.1 INS module.

---

## 4. Zod: Schema Drift Between Frontend and Backend

**Problem:**
The shared package (`packages/shared/src/index.ts`) exports Zod schemas that the frontend can import via `@koinonia/shared`. However, the backend Fastify routes declare their own inline JSON Schema objects (e.g., `routes/inscricoes.ts` has its own inline schema). These are not derived from the shared Zod schemas. Drift is already present: the route for `PUT /eventos/:id` accepts a `status` enum value `'cancelado'` that does not exist in `StatusEventoEnum` (which has `'rascunho' | 'aberto' | 'encerrado' | 'realizado'`).

**Warning Signs:**
- Frontend Zod validation passes but API returns 400 (or vice versa)
- Enum values accepted in forms that the API rejects
- `valor_total` stored as string in DB (`inscricao.valor_total as string` in RecordPagamentoUseCase) but typed as `number` in shared schema — parseFloat used server-side, Zod `z.number()` used client-side

**Prevention:**
- Use `zodToJsonSchema` (or Fastify's `@fastify/type-provider-zod`) to derive Fastify schemas from shared Zod schemas directly. This is a refactor but prevents all future drift.
- Short-term: manually audit every enum and optional field between routes and shared schemas before building forms.
- Flag: `valor_total` is stored and returned as a numeric string. Frontend forms using `z.number()` will silently coerce or fail depending on Zod mode. Use `z.coerce.number()` for any field that comes back from the DB as a string.

**Phase:** Before any form is built in v1.1. Catch drift in the spec task.

---

## 5. API Contract: Missing Route for Listing Inscriptions by Event

**Problem:**
`GET /eventos/:evento_id/inscricoes` does not exist in `routes/inscricoes.ts`. The route file lists: `POST /inscricoes`, `GET /inscricoes/:id`, `POST /inscricoes/:id/pagamentos`, `POST /inscricoes/:id/substituir`, `POST /inscricoes/:id/cancelar`, `GET /eventos/:evento_id/inadimplentes`. There is no bulk list route.

Building the "Inscrições" screen assuming this route exists will result in a 404 at runtime.

**Warning Signs:**
- Frontend hook returns 404 for inscription list
- Developer assumes it exists because the data model clearly implies it

**Prevention:**
Add `GET /eventos/:eventoId/inscricoes` with pagination support before building the list screen. Verify all assumed routes against the actual route files before writing hooks.

**Phase:** API gap — must be added as a backend task in v1.1 INS module before frontend work begins.

---

## 6. Bed Assignment: 409 Conflict Handling UX on Mobile

**Problem:**
`AssignCamaUseCase` throws `AcomodacaoError('Cama já está ocupada neste evento', 409)` when the lock detects a concurrent assignment. `apiFetch` catches this and throws `new Error(message)` generically. The frontend has no special handling for 409 vs 422 vs 400 — all land in `mutation.error`. On mobile at a chaotic event registration session, two leaders on separate phones will occasionally hit this simultaneously.

**Warning Signs:**
- No visual distinction between "bed already taken" (retry with different bed) and "gender mismatch" (pick a different bed type)
- User sees generic "Cama já está ocupada neste evento" toast and must re-navigate to find a free bed manually
- After a 409, the mapa query still shows the bed as free (stale cache from before the conflict)

**Prevention:**
- Fix `apiFetch` to surface the status code (see Pitfall 11 — prerequisite for this fix)
- In `useAtribuirCama.onError`, if `error.status === 409`, immediately call `queryClient.invalidateQueries({ queryKey: acomodacoesKeys.mapa(eventoId) })` to force a fresh view of available beds
- Show a specific toast: "Esta cama acaba de ser ocupada. O mapa foi atualizado."
- Gender mismatch (422) should show a different message: "Gênero incompatível com o quarto."
- Do NOT use optimistic updates on bed assignment — the pessimistic lock at the DB level is authoritative; an optimistic UI flip followed by a 409 rollback is more confusing than a brief loading state on mobile.

**Phase:** ACO-05 — bed assignment screen in v1.1. Requires Pitfall 11 fixed first.

---

## 7. Mobile UX: Complex Forms with Many Fields

**Problem:**
The participant form (`PessoaSchema`) has 14+ fields including optional health data and emergency contact. On mobile with a soft keyboard active, the active field is frequently hidden behind the keyboard. Scrolling to errors after submit requires manual viewport management. Forms with `<select>` for enums (genero, papel) are notoriously small-tap targets on Android.

**Warning Signs:**
- Users on Android complain they cannot see what they are typing in the bottom half of the form
- Validation errors appear at the top of the form but users are scrolled to the bottom
- Tap misses on dropdown selects

**Prevention:**
- Use `scrollIntoView` on the first errored field in RHF's `onError` callback:
  ```ts
  const onError = (errors: FieldErrors) => {
    const firstKey = Object.keys(errors)[0]
    document.querySelector(`[name="${firstKey}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  ```
- Group health fields under a collapsible section ("Informações de Saúde") to reduce initial form length
- Use Radix UI Select (already in `package.json`) — it renders a native-style picker on mobile and meets the 48px touch target requirement
- Set `inputMode="numeric"` on phone and monetary fields; use `type="tel"` not `type="number"` (avoids browser number spinners)

**Phase:** Participantes CRUD (PES-01, PES-04) in v1.1.

---

## 8. Mobile UX: Form Data Loss on Navigation and WiFi Drop

**Problem:**
The QueryClient has no persister (see Pitfall 1) and React Hook Form state is in-memory. If the user starts filling a participant form, gets interrupted by a phone call, and the mobile browser discards the tab, all form data is lost. On intermittent WiFi, a mutation that hangs for 30s with no feedback causes users to navigate away and retry — resulting in duplicate submissions.

**Warning Signs:**
- Support complaints about "filled the same form twice"
- Duplicate participant records in the database
- `mutation.isPending` spinner shown but no timeout or cancel affordance

**Prevention:**
- For the participant form, implement draft autosave to `localStorage` using RHF's `watch` + debounce:
  ```ts
  useEffect(() => {
    const sub = form.watch((values) => {
      localStorage.setItem('draft_participante', JSON.stringify(values))
    })
    return () => sub.unsubscribe()
  }, [form])
  ```
  Clear the draft on successful submission.
- Show a timeout warning after 15s of pending mutation: "Conexão lenta. Aguardando..."
- Disable the submit button during mutation (`mutation.isPending`) but show a "Cancelar" option after 10s
- For critical mutations (bed assignment, payment registration), implement idempotency at the API level (a unique key per form session sent as a header or body field) — this is a backend task.

**Phase:** All form screens in v1.1. Draft autosave is a v1.1 polish task; idempotency key is a backend hardening task.

---

## 9. File Upload: Payment Receipt on Intermittent WiFi

**Problem:**
`POST /inscricoes/:id/pagamentos` accepts `comprovante_url: string` — it expects a URL, not a binary upload. There is no file upload endpoint declared anywhere in the API. The requirement FIN-03 mentions "upload de comprovantes (Storage)" but the current payment route does not implement it. Building a file picker UI that posts a `multipart/form-data` body to the current endpoint will 400.

**Warning Signs:**
- `comprovante_url` field in the form sending a File object instead of a URL string
- Network error on payment submit when file is selected

**Prevention:**
- Clarify before building the payment form: is upload in scope for v1.1? If yes, a separate `POST /uploads` endpoint is needed that returns a URL, and the form becomes two-step (upload → get URL → submit payment with URL).
- If not in scope for v1.1, make `comprovante_url` a plain text URL input ("Paste receipt link") to defer the upload implementation.
- When upload is implemented: compress images client-side with `canvas.toBlob` before upload (low-end Android cameras produce 8MB+ files); target under 500KB. Implement retry with exponential backoff on the upload fetch — not on the payment record mutation.

**Phase:** INS-04 in v1.1. Upload infrastructure is a prerequisite that must be decided before the payment form spec is written.

---

## 10. PDF Generation: Accommodation Map on Low-End Android

**Problem:**
`jspdf` and `html2canvas` are already in `package.json`. `html2canvas` works by re-rendering the DOM into a canvas — for a full accommodation map (multiple quartos, all camas, all names), this blocks the main thread for several seconds on low-end Android devices. The result is a frozen UI followed by either a crash or a blurry/clipped PDF.

**Warning Signs:**
- PDF export button causes app to freeze for 3-5s on mid-range phones
- PDF output clips content below the fold (html2canvas does not scroll-capture by default)
- Memory pressure on devices with <2GB RAM causes the browser tab to reload

**Prevention:**
- Move PDF rendering to a Web Worker using `jspdf` directly (without `html2canvas`) — render text and rectangles programmatically from the query data rather than screenshotting the DOM.
- If html2canvas is kept: set `windowHeight` to the full scroll height of the container, not the viewport height.
- Add a loading state during PDF generation — use `startTransition` to keep the UI responsive:
  ```ts
  startTransition(async () => {
    const doc = await generateMapaPDF(mapaData)
    doc.save('mapa-acomodacao.pdf')
  })
  ```
- Limit PDF scope: generate per-quarto PDFs rather than full-map PDFs when the event has more than 50 participants.

**Phase:** ACO-07 in v1.1. Consider deferring full PDF to v1.2 if timeline is tight; the map screen alone satisfies the operational need at the event.

---

## 11. Error Envelope: `apiFetch` Discards HTTP Status Code

**Problem:**
`apiFetch` in `lib/api.ts` throws `new Error(message)` when the response is not ok. The HTTP status code is not attached to the thrown error. All mutation `onError` handlers receive a plain `Error` object with no way to distinguish a 400 (bad request / validation), 404 (not found), 409 (conflict), or 422 (business rule). Every error currently shows the same toast, regardless of whether the user can recover by retrying vs. by changing their input. This also blocks the specific 409 handling in Pitfall 6.

**Warning Signs:**
- All API errors display identically regardless of cause
- No way to conditionally refresh the map only on 409 (required by Pitfall 6)
- Future retry logic cannot distinguish transient (5xx) from permanent (4xx) failures

**Prevention:**
Extend `apiFetch` to attach the status code to the error:
```ts
class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
  }
}

// In apiFetch:
throw new ApiError(message, response.status)
```
Update all `onError` handlers to check `(error as ApiError).status`.

**Phase:** Foundational — implement before any mutation-heavy screen in v1.1. Unblocks Pitfall 6.

---

## 12. Zod + RHF: Numeric and Date Coercion Traps

**Problem:**
`valor_total` and `valor_pago` come back from the API as numeric strings in some cases (the RecordPagamentoUseCase explicitly uses `parseFloat(inscricao.valor_total as string)`). If a form uses `z.number()` directly, RHF's defaultValues will fail Zod validation on edit (string "150.00" fails `z.number()`). `data_nascimento` is `z.string().date()` (YYYY-MM-DD) but `<input type="date">` also returns YYYY-MM-DD — this one is fine. `data_inicio` / `data_fim` on events use `format: 'date-time'` (ISO string with time), but a `<input type="date">` only provides the date part.

**Warning Signs:**
- Edit form for inscricao prefilled with `valor_total` shows Zod validation error immediately on load
- Event form submits `"2026-08-15"` for `data_inicio` but API expects `"2026-08-15T00:00:00.000Z"` — results in 400

**Prevention:**
- Use `z.coerce.number()` for all monetary fields on the frontend schema
- For datetime fields, transform the date input value in the form submit handler:
  ```ts
  data_inicio: formData.data_inicio + 'T00:00:00.000Z'
  ```
  Or use a dedicated datetime picker component
- Keep frontend Zod schemas separate from shared schemas for input forms (input types differ from stored types); use `transform` / `preprocess` in the form schema

**Phase:** Evento CRUD (INS-01) and Inscrição form (INS-02, INS-03, INS-04) in v1.1.

---

## Summary Table

| Pitfall | Severity | Phase |
|---------|----------|-------|
| 1. No cache persistence (offline grace) | Critical | v1.1 infrastructure |
| 2. Partial key invalidation on bed assignment | High | v1.1 ACO-05/06 |
| 3. Missing inscription mutation hooks | High | v1.1 INS module setup |
| 4. Schema drift shared vs route inline schemas | High | Before any form |
| 5. Missing `GET /eventos/:id/inscricoes` route | High | v1.1 API gap |
| 6. 409 conflict UX on mobile (bed assignment) | High | v1.1 ACO-05 |
| 7. Complex form mobile keyboard / tap targets | Medium | v1.1 PES-01, PES-04 |
| 8. Form data loss on navigation / mutation hang | Medium | All v1.1 forms |
| 9. File upload not implemented in payment API | Medium | v1.1 INS-04 |
| 10. PDF generation blocking main thread on mobile | Medium | v1.1 ACO-07 |
| 11. `apiFetch` discards HTTP status code | High | v1.1 foundation |
| 12. Numeric/date coercion between API and Zod | Medium | v1.1 INS, EVT forms |
