# Phase 6: Infrastructure Foundation — Research

**Researched:** 2026-04-22
**Domain:** TypeScript monorepo infrastructure — API error handling, TanStack Query persistence, Fastify route gaps, Zod schema drift, package installation
**Confidence:** HIGH (all findings sourced from codebase inspection; no assumed stack choices)

---

## Summary

Phase 6 fixes five discrete infrastructure bugs that block all downstream CRUD UI phases. Every bug was confirmed by reading the actual source files — there are no speculative findings.

**INFRA-01:** `apiFetch` in `apps/web/src/lib/api.ts` throws a generic `Error` with a message string. It does NOT throw a typed `ApiError` with a numeric `.status` field. Any `onError` callback that tries to distinguish 409 vs 400 (e.g., for the acomodacoes optimistic rollback in Phase 10) will fail because `error.status` is `undefined`.

**INFRA-02:** `apps/web/src/main.tsx` creates a bare `QueryClient` with no persistence layer. `gcTime` defaults to 5 minutes. Data does not survive page navigation when the API is unreachable. The `@tanstack/react-query-persist-client` and a storage persister (either `@tanstack/query-sync-storage-persister` for localStorage or `createAsyncStoragePersister`+`idb-keyval` for IndexedDB) are absent from `package.json`.

**INFRA-03:** `apps/api/src/modules/inscricoes/routes/inscricoes.ts` has no `GET /eventos/:id/inscricoes` route. `findByEventoId` exists on `InscricaoRepository` and works. Only the HTTP route binding is missing.

**INFRA-04:** Two drifts confirmed. (1) The Fastify JSON schema at `PUT /eventos/:id` includes `'cancelado'` as a valid `status` value; `StatusEventoEnum` in `packages/shared/src/index.ts` has `['rascunho', 'aberto', 'encerrado', 'realizado']` — no `cancelado`. This means Fastify accepts a value the shared contract rejects. (2) `valor_total` is a `numeric(10,2)` column in Drizzle (`db/schema.ts`). Node-postgres returns `numeric` columns as **strings** by default. `InscricaoRepository.ts` has zero `Number()` or `parseFloat()` conversion. The shared `InscricaoSchema` declares `valor_total: z.number()` — this will fail validation or silently produce NaN in frontend arithmetic.

**INFRA-05:** 11 packages are absent from `apps/web/package.json`: form helpers, Radix primitives used by phases 7–10, and the persistence stack. Full list in the Standard Stack section below.

**Primary recommendation:** Execute the five fixes as independent, verifiable tasks. They have no internal dependencies and can be planned and committed separately.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | `apiFetch` exposes HTTP status via `ApiError` — `onError` can distinguish 400/409/422 | apiFetch confirmed to throw generic Error — needs ApiError class + status capture |
| INFRA-02 | TanStack Query cache persisted to localStorage (gcTime 24h) for 24h offline grace | main.tsx has no persist layer — needs @tanstack/react-query-persist-client + storage persister |
| INFRA-03 | `GET /eventos/:id/inscricoes` exists in backend and returns inscriptions list | Route confirmed missing — repository `findByEventoId` is ready, only route binding needed |
| INFRA-04 | Zod schemas aligned with backend routes — `StatusEventoEnum` and `valor_total` coercion correct | Two specific drifts confirmed and documented — fix paths defined below |
| INFRA-05 | 11 packages installed (react-day-picker, react-imask, react-dropzone, Radix primitives, persist-client) | All 11 packages missing from package.json — versions verified against npm registry |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| API error surface | Frontend (lib/api.ts) | — | Error class lives in web layer; no backend change |
| Cache persistence | Frontend (main.tsx) | — | QueryClient config is frontend-only |
| GET /eventos/:id/inscricoes | API / Backend | — | New route on Fastify server; no frontend change |
| StatusEventoEnum drift | Shared (packages/shared) + API route | — | Shared Zod is source of truth; Fastify JSON schema follows |
| valor_total coercion | API repository boundary | Shared Zod (z.coerce) | String leaks from node-postgres; fix at narrowest point |
| Package installation | Frontend (apps/web) | — | packages only needed by web app |

---

## Standard Stack

### Core (already installed — verified from apps/web/package.json)

| Library | Installed Version | Purpose |
|---------|------------------|---------|
| @tanstack/react-query | ^5.0.0 | Server state + cache management |
| react-hook-form | ^7.51.0 | Form state management |
| @hookform/resolvers | ^3.3.0 | Zod integration for forms |
| zod | ^3.22.0 | Schema validation (shared + web) |
| react-router-dom | ^6.22.0 | Client-side routing |

### Required New Packages (INFRA-05 — all 11)

| Package | npm Latest | Purpose | Needed By |
|---------|-----------|---------|-----------|
| @tanstack/react-query-persist-client | 5.99.2 | Persist QueryClient to storage | INFRA-02 |
| @tanstack/query-sync-storage-persister | 5.99.2 | localStorage adapter for persist-client | INFRA-02 |
| idb-keyval | 6.2.2 | IndexedDB key-value (fallback async persister) | INFRA-02 (async path) |
| react-day-picker | 9.14.0 | Date picker component | Phase 8 (events form) |
| react-imask | 7.6.1 | Input masking (phone, CPF) | Phase 7 (participants form) |
| react-dropzone | 15.0.0 | File drag-and-drop upload | Phase 4 (despesas) |
| @radix-ui/react-checkbox | 1.3.3 | Accessible checkbox primitive | Phases 7-9 |
| @radix-ui/react-tabs | 1.1.13 | Tab navigation primitive | Phase 7 (3-tab person form) |
| @radix-ui/react-switch | 1.2.6 | Toggle switch primitive | Phases 7-9 |
| @radix-ui/react-popover | 1.1.15 | Popover/dropdown layer | Phase 7-8 |
| @radix-ui/react-radio-group | 1.3.8 | Radio group primitive | Phase 9 (papel selection) |

**Version verification:** All versions confirmed via `npm view <package> version` on 2026-04-22. [VERIFIED: npm registry]

**Installation command:**
```bash
cd apps/web && npm install \
  @tanstack/react-query-persist-client@5.99.2 \
  @tanstack/query-sync-storage-persister@5.99.2 \
  idb-keyval@6.2.2 \
  react-day-picker@9.14.0 \
  react-imask@7.6.1 \
  react-dropzone@15.0.0 \
  @radix-ui/react-checkbox@1.3.3 \
  @radix-ui/react-tabs@1.1.13 \
  @radix-ui/react-switch@1.2.6 \
  @radix-ui/react-popover@1.1.15 \
  @radix-ui/react-radio-group@1.3.8
```

> Note: `react-day-picker@9.x` has a breaking API from v8 (component props and classNames differ). If downstream phases were designed for v8 syntax, pin to `^8.10.1` instead. [ASSUMED — see Assumptions Log A1]

---

## Architecture Patterns

### INFRA-01: ApiError Class Pattern

```typescript
// apps/web/src/lib/api.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Inside apiFetch, replace the generic throw:
if (!response.ok) {
  const errorBody = await response.json().catch(() => ({}))
  const message =
    (errorBody as { message?: string }).message ||
    `HTTP ${response.status}: ${response.statusText}`
  throw new ApiError(message, response.status, errorBody)
}
```

Caller pattern:
```typescript
onError: (error) => {
  if (error instanceof ApiError && error.status === 409) {
    // rollback optimistic update
  }
}
```

[VERIFIED: codebase — apps/web/src/lib/api.ts]

### INFRA-02: persistQueryClient Setup

**Recommendation:** Use `@tanstack/query-sync-storage-persister` with localStorage for simplicity. localStorage quota (~5MB) is sufficient for this app's data volume. IDB is available as a fallback if quota issues arise in production.

```typescript
// apps/web/src/main.tsx
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes — data fresh threshold
      gcTime: 1000 * 60 * 60 * 24, // 24 hours — keep in cache/storage
      retry: 1,
    },
  },
})

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
})

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
})
```

[CITED: https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient]

### INFRA-03: GET /eventos/:id/inscricoes Route

The `InscricaoRepository.findByEventoId(eventoId)` method already exists and returns inscriptions with `pessoa` joined. Only the route binding is missing.

Add to `apps/api/src/modules/inscricoes/routes/inscricoes.ts`:
```typescript
fastify.get('/eventos/:id/inscricoes', { ...requireAuth }, 
  inscricaoController.listByEvento.bind(inscricaoController))
```

Add to `InscricaoController`:
```typescript
async listByEvento(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const inscricoes = await this.inscricaoRepository.findByEventoId(request.params.id)
  return reply.send(inscricoes)
}
```

[VERIFIED: codebase — apps/api/src/modules/inscricoes/repositories/InscricaoRepository.ts]

### INFRA-04a: StatusEventoEnum — Remove 'cancelado' from Fastify JSON Schema

The shared Zod enum has 4 values: `rascunho | aberto | encerrado | realizado`.
The Fastify inline JSON schema at `PUT /eventos/:id` adds `'cancelado'` — not in shared contract.

Fix: remove `'cancelado'` from the Fastify JSON schema enum OR add it to shared Zod.
**Decision path:** Determine whether `cancelado` is a legitimate business state. If yes, add to `StatusEventoEnum` in shared. If no, remove from Fastify schema.
[ASSUMED — see Assumptions Log A2]

### INFRA-04b: valor_total String-to-Number Coercion

`numeric(10,2)` in Drizzle/node-postgres returns as a JavaScript string. `InscricaoRepository` passes rows directly without conversion. Shared `InscricaoSchema` uses `z.number()` which will fail on strings.

**Fix at repository boundary (narrowest blast radius):**
```typescript
// InscricaoRepository.ts — after every .returning() that includes valor_total
const normalize = (row: any) => ({
  ...row,
  valor_total: row.valor_total !== undefined ? Number(row.valor_total) : row.valor_total,
  valor_pago:  row.valor_pago  !== undefined ? Number(row.valor_pago)  : row.valor_pago,
})
```

**Alternative — shared Zod coercion (simpler, but affects DTO validation too):**
```typescript
// packages/shared/src/index.ts
valor_total: z.coerce.number().min(0),  // was z.number().min(0)
valor_pago:  z.coerce.number().min(0),
```

The Zod coerce approach is simpler and does not change wire behavior because Zod is used for validation/typing, not as a runtime serializer in this codebase. Recommended unless coercion at the DB boundary is preferred for purity.

[VERIFIED: codebase — apps/api/src/db/schema.ts, apps/api/src/modules/inscricoes/repositories/InscricaoRepository.ts, packages/shared/src/index.ts]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Typed HTTP errors | Custom try/catch boilerplate in every hook | `ApiError` class in `lib/api.ts` | Single source of truth; all hooks inherit |
| Cache persistence | Manual localStorage read/write | `persistQueryClient` + `createSyncStoragePersister` | Handles serialization, expiry, dehydration |
| Input masking | Custom onChange formatters | `react-imask` | Handles cursor position, partial input, all mask types |

---

## Common Pitfalls

### Pitfall 1: gcTime vs staleTime Confusion
**What goes wrong:** Setting only `staleTime: 24h` does not persist data to storage. `staleTime` controls when background refetch triggers. `gcTime` controls how long data is kept in memory/storage.
**How to avoid:** Set `gcTime: 24h` on the QueryClient AND call `persistQueryClient()`. Both are required for INFRA-02.
**Warning signs:** Data disappears after page reload even though staleTime is set.

### Pitfall 2: persistQueryClient Must Be Called After QueryClient Init
**What goes wrong:** `persistQueryClient()` called inside a React component causes re-registration on every render.
**How to avoid:** Call `persistQueryClient()` once, at module level in `main.tsx`, before `ReactDOM.createRoot`.

### Pitfall 3: ApiError Not Exported
**What goes wrong:** Hooks import `apiFetch` but can't do `instanceof ApiError` because the class is not exported.
**How to avoid:** Export `ApiError` from `apps/web/src/lib/api.ts` and import in every hook that needs status discrimination.

### Pitfall 4: valor_total NaN in Frontend
**What goes wrong:** Repository returns `{ valor_total: "150.00" }`. Frontend code does `inscricao.valor_total + pagamento.valor` → `"150.00" + 50` = `"150.0050"` (string concatenation).
**How to avoid:** Apply coercion in shared Zod (`z.coerce.number()`) or in repository before returning.

### Pitfall 5: react-day-picker v9 Breaking Changes
**What goes wrong:** v9 removed `fromDate`/`toDate` props (replaced by `disabled`), removed `captionLayout="dropdown-buttons"`, and changed component composition.
**How to avoid:** If installing v9, read the v9 migration guide. If Phase 8 was designed with v8 API in mind, pin to `^8.10.1`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @tanstack/react-query v4 `cacheTime` | v5 `gcTime` (renamed) | TanStack Query v5 (2023) | Must use `gcTime` not `cacheTime` in QueryClient config |
| `persistQueryClient` as separate package | Now `@tanstack/react-query-persist-client` (separate package, aligned with v5) | TanStack Query v5 | Import from new package name |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | react-day-picker v9.x is compatible with intended usage in Phase 8 | Standard Stack, INFRA-05 | If Phase 8 was designed for v8 API, props will not exist — pin to ^8.10.1 instead |
| A2 | `cancelado` in Fastify schema is a mistake (not a valid business state) | INFRA-04a | If `cancelado` is needed, it must be added to shared `StatusEventoEnum` before any frontend code uses it |
| A3 | localStorage quota is sufficient for 24h cache of this app's data volume | INFRA-02 | If events + inscricoes + participants data exceeds ~4MB, switch to IDB async persister |

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Better Auth handles auth (unchanged) |
| V3 Session Management | yes | Do NOT cache session queries in persist-client — session state must stay in memory only |
| V4 Access Control | no | Backend enforces roles; no frontend RBAC in scope |
| V5 Input Validation | yes | zod validates API responses; ApiError body must not be exposed raw in UI toasts |
| V6 Cryptography | no | No new crypto operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Caching auth tokens in localStorage via persist-client | Info Disclosure | Exclude session/auth queries from persistence with `shouldDehydrateQuery` predicate |
| Leaking raw server error bodies in UI | Info Disclosure | `ApiError` should expose `message` only; `body` field is for internal use, not toast display |

**persist-client session exclusion pattern:**
```typescript
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      // Exclude auth/session queries from persistence
      !query.queryKey.includes('session') && !query.queryKey.includes('auth'),
  },
})
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / npm | All package installs | ✓ | (existing project runs) | — |
| PostgreSQL (Drizzle) | INFRA-03 (backend route) | ✓ | (existing backend works) | — |
| No new external services | — | — | — | — |

Step 2.6: No new external services or CLI tools introduced by Phase 6. All changes are code edits + npm installs.

---

## Open Questions

1. **Is `cancelado` a valid `StatusEvento` business value?**
   - What we know: Present in Fastify JSON schema for `PUT /eventos/:id`, absent from shared Zod enum
   - What's unclear: Whether it was intentionally omitted from shared or added to Fastify by accident
   - Recommendation: Ask user before writing INFRA-04 task — if yes, add to shared enum + types; if no, remove from Fastify schema

2. **react-day-picker v8 vs v9?**
   - What we know: v9.14.0 is current; v9 has breaking API vs v8
   - What's unclear: Whether Phase 8 UI designs reference v8 or v9 component props
   - Recommendation: Default to v9 (install latest); document migration guide ref in Phase 8 task

---

## Sources

### Primary (HIGH confidence — codebase verified)
- `apps/web/src/lib/api.ts` — confirmed generic Error, no status field
- `apps/web/src/main.tsx` — confirmed no persistQueryClient setup
- `apps/api/src/modules/inscricoes/routes/inscricoes.ts` — confirmed missing GET /eventos/:id/inscricoes
- `apps/api/src/db/schema.ts` — confirmed `numeric(10,2)` type for valor_total
- `apps/api/src/modules/inscricoes/repositories/InscricaoRepository.ts` — confirmed no Number() conversion
- `packages/shared/src/index.ts` — confirmed StatusEventoEnum values and z.number() for valor_total
- `apps/web/package.json` — confirmed 11 packages missing

### Secondary (MEDIUM confidence)
- npm registry `npm view <pkg> version` — all 11 package versions verified 2026-04-22
- [CITED: https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient] — persistQueryClient API

---

## Metadata

**Confidence breakdown:**
- Bug identification: HIGH — all 5 bugs confirmed from source files
- Fix patterns: HIGH — standard patterns, INFRA-01/02/03/04b confirmed approaches
- Package versions: HIGH — verified from npm registry
- StatusEvento drift resolution: MEDIUM — fix path depends on business intent (ASSUMED A2)

**Research date:** 2026-04-22
**Valid until:** 2026-05-22 (stable tech domain; npm versions may drift)
