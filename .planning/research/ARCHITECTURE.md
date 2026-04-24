# Architecture: CRUD Screens Integration

**Project:** Koinonia v1.1
**Researched:** 2026-04-22
**Confidence:** HIGH — based on direct codebase analysis

---

## Current State Assessment

### What Already Exists

The router uses `react-router-dom` (NOT TanStack Router despite the milestone context suggesting TanStack Router — `App.tsx` imports from `react-router-dom`). This is a critical observation: no migration needed, but the nested-navigation patterns differ from TanStack Router's file-based routing.

**Existing page shells (not wired to write operations):**
- `ParticipantsPage` — read-only list with search/filter, `useParticipantes()` hook reading `/api/v1/participantes`
- `InscricoesPage` — read-only list scoped by event, `useInadimplentes()` hook
- `AcomodacoesPage` — fully functional mapa + estrutura tabs, AssignCamaSheet, EstruturaAcomodacaoPanel
- `FinanceiroPage` — shell (not inspected, lower priority)

**Hooks already wired with mutations:**
- `use-acomodacoes.ts` — full CRUD for Locais/Quartos/Camas + `useAtribuirCama`/`useLiberarCama` with optimistic invalidation
- `use-inscricoes.ts` — `useInadimplentes` and `useEventos`

**Shared types:** All Zod schemas in `packages/shared/src/index.ts` — `CreatePessoaDTO`, `UpdatePessoaDTO`, `CreateEventoDTO`, `CreateInscricaoDTO`, `CreatePagamentoDTO` etc. are ready for form validation.

**API backend modules:** `pessoas`, `inscricoes`, `acomodacoes`, `financeiro`, `admin` — all structured with controllers/repositories/usecases.

**`apiFetch`:** Single authenticated fetch wrapper with auth header injection and 401 redirect. All new hooks must use this, not raw fetch.

---

## Integration Pattern: Per Screen

### Pattern A — Modal/Sheet for Create/Edit (Participants, Eventos)

The existing `AssignCamaSheet` (shadcn Sheet) demonstrates the correct pattern: sheet opens from list page, contains form, calls mutation, invalidates query on success. Replicate this for:
- `ParticipanteFormSheet` — create/edit with tabbed sections (Dados Básicos / Saúde / Emergência)
- `EventoFormSheet` — create/edit

The "Ver ficha" button on `ParticipanteCard` currently goes nowhere. Wire it to open a drawer/sheet with read-only detail + edit action.

### Pattern B — Inline Flow for Inscricoes

Enrollment is stateful (participant → event → role/value → payments). Use a multi-step dialog (`Dialog` from shadcn) rather than a sheet. State machine: `step: 'select-pessoa' | 'configure' | 'confirm'`.

### Pattern C — Existing (keep as-is)

`AcomodacoesPage` is already fully functional. The `AssignCamaSheet` handles bed assignment with server-side optimistic locking (backend uses SELECT FOR UPDATE). No changes needed to the mapa component.

---

## Component Tree — New Components to Build

```
apps/web/src/
├── hooks/
│   ├── use-participantes.ts    [NEW] — useParticipantes, useCreateParticipante,
│   │                                   useUpdateParticipante, useDeleteParticipante
│   ├── use-eventos.ts          [NEW] — useEventosList, useCreateEvento, useUpdateEvento
│   │                                   (move useEventos from use-acomodacoes.ts here,
│   │                                    re-export from use-acomodacoes to avoid breakage)
│   └── use-inscricoes.ts       [MODIFY] — add useCreateInscricao, useUpdateInscricao,
│                                          useRegistrarPagamento mutations
│
├── components/
│   ├── participantes/          [NEW directory]
│   │   ├── ParticipanteFormSheet.tsx   — create/edit sheet with 3-tab form
│   │   ├── ParticipanteDetailSheet.tsx — read detail + trigger edit
│   │   └── DeleteParticipanteDialog.tsx — confirm deletion
│   ├── eventos/                [NEW directory]
│   │   ├── EventoFormSheet.tsx — create/edit sheet
│   │   └── EventoCard.tsx      — list item card
│   ├── inscricoes/             [NEW directory]
│   │   ├── InscricaoFormDialog.tsx  — multi-step enrollment dialog
│   │   └── PagamentoFormSheet.tsx   — register payment
│   └── shared/                 [NEW directory]
│       ├── ConfirmDialog.tsx    — reusable "are you sure" dialog
│       └── FormField.tsx        — labeled input wrapper (reduce boilerplate)
│
└── pages/
    ├── ParticipantsPage.tsx    [MODIFY] — wire "Ver ficha" + "Adicionar" buttons
    ├── InscricoesPage.tsx      [MODIFY] — add "Nova Inscrição" button + row actions
    └── EventosPage.tsx         [NEW] — list + create/edit (no shell exists yet)
```

**No new routes needed for MVP.** Participants detail, Evento detail, and Inscricao detail are sheets/dialogs over the list pages, not separate routes. Nested navigation (participant → their inscriptions) is a tab within `ParticipanteDetailSheet`, not a route change. This avoids the overhead of adding TanStack Router while keeping the existing react-router-dom setup.

---

## Data Flow per Screen

### ParticipantsPage

```
ParticipantsPage
  useParticipantes()          → GET /api/v1/participantes?page=&q=
  │
  ├─ ParticipanteCard.onClick("Ver ficha")
  │    └─ ParticipanteDetailSheet
  │         useParticipante(id)  → GET /api/v1/participantes/:id
  │         ├─ Tab: Dados        (read-only, renders from cache)
  │         ├─ Tab: Saúde        (read-only)
  │         ├─ Tab: Inscrições   → GET /api/v1/participantes/:id/inscricoes (new endpoint needed)
  │         └─ Ação: Editar
  │              └─ ParticipanteFormSheet
  │                   useUpdateParticipante()  → PATCH /api/v1/participantes/:id
  │                   onSuccess: invalidate ['participantes']
  │
  └─ "Adicionar Participante" button / "Novo Registro" card
       └─ ParticipanteFormSheet (create mode)
            useCreateParticipante() → POST /api/v1/participantes
            onSuccess: invalidate ['participantes']
```

**Query key structure for use-participantes.ts:**
```typescript
export const participantesKeys = {
  all: ['participantes'] as const,
  list: (params?: { page?: number; q?: string }) =>
    [...participantesKeys.all, 'list', params] as const,
  detail: (id: string) => [...participantesKeys.all, 'detail', id] as const,
  inscricoes: (id: string) => [...participantesKeys.all, id, 'inscricoes'] as const,
}
```

### EventosPage (new page, new route needed)

```
EventosPage  (route: /eventos)
  useEventosList()            → GET /api/v1/eventos
  │
  ├─ EventoCard.actions
  │    ├─ Editar → EventoFormSheet (update mode)
  │    │    useUpdateEvento()  → PATCH /api/v1/eventos/:id
  │    └─ Ver inscrições → navigate('/inscricoes?eventoId=X')
  │
  └─ "Novo Evento" button
       └─ EventoFormSheet (create mode)
            useCreateEvento() → POST /api/v1/eventos
```

Add route in `App.tsx`:
```tsx
<Route path="/eventos" element={<ProtectedRoute><EventosPage /></ProtectedRoute>} />
```

### InscricoesPage

```
InscricoesPage
  useEventosList()            → GET /api/v1/eventos
  useInscricoes(eventoId)     → GET /api/v1/eventos/:id/inscricoes (expand from inadimplentes)
  │
  ├─ InscricaoRow actions
  │    ├─ "Registrar Pagamento" → PagamentoFormSheet
  │    │    useRegistrarPagamento() → POST /api/v1/inscricoes/:id/pagamentos
  │    │    onSuccess: invalidate ['inscricoes', eventoId], ['eventos'] (status update)
  │    └─ "Cancelar" → ConfirmDialog → PATCH /api/v1/inscricoes/:id (status: CANCELADA)
  │
  └─ "Nova Inscrição" button
       └─ InscricaoFormDialog (multi-step)
            Step 1: select pessoa (combobox with search → GET /api/v1/participantes?q=)
            Step 2: configure (papel, valor_total, observacoes)
            Step 3: confirm
            useCreateInscricao() → POST /api/v1/inscricoes
            onSuccess: invalidate ['inscricoes', eventoId]
```

**URL state for pre-selected event:** `InscricoesPage` should read `?eventoId=` from search params so EventosPage "Ver inscrições" link deep-links correctly:
```tsx
const [searchParams] = useSearchParams()
const [selectedEventoId, setSelectedEventoId] = useState(searchParams.get('eventoId') ?? '')
```

### AcomodacoesPage (no changes needed)

The page already has full read/write for mapa and estrutura. The `AssignCamaSheet` handles the full assignment flow. `ExportMapaPdfButton` handles PDF. No integration work required.

---

## Optimistic Lock Pattern for Bed Assignment

**Current implementation:** `useAtribuirCama` / `useLiberarCama` use `onSuccess` invalidation (pessimistic — wait for server confirmation, then refresh). This is correct for the race condition case because:

1. The backend runs `SELECT FOR UPDATE` (or equivalent transaction lock) on the `camas` table row
2. If two users try to assign simultaneously, one gets 409/422 from the server
3. `getApiErrorMessage` in `AssignCamaSheet` already translates "ocupad" responses to user-friendly text

**What to add for better UX:** True optimistic updates in TanStack Query require `onMutate` + `onError` rollback. For bed assignment, implement this pattern:

```typescript
export function useAtribuirCama(eventoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ camaId, inscricaoId }) =>
      apiFetch<void>(`/api/v1/acomodacoes/camas/${camaId}/atribuir`, {
        method: 'POST',
        body: JSON.stringify({ inscricao_id: inscricaoId }),
      }),
    onMutate: async ({ camaId, inscricaoId }) => {
      // Cancel outgoing refetches to avoid race with our optimistic update
      await queryClient.cancelQueries({ queryKey: acomodacoesKeys.mapa(eventoId) })

      // Snapshot the previous value
      const previous = queryClient.getQueryData(acomodacoesKeys.mapa(eventoId))

      // Optimistically update the mapa cache — mark cama as occupied
      queryClient.setQueryData(acomodacoesKeys.mapa(eventoId), (old: MapaAcomodacao | undefined) => {
        if (!old) return old
        return {
          ...old,
          quartos: old.quartos.map(q => ({
            ...q,
            camas: q.camas.map(c =>
              c.id === camaId
                ? { ...c, status: 'ocupado', ocupante: { inscricao_id: inscricaoId, nome: '...', /* fill from candidatos cache */ } }
                : c
            ),
          })),
        }
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      // Roll back to the snapshotted value
      if (context?.previous) {
        queryClient.setQueryData(acomodacoesKeys.mapa(eventoId), context.previous)
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server truth
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.mapa(eventoId) })
      queryClient.invalidateQueries({ queryKey: inscricoesSemCamaKeys.list(eventoId) })
    },
  })
}
```

**Key point:** Use `onSettled` (not `onSuccess`) to always invalidate after optimistic updates. The server is the source of truth for bed state — optimistic update only reduces perceived latency.

**Race condition protection is server-side.** The frontend's job is to handle the 409/422 error gracefully (show toast, roll back) and re-fetch the authoritative mapa state. The `getApiErrorMessage` function in `AssignCamaSheet` already does this.

---

## PDF Generation (ExportMapaPdfButton)

`ExportMapaPdfButton` already exists in `apps/web/src/components/acomodacoes/`. Check `apps/web/src/lib/pdf/` for implementation. No new work needed for PDF — it receives `mapa: MapaAcomodacao` and `eventoNome` as props and generates client-side.

For future screens (participant list PDF, inscricoes PDF), replicate the same pattern: pass the already-cached TanStack Query data directly to a PDF generation function without a new fetch.

---

## Nested Navigation Pattern

**Decision: Sheets/Tabs over Routes** for MVP.

The nested hierarchy (participant → their inscriptions → their bed) is handled as:
1. `ParticipantsPage` (list) → click card → `ParticipanteDetailSheet` opens (sheet)
2. Inside `ParticipanteDetailSheet`, Tab "Inscrições" renders `ParticipanteInscricoesList` (inline)
3. From that list, "Ver cama" button → closes sheet, navigates to `/acomodacoes?eventoId=X` with the mapa pre-filtered

This avoids adding route parameters for MVP while keeping the data flow explicit and debuggable. Add URL-based navigation (e.g., `/participantes/:id`) in a future phase if user testing reveals the need.

---

## Shared Form Component Pattern

Use React Hook Form + Zod resolver with the DTOs from `@koinonia/shared`. Pattern:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreatePessoaDTO, type CreatePessoa } from '@koinonia/shared'

function ParticipanteFormSheet({ mode, initialData, onClose }) {
  const form = useForm<CreatePessoa>({
    resolver: zodResolver(CreatePessoaDTO),
    defaultValues: initialData ?? { genero: 'M', restricoes_alimentares: [] },
  })
  // ...
}
```

The shared Zod schemas serve as the single source of validation truth — no duplication between frontend and backend. React Hook Form is not currently installed; add `react-hook-form` and `@hookform/resolvers`.

---

## Build Order Recommendation

Build in this order because of data dependencies:

**Phase 1 — Participantes CRUD** (no upstream dependencies)
- Add `use-participantes.ts` with list, detail, create, update, delete mutations
- Build `ParticipanteFormSheet` (3 tabs: Dados / Saúde / Emergência)
- Wire "Adicionar" button and "Ver ficha" button in `ParticipantsPage`
- Install react-hook-form + @hookform/resolvers

**Phase 2 — Eventos CRUD** (no upstream dependencies, needed before Inscricoes)
- Add `use-eventos.ts` (extract + expand from use-acomodacoes.ts)
- Build `EventosPage` + `EventoFormSheet`
- Add `/eventos` route in `App.tsx`

**Phase 3 — Inscricoes CRUD** (depends on Participants + Eventos existing)
- Expand `use-inscricoes.ts` with create/update/payment mutations
- Build `InscricaoFormDialog` (multi-step)
- Build `PagamentoFormSheet`
- Wire `?eventoId=` URL param in `InscricoesPage`
- Add "Ver inscrições" link from `EventoCard`

**Phase 4 — Optimistic Updates + Polish** (after all CRUD works correctly)
- Upgrade `useAtribuirCama`/`useLiberarCama` to true optimistic updates (onMutate pattern)
- Add `staleTime` tuning for offline grace (5 min for structure, 0 for bed mapa)
- Add toast notifications on mutation success/error (install sonner or use shadcn toast)

---

## Integration Points Summary

| Screen | New Hooks | Modified Components | New Components | Backend Endpoints Needed |
|--------|-----------|---------------------|----------------|--------------------------|
| ParticipantsPage | `use-participantes.ts` (new) | `ParticipantsPage`, `ParticipanteCard` | `ParticipanteFormSheet`, `ParticipanteDetailSheet`, `DeleteParticipanteDialog` | `GET /participantes/:id`, `GET /participantes/:id/inscricoes`, `POST /participantes`, `PATCH /participantes/:id`, `DELETE /participantes/:id` |
| EventosPage | `use-eventos.ts` (new) | `App.tsx` (new route) | `EventosPage`, `EventoFormSheet`, `EventoCard` | `POST /eventos`, `PATCH /eventos/:id` (GET already exists) |
| InscricoesPage | `use-inscricoes.ts` (expand) | `InscricoesPage` | `InscricaoFormDialog`, `PagamentoFormSheet` | `GET /eventos/:id/inscricoes` (expand), `POST /inscricoes`, `PATCH /inscricoes/:id`, `POST /inscricoes/:id/pagamentos` |
| AcomodacoesPage | `use-acomodacoes.ts` (onMutate upgrade) | `AssignCamaSheet` (optional) | none | none — already complete |

---

## Dependencies to Install

```bash
# If not already present
npm install react-hook-form @hookform/resolvers
# Check if sonner or @radix-ui/react-toast is already in shadcn setup
```

---

## Sources

- Direct analysis of `apps/web/src/App.tsx`, `pages/ParticipantsPage.tsx`, `pages/AcomodacoesPage.tsx`, `pages/InscricoesPage.tsx`
- Direct analysis of `apps/web/src/hooks/use-acomodacoes.ts`, `lib/api.ts`
- Direct analysis of `packages/shared/src/index.ts` (all Zod schemas and DTOs)
- TanStack Query optimistic updates pattern: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
