# Research Summary — Koinonia v1.1 Frontend CRUD

**Milestone:** v1.1 — Connect shell pages to complete Fastify REST API
**Synthesized:** 2026-04-22
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

---

## Executive Summary

Koinonia v1.1 is primarily a frontend wiring milestone: the Fastify backend is feature-complete, Zod schemas are shared, and partial shell pages exist. The work is connecting those shells to the API via mutation hooks, building form components, and handling one specific environmental constraint — intermittent WiFi at a rural retreat venue. The stack is already well-chosen; only 11 net-new packages are required (~85 KB gzipped).

The most dangerous pattern to avoid is building UI against assumed API contracts. Two high-severity gaps exist in the backend: `GET /eventos/:id/inscricoes` is missing, and `apiFetch` discards HTTP status codes. Both must be fixed before frontend feature work begins, or every mutation screen will be built on a broken foundation.

The build sequence is strictly ordered by data dependencies: Participants have no upstream dependencies and must come first; Events must exist before Inscriptions; Inscriptions must exist before Bed Assignment can be tested end-to-end. Accommodation is the only module already fully functional — it requires only an optimistic update upgrade, not a rewrite.

---

## Stack Additions

Net-new packages only. Existing stack (RHF, Zod, TanStack Query/Table, Radix Dialog/Toast, recharts, react-router-dom) is not changed.

| Package | Version | Rationale |
|---------|---------|-----------|
| `react-day-picker` | ^9.14.0 | shadcn-compatible date picker for event dates and payment dates |
| `date-fns` | ^4.1.0 | Required by react-day-picker locale/format; tree-shaken |
| `@radix-ui/react-popover` | ^1.1.15 | Popover container for date picker |
| `react-imask` | ^7.6.1 | CPF, phone, CEP, currency masks on participant form |
| `react-dropzone` | ^15.0.0 | Payment receipt upload UX; simple FormData POST |
| `@radix-ui/react-checkbox` | ^1.3.3 | Health flags, dietary restrictions |
| `@radix-ui/react-radio-group` | ^1.3.8 | Gender selection, payment method selection |
| `@radix-ui/react-tabs` | ^1.1.13 | Participant detail view (Dados / Saúde / Emergência tabs) |
| `@radix-ui/react-scroll-area` | ^1.1.x | Accommodation map scroll container |
| `@tanstack/react-query-persist-client` | ^5.99.2 | LocalStorage cache persistence for offline grace |
| `@tanstack/query-sync-storage-persister` | latest | Sync adapter for persist-client |

**Do NOT add:** axios, dayjs, AG-Grid, Formik, sonner, TanStack Router, AWS/tus SDKs.

---

## Feature Table Stakes

### Participants
- Search by name / phone / padrinho — must work on cached data offline
- Create/edit form: personal + health + emergency contact (3 accordion sections)
- Event history list per participant (read-only)
- Soft-delete ("Inativar"), not hard delete
- Inline field-level validation on blur

### Events
- List with name, date range, location, capacity fill ("vagas restantes")
- Create/edit: name, start/end dates, location, max capacity
- Derived status indicator: Aberto / Em andamento / Encerrado
- Capacity progress bar on card

### Inscriptions
- Enroll participant in event: select participant (autocomplete), role, fee override
- Inscription list per event with color-coded payment status
- Register payment: amount, method (Dinheiro/PIX/Cartão/Transferência), optional receipt note
- Auto-calculated balance (fee − sum of payments)
- Inadimplency filter (balance > 0)
- Cancel inscription with refund note (soft-cancel, retain payment history)

### Accommodation
- Already fully functional — no table-stakes work remains
- Optimistic update upgrade (`onMutate`/`onError` pattern) is the only pending work
- Stale key fix for `inscricoesSemCama` invalidation

### All Screens (Cross-Cutting)
- Touch targets >= 48px; base font >= 16px
- TanStack Query persistence (staleTime 5 min, gcTime 24h via localStorage persister)
- "Sem conexão" non-blocking banner
- Retry with exponential backoff on transient errors

---

## Feature Differentiators

| Feature | Module | Cost |
|---------|--------|------|
| Last-synced timestamp badge on list headers | All | Low |
| "Sem conexão" banner (`onlineManager`) | All | Low |
| "Pago em dia" / "Inadimplente" badge on inscription rows | Inscriptions | Low |
| Running total footer (arrecadado vs esperado) | Inscriptions | Low |
| Capacity warning at 90% fill | Events | Low |
| Duplicate-check on name+phone (debounced) | Participants | Medium |
| Draft autosave to localStorage for participant form | Participants | Medium |
| PDF room map export (ACO-07) | Accommodation | High |

Defer to v2+: CSV import, profile photos, public registration portal, QR check-in.

---

## Architecture Decisions

1. **Sheets/Dialogs over Routes.** Detail views open as sheets/dialogs over list pages — not new routes. Only one new route: `/eventos`.
2. **`apiFetch` must surface HTTP status codes first.** `class ApiError extends Error { status: number }` before any mutation hook.
3. **`use-inscricoes.ts` must be extended** before any inscription screen. No mutation hooks exist yet.
4. **`useEventos` migrates** from `use-acomodacoes.ts` to `use-eventos.ts` with re-export for backward compatibility.
5. **AcomodacoesPage requires zero new feature work** — only optimistic update upgrade and stale key fix.
6. **Single Zod schema source: `@koinonia/shared`.** All RHF forms use `zodResolver`. Use `z.coerce.number()` for monetary fields.

---

## Critical Warnings (Top 5)

### 1. `apiFetch` discards HTTP status code [CRITICAL — Foundation]
**Risk:** Cannot distinguish 400/409/422. Blocks 409 conflict handling for bed assignment.
**Prevention:** `class ApiError extends Error { status: number }` in `lib/api.ts`. Do this before writing any mutation hook.

### 2. No cache persistence [CRITICAL — Infrastructure]
**Risk:** Cache garbage-collected after 5 min with WiFi down. Defeats offline grace requirement.
**Prevention:** Add `persistQueryClient` + `createSyncStoragePersister` in `main.tsx`. Set `gcTime: 24h` on critical queries.

### 3. `GET /eventos/:id/inscricoes` does not exist [HIGH — API Gap]
**Risk:** Runtime 404 when building InscricoesPage. The inadimplentes endpoint is not a substitute.
**Prevention:** Add backend route as prerequisite before any frontend INS work.

### 4. Zod/numeric coercion drift [HIGH — Data]
**Risk:** `valor_total` stored as string → `z.number()` fails on edit forms. Enum drift: `PUT /eventos/:id` accepts `'cancelado'` but `StatusEventoEnum` doesn't include it.
**Prevention:** Use `z.coerce.number()` for monetary fields. Audit shared vs inline route schemas before building forms.

### 5. Partial key invalidation leaves ghost entries [HIGH — Data Integrity]
**Risk:** 3-element `inscricoesSemCama` key not cleared by 2-element invalidation.
**Prevention:** Use 2-element prefix `['inscricoes-sem-cama', eventoId]` in `invalidateQueries`.

---

## Design Gaps

| Missing Screen | Required For | Design Approach |
|----------------|-------------|-----------------|
| Event list / card | INS-01 | Follow Participant list pattern (Stitch screens 04-06) |
| Event create / edit form | INS-01 | Follow Participant form sheet pattern |
| Inscription list per event | INS-02 to INS-06 | New; analog: financial list (Stitch screen 11) |
| Payment registration modal | INS-04 | Bottom sheet mobile / Dialog desktop |
| Inadimplency list view | INS-06 | Filtered state of inscription list |

Participants have 4 Stitch screens. Accommodation has 4 Stitch screens. **Events and Inscriptions have zero** — design decisions needed before component work begins.

---

## Recommended Build Order

### Phase 0 — Foundation (before any feature screen)
1. `ApiError` with status code in `apiFetch`
2. `persistQueryClient` + localStorage persister in `main.tsx`
3. `GET /eventos/:id/inscricoes` backend route
4. Audit shared Zod schemas vs inline route schemas; resolve enum drift
5. Install all 11 net-new packages

### Phase 1 — Participants CRUD
`use-participantes.ts` mutations + `ParticipanteFormSheet` (3 tabs) + `ParticipanteDetailSheet` + wire `ParticipantsPage`. Establishes the Sheet-over-list pattern all subsequent modules replicate.

### Phase 2 — Events CRUD
`use-eventos.ts` + `EventosPage` + `EventoFormSheet` + `/eventos` route. Date coercion transforms for datetime fields.

### Phase 3 — Inscriptions CRUD + Payments
Expand `use-inscricoes.ts` mutations + `InscricaoFormDialog` (multi-step) + `PagamentoFormSheet`.

### Phase 4 — Accommodation Polish + Offline Hardening
Optimistic update upgrade for `useAtribuirCama`. Stale key fix. `staleTime` tuning. "Sem conexão" banner.

---

**Confidence:** Stack HIGH | Architecture HIGH | Pitfalls HIGH | Features MEDIUM

**Open decisions blocking scope:** (1) payment receipt upload — v1.1 or v1.2? (2) PDF map export (ACO-07) — v1.1 or v1.2? (3) `StatusEventoEnum` drift — resolve before Event form spec.
