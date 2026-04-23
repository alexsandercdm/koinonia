# Phase 6: Infrastructure Foundation — Pattern Map

**Mapped:** 2026-04-22
**Files analyzed:** 7 (all modifications to existing files — no new files)
**Analogs found:** 5 / 7 (2 have no codebase analog — use RESEARCH.md patterns)

---

## File Classification

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `apps/web/src/lib/api.ts` | utility | request-response | same file lines 35-41 (generic throw being replaced) | self |
| `apps/web/src/main.tsx` | config/provider | — | no codebase analog | none |
| `apps/api/src/modules/inscricoes/routes/inscricoes.ts` | route | request-response | sibling GET routes lines 73-74, 137-139 | exact |
| `apps/api/src/modules/inscricoes/controllers/InscricaoController.ts` | controller | request-response | sibling `getById` method lines 110-121 | exact |
| `packages/shared/src/index.ts` (StatusEventoEnum) | schema | — | sibling enums lines 4-13 | exact |
| `packages/shared/src/index.ts` (valor_total coercion) | schema | — | sibling fields lines 82-83 | exact |
| `apps/web/package.json` | config | — | no analog applicable | none |

---

## Pattern Assignments

### `apps/web/src/lib/api.ts` — INFRA-01: ApiError class + typed throw

**Analog:** Same file — the block being replaced

**Current pattern to replace** (lines 35-41):
```typescript
if (!response.ok) {
  const errorBody = await response.json().catch(() => ({}))
  const message =
    (errorBody as { message?: string }).message ||
    `HTTP ${response.status}: ${response.statusText}`
  throw new Error(message)   // <-- generic; .status is undefined on callers
}
```

**Target pattern — add ApiError class before `getAuthHeaders` and replace the throw:**
```typescript
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

// Inside apiFetch — replace the existing `throw new Error(message)` with:
throw new ApiError(message, response.status, errorBody)
```

**Caller pattern that unlocks (for downstream hook files):**
```typescript
onError: (error) => {
  if (error instanceof ApiError && error.status === 409) {
    // rollback optimistic update
  }
}
```

**Critical:** `ApiError` must be exported (`export class ApiError`). Without the export, downstream hooks cannot use `instanceof ApiError`.

---

### `apps/web/src/main.tsx` — INFRA-02: persistQueryClient setup

**Analog:** No codebase analog. Use RESEARCH.md §INFRA-02 and §Security Domain patterns.

**Current pattern** (lines 8-15) — bare QueryClient, no persistence:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})
```

**Target pattern — add gcTime + persistence (module-level, before ReactDOM.createRoot):**
```typescript
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes — background refetch threshold
      gcTime: 1000 * 60 * 60 * 24, // 24 hours — keep in memory/storage
      retry: 1,
    },
  },
})

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
})

// Must be called at module level, not inside a React component
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      // SECURITY: exclude session/auth queries from localStorage persistence
      !query.queryKey.includes('session') && !query.queryKey.includes('auth'),
  },
})
```

**Security constraint:** The `shouldDehydrateQuery` predicate is mandatory. Without it, session tokens cached by Better Auth would be persisted to localStorage, creating an information-disclosure risk.

**Pitfall:** `staleTime: 24h` alone does NOT persist data across page reloads. Both `gcTime: 24h` AND `persistQueryClient()` are required.

---

### `apps/api/src/modules/inscricoes/routes/inscricoes.ts` — INFRA-03: GET /eventos/:id/inscricoes route binding

**Analog:** Sibling GET routes in the same file

**Analog 1 — simple GET with id param** (lines 73-74):
```typescript
fastify.get('/eventos/:id', { ...requireAuth }, eventoController.getById.bind(eventoController))
```

**Analog 2 — GET with evento_id param + requireLider** (lines 137-139):
```typescript
fastify.get('/eventos/:evento_id/inadimplentes', {
  ...requireLider
}, inscricaoController.getInadimplentes.bind(inscricaoController))
```

**Target pattern — add after line 93 (after existing `GET /inscricoes/:id`):**
```typescript
fastify.get('/eventos/:id/inscricoes', { ...requireAuth },
  inscricaoController.listByEvento.bind(inscricaoController))
```

**Note:** No inline JSON schema needed — GET routes in this codebase use only auth preHandlers, not body schemas.

---

### `apps/api/src/modules/inscricoes/controllers/InscricaoController.ts` — INFRA-03: listByEvento method

**Analog:** Sibling `getById` method in the same file (lines 110-121)

**Analog pattern** (lines 110-121):
```typescript
async getById(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    const inscricao = await this.repository.findById(id)
    if (!inscricao) {
      return reply.status(404).send({ error: 'Inscrição não encontrada' })
    }
    return reply.send(inscricao)
  } catch (error) {
    return reply.status(500).send({ error: 'Internal server error' })
  }
}
```

**Target pattern — add after `getById` method:**
```typescript
async listByEvento(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any
    const inscricoes = await this.repository.findByEventoId(id)
    return reply.send(inscricoes)
  } catch (error) {
    return reply.status(500).send({ error: 'Internal server error' })
  }
}
```

**Note:** `findByEventoId` returns an array (never null), so no 404 check needed — empty array is a valid response.

**Existing repository method (no changes needed)** (`InscricaoRepository.ts` lines 47-54):
```typescript
async findByEventoId(eventoId: string) {
  return await this.db.query.inscricoes.findMany({
    where: eq(inscricoes.evento_id, eventoId),
    with: {
      pessoa: true,
    },
  })
}
```

---

### `packages/shared/src/index.ts` — INFRA-04a: StatusEventoEnum — remove 'cancelado' from Fastify schema

**Note:** This is a two-file change. The shared Zod enum is the source of truth.

**Shared enum (line 7) — currently correct, 4 values:**
```typescript
export const StatusEventoEnum = z.enum(['rascunho', 'aberto', 'encerrado', 'realizado'])
```

**Route schema drift (routes/inscricoes.ts line 56) — contains extra 'cancelado':**
```typescript
status: { type: 'string', enum: ['rascunho', 'aberto', 'encerrado', 'realizado', 'cancelado'] },
```

**Fix:** Remove `'cancelado'` from the Fastify JSON schema enum at `routes/inscricoes.ts` line 56 so it matches the shared enum's 4 values. Do NOT add `'cancelado'` to the shared enum unless business requirements confirm it as a valid state.

**Analog:** Sibling enums on lines 4-13 of `packages/shared/src/index.ts` follow the pattern `z.enum([...])` with values aligned to DB column constraints.

---

### `packages/shared/src/index.ts` — INFRA-04b: valor_total / valor_pago coercion

**Current pattern** (`packages/shared/src/index.ts` lines 82-83):
```typescript
valor_total: z.number().min(0),
valor_pago: z.number().min(0),
```

**Problem:** node-postgres returns `numeric(10,2)` columns as JavaScript strings. `z.number()` fails on strings, producing validation errors or NaN in frontend arithmetic.

**Target pattern — change z.number() to z.coerce.number():**
```typescript
valor_total: z.coerce.number().min(0),
valor_pago:  z.coerce.number().min(0),
```

**Analog:** Same fields on lines 82-83. One-token change per field; no other schema fields are affected.

**Why coerce in shared Zod (not in repository):** Simpler, single touch-point, does not change wire behavior since Zod is used for validation/typing only — not as a serializer. The coerce approach is recommended in RESEARCH.md §INFRA-04b.

---

### `apps/web/package.json` — INFRA-05: 11 new packages

**Nature:** Config file edit — no code pattern applies.

**All 11 packages to add under `dependencies`:**

| Package | Version |
|---------|---------|
| `@tanstack/react-query-persist-client` | `5.99.2` |
| `@tanstack/query-sync-storage-persister` | `5.99.2` |
| `idb-keyval` | `6.2.2` |
| `react-day-picker` | `9.14.0` |
| `react-imask` | `7.6.1` |
| `react-dropzone` | `15.0.0` |
| `@radix-ui/react-checkbox` | `1.3.3` |
| `@radix-ui/react-tabs` | `1.1.13` |
| `@radix-ui/react-switch` | `1.2.6` |
| `@radix-ui/react-popover` | `1.1.15` |
| `@radix-ui/react-radio-group` | `1.3.8` |

**Installation command (run once; updates package.json + package-lock.json):**
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

**Note on react-day-picker:** v9.x has breaking API vs v8 (`fromDate`/`toDate` removed, `disabled` replaces them). If Phase 8 UI designs reference v8 syntax, pin to `^8.10.1` instead.

---

## Shared Patterns

### Error Handling (all controller methods)
**Source:** `apps/api/src/modules/inscricoes/controllers/InscricaoController.ts` — every method
**Pattern:**
```typescript
try {
  // ...business logic...
} catch (error) {
  if (error instanceof Error) {
    return reply.status(400).send({ error: error.message })
  }
  return reply.status(500).send({ error: 'Internal server error' })
}
```
Simple GET-only methods (no use-case, just repository) use only the 500 path (no 400 branch needed).

### Auth Middleware
**Source:** `apps/api/src/modules/inscricoes/routes/inscricoes.ts` lines 10-12
```typescript
const requireAuth = { preHandler: [authMiddleware] }
const requireLider = { preHandler: [requireRole('lider')] }
const requireAdmin = { preHandler: [requireRole('admin')] }
```
New `GET /eventos/:id/inscricoes` uses `requireAuth` (read access), not `requireLider`.

---

## No Analog Found

| File | Role | Reason |
|------|------|--------|
| `apps/web/src/main.tsx` (persist setup) | config/provider | No persistence layer exists anywhere in the codebase. Use RESEARCH.md §INFRA-02 + §Security Domain patterns. |
| `apps/web/src/lib/api.ts` (ApiError class) | utility | No custom error class exists in the web app. Use RESEARCH.md §INFRA-01 pattern. |

---

## Metadata

**Analog search scope:** `apps/web/src/`, `apps/api/src/modules/inscricoes/`, `packages/shared/src/`
**Files read:** 6 source files
**Pattern extraction date:** 2026-04-22
