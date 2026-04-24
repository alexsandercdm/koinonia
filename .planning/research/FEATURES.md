# Feature Landscape — Koinonia v1.1 Frontend CRUD

**Domain:** Spiritual retreat management — event/inscription/accommodation CRUD for church organizers
**Researched:** 2026-04-22
**Confidence:** MEDIUM — based on project files, Stitch prototypes, and domain analogs (camp management SaaS, hostel seat maps, church registration platforms)

---

## 1. Participants (Gestão de Pessoas)

Stitch coverage: 4 screens (lista + cadastro, mobile + web). Backend: PES-01 through PES-05 complete.

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Search by name / phone / godfather (padrinho) | Organizers recall participants by relationship, not ID | Low | Autocomplete must work on cached data offline |
| Create/edit form: personal + health + emergency contact | Core data capture, 3 logical sections | Medium | Stitch shows single long form — use accordion sections to reduce scroll |
| Event history list per participant | Required for re-enrollment decisions | Low | Read-only; shows event name, role, payment status |
| Soft-delete with history preservation | Required by PES-05; auditors need history | Low | "Inativar" action, not "Excluir" |
| Inline validation with field-level error messages | Prevents malformed submissions on slow connections | Low | Validate on blur, not on submit only |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Health data read-only in list; expand-on-tap in detail | Protects sensitive data in shared-screen situations | Low | Health block collapsed by default in detail view |
| "Participante já cadastrado?" duplicate check on name+phone | Prevents duplicate records before form submission completes | Medium | Debounced query on name field |
| Last-synced timestamp badge on list | Signals to user that they are viewing stale cache (offline) | Low | TanStack Query `dataUpdatedAt`, shown as "atualizado há X min" |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Bulk import CSV | Out of scope, high parsing complexity for v1.1 | Manual entry only for MVP |
| Profile photo upload | No storage infra defined for participants, adds complexity | Initials avatar generated from name |
| Real-time duplicate merge wizard | Complex conflict resolution, not needed at church scale | Show warning, let organizer decide manually |

---

## 2. Events (Gestão de Eventos)

No dedicated Stitch screen for Events list/detail. Gap — must be designed from scratch following design system.

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| List events with name, date range, location, capacity fill | Primary navigation entry point for organizers | Low | Show "vagas restantes" = capacity − enrolled count |
| Create/edit event: name, period (start+end dates), location, max capacity | INS-01 | Low | Date range picker; location is free text or linked to ACO local |
| Event status indicator: Aberto / Em andamento / Encerrado | Organizers need at-a-glance state | Low | Derived from date range vs today |
| Capacity progress bar | Critical operational metric | Low | enrolled / maxCapacity shown on card |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Quick-duplicate event (clone structure without participants) | Retreats repeat yearly; reusing config saves 80% of setup | Medium | Copies name+location+capacity, clears dates and enrollments |
| Capacity warning at 90% | Proactive alert before event fills | Low | Badge color shift; no push notification needed |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Public event page / registration portal | Explicitly out of scope (Phase 2) | Internal organizer tool only |
| QR code / check-in flow | Phase 2 | Not present in v1.1 |
| Multi-location events (split across chácaras) | Complexity not justified for single-retreat model | One event → one primary location |

---

## 3. Inscriptions (Inscrições e Pagamentos)

No Stitch screen for Inscriptions. Largest UX design gap in v1.1. Backend: INS-02 through INS-07 complete.

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Enroll participant in event: select participant (autocomplete), select role (Encontrista/Servo), set fee | INS-02/INS-03 | Medium | Role determines default fee; organizer can override |
| Inscription list per event with payment status column | Primary operational view during retreat prep | Medium | Status: Pendente / Pago Parcial / Pago Total — color-coded chips |
| Register partial payment: amount, payment method, optional receipt note | INS-04; most common daily action | Medium | Payment method: Dinheiro / PIX / Cartão / Transferência |
| Auto-calculated balance (paid vs owed) | INS-05; organizers must see who owes what at a glance | Low | Display owed = fee − sum(payments) |
| Inadimplency list (filter: only with balance > 0) | INS-06; required for leader follow-up | Low | Exportable to PDF offline via ACO-07 pattern |
| Cancel inscription with refund note | INS-07 | Low | Soft-cancel; retain payment history |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "Pago em dia" / "Inadimplente" badge on participant card in list | Zero-scan operational awareness | Low | Derived from status field |
| Payment registration with optimistic UI update | On slow WiFi, instant feedback prevents double-submission | Medium | TanStack mutation with rollback on error; "pending sync" spinner |
| Running total footer: Total arrecadado vs Total esperado | Leaders need this during payment collection sessions | Low | Computed from inscription list; no backend call needed |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Online payment gateway (Stripe/PIX API) | No payment provider defined; adds PCI scope | Manual payment registration with method tag |
| SMS/email payment reminders | Phase 2; requires notification infra | Show inadimplency list; leader contacts manually |
| Installment plan scheduling | Over-engineered for retreat context | Multiple manual payment entries cover the need |

---

## 4. Accommodation (Acomodação Cama-a-Cama)

Stitch coverage: 4 screens (gestão mapa + cadastro, mobile + web). This is the most visually complex module.

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Bed map: color-coded by status (disponível/ocupado/bloqueado) | ACO-04; core operational view | High | Tap a bed to see who is assigned or to assign |
| Tap-to-assign bed to inscribed participant | ACO-05; primary daily action on mobile | High | Gender validation enforced before commit; optimistic lock retry on conflict |
| Gender violation guard | Room rules (M/F/Misto) strictly enforced | Medium | Error shown inline: "Quarto feminino — participante masculino não permitido" |
| Optimistic lock conflict feedback | Two organizers could assign same bed simultaneously | Medium | On 409 conflict: "Esta cama acabou de ser atribuída por outro usuário. Escolha outra." |
| Hierarchical CRUD: Local → Quartos → Camas | ACO-01/02/03 | Medium | Three nested forms; can be one multi-step flow or separate pages |
| Release bed assignment without canceling inscription | ACO-06 | Low | "Liberar cama" action in bed detail panel |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Room-level occupancy summary (e.g., "4/6 camas ocupadas") | Organizers need room-level status without opening each room | Low | Shown on room card before expanding bed map |
| Filter bed map by gender | When assigning, show only gender-compatible beds | Medium | Toggle: Todos / Masculino / Feminino — reduces cognitive load |
| Unassigned inscriptions sidebar | "Who still needs a bed?" visible alongside map | Medium | List of enrolled participants without bed assignment; tap to initiate assignment |
| PDF room map export | ACO-07; needed for offline use during retreat weekend | High | Use browser print-to-PDF or jsPDF; static snapshot of current state |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Drag-and-drop bed assignment on mobile | Touch drag on a dense grid is unreliable on phones; Stitch prototype shows it but it creates fat-finger errors | Tap-to-select participant, then tap bed to assign (two-step tap) |
| Real-time presence cursors (who else is on this screen) | WebSocket complexity with no clear win on 2-4 concurrent organizers | Optimistic lock conflict message is sufficient |
| Floor plan / blueprint image upload | No image storage infra; complex to maintain | Grid-based room layout (rows of bed cards) is sufficient |
| Automatic room balancing algorithm | Organizers have personal knowledge of participants (health, relationship) that algorithms can't encode | Manual assignment with gender guard only |

---

## 5. Cross-Cutting: Mobile-First & Offline Patterns

These apply to all four sections above.

### Table Stakes (all screens)

| Pattern | Why Required | Implementation |
|---------|--------------|----------------|
| Touch targets >= 48px | PROJECT.md constraint; fat-finger errors at chácara | Minimum button/card height enforced via design tokens |
| Font >= 16px (Inter) | PROJECT.md constraint; outdoor use in variable lighting | Base font size 16px, never override smaller |
| TanStack Query extended cache (staleTime >= 5 min, gcTime >= 30 min) | Intermittent WiFi; read views must work offline | `persistQueryClient` with localStorage adapter |
| "Pending sync" indicator on mutations | Write paths (payment, bed assignment) may be queued | Spinner or "enviando..." badge on optimistic-updated rows |
| Error retry with exponential backoff | Transient network failure during form submit | TanStack mutation `retry: 3` with `retryDelay` |

### Differentiators

| Pattern | Value Proposition | Complexity |
|---------|-------------------|------------|
| Last-synced timestamp on list headers | Organizer knows data freshness without pulling to refresh | Low |
| "Sem conexão" banner (non-blocking) | Informs without blocking read tasks | Low — `onlineManager` from TanStack |

### Anti-Features

| Anti-Feature | Why Avoid |
|--------------|-----------|
| Full offline-write queue (IndexedDB mutation store) | Conflict resolution on sync is complex; partial payment or bed assignment conflicts are high-stakes. Block writes with clear "sem conexão" message instead |
| Service Worker for asset caching | Adds build complexity; app is internal tool with controlled sessions — browser cache is sufficient |

---

## Feature Dependencies

```
Events → Inscriptions (must have event before enrolling)
Participants → Inscriptions (must have participant before enrolling)
Inscriptions → Accommodation Map assignment (only enrolled participants can be assigned a bed)
Local (ACO-01) → Quartos (ACO-02) → Camas (ACO-03) → Map (ACO-04/05)
```

## MVP Priority Order

1. Participants CRUD — foundation for everything else
2. Events CRUD — required before any inscription
3. Inscriptions + Payment registration — highest daily-use operational flow
4. Accommodation CRUD (Local/Quarto/Cama hierarchy) — prerequisite for map
5. Bed assignment map — most complex, built last when all upstream data exists

Defer: PDF map export (ACO-07) — functional but not blocking; can ship as follow-on to map MVP.

## Stitch Design Gaps

| Missing Screen | Required For | Design Approach |
|----------------|--------------|-----------------|
| Event list / create / edit | INS-01 | Follow Participant list/form pattern from Stitch screens 04-06 |
| Inscription list per event | INS-02 through INS-06 | New design; closest analog is Stitch financial list (screen 11) |
| Payment registration modal | INS-04 | Bottom sheet modal on mobile; Dialog on desktop |
| Inadimplency list | INS-06 | Filtered view of inscription list; no new screen needed |

---

## Sources

- Project files: `/Users/alexsandercdm/Projetos/koinonia/.planning/PROJECT.md`, `REQUIREMENTS.md`
- Design inventory: `/Users/alexsandercdm/Projetos/koinonia/.planning/design/UI-SPEC.md`
- Stitch prototypes: `.planning/stitch-assets/html/` (14 screens)
- Domain analogs: Camp management SaaS (CampMinder, Planning Center Registrations), hostel bed selectors (Hostelworld), church tithing platforms — confidence MEDIUM (training data, not verified via live docs)
- TanStack Query offline patterns — confidence HIGH (well-established library behavior)
