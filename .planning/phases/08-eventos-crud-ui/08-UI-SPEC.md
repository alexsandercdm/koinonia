---
phase: 8
slug: eventos-crud-ui
status: approved
shadcn_initialized: false
preset: none
created: 2026-04-26
reviewed_at: 2026-04-26
---

# Phase 8 - UI Design Contract

> Visual and interaction contract for Eventos CRUD UI and the event-aware AppShell. Generated from Phase 8 context, roadmap, requirements, live frontend primitives, and `doc/Design System Koinonia.html`.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | local React primitives in `apps/web/src/components/ui` |
| Icon library | Material Symbols Rounded for navigation/domain icons; existing lucide icons may remain for utility-only controls when already present |
| Font | DM Sans, with `sans-serif` fallback |

### Source Priority

1. `doc/Design System Koinonia.html` is the canonical visual source for Phase 8.
2. `doc/Koinonia-redesign/*` files are flow references only; the HTML wins on style conflicts.
3. Existing runtime primitives stay in place, but touched primitives must align to this contract.

---

## Spacing Scale

Declared values use the standard 4-point scale. Implementation may use component dimensions such as 56px header height and 44px mobile touch targets because those remain multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, FilterTabs internal gap, tight metadata grouping |
| sm | 8px | Compact element spacing, button gaps, nav item vertical rhythm |
| md | 16px | Default form gap, table cell horizontal padding, header internal gap |
| lg | 24px | Drawer body padding, section gaps, desktop header horizontal padding |
| xl | 32px | Event banner padding, major page group spacing |
| 2xl | 48px | Empty-state vertical breathing room, large stacked section breaks |
| 3xl | 64px | Design-system section offset only; avoid inside the operational Eventos screen |

Exceptions:
- Button/Input radius is 7px, Card radius is 10px, Drawer/dropdown radius is 10px, and Badge/pill radius is 99px because these are locked by the official design system.
- Event form drawer width is 440-520px on desktop and full-width on narrow mobile screens.
- AppShell header height and collapsed sidebar width are 56px.

---

## Typography

Phase 8 is an operational workflow, so it must avoid oversized marketing type. Use only these four font sizes and two weights in the Eventos surface.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 | 1.6 |
| Label | 11px | 600 | 1.2 |
| Heading | 16px | 600 | 1.4 |
| Display | 22px | 600 | 1.3 |

Usage rules:
- `Display` is reserved for page titles or the main event card title, not for every card.
- `Heading` is used for drawer titles, card titles, and section headers.
- `Label` is uppercase only for section labels, table headers, and status/category captions.
- Letter spacing is `0` by default. Labels may use `0.08em`; badges may use `0.02em` because this is locked by the design system.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#F7F4EF` | App background and page canvas |
| Secondary (30%) | `#FFFFFF`, `#FDFCFA` | Cards, drawer panels, header, sidebar, raised sections |
| Accent (10%) | `#C4923A`, `#EDD8AD`, `#F5ECD9` | Primary event actions, active nav border, active EventPill state, focus rings, selected event indicators |
| Destructive | `#9B3A2E`, `#FBECEC` | Cancel/destructive UI only; Phase 8 has no event delete flow unless explicitly added later |

Accent reserved for:
- `Novo evento` CTA and create/update success emphasis.
- Active `/eventos` nav item: `goldLight` background, `gold` left border, filled Material Symbol.
- EventPill icon, open ring, active dropdown row, and selected-event checkmark.
- Focus rings for inputs/selects/textareas and keyboard-focused event cards.
- Capacity progress bar when the card is showing real occupancy or active selected-event emphasis.

Semantic status colors:
- `rascunho` -> Planejamento -> gold badge.
- `aberto` -> Aberto -> success badge.
- `encerrado` -> Encerrado -> warning or neutral badge depending on visual density; do not show as success.
- `realizado` -> Realizado -> info badge.
- `cancelado` -> Cancelado -> danger badge.

Capacity color rules:
- If real occupancy is available: 0-69% success, 70-89% warning, 90-100% danger.
- If real occupancy is not available from the API, show capacity as a neutral text metric and do not invent "0/N vagas ocupadas" as factual occupancy. A neutral 0% placeholder may appear only with explicit copy that the screen is showing capacidade cadastrada, not inscritos.

---

## Visual Hierarchy

Primary screen focal point:
- The first focal point is the Eventos page header row: title, short operational subtitle, and admin-only `Novo evento` CTA.
- The second focal point is the event list/grid, where each card emphasizes status badge, event name, date range, local/capacity metadata, and edit action.

AppShell focal point:
- The active event context is visible in the 56px header through EventPill.
- The sidebar must make `/eventos` discoverable in both desktop and mobile navigation.

Layout contract:
- Use `AppLayout` as the page shell; do not create a standalone shell for Eventos.
- Desktop content uses a constrained operational width near 1100px with page padding of 24-28px.
- Mobile content is single-column, with touch targets at least 44px high for nav, event cards, filters, and drawer actions.
- Cards use `surface`, `border`, radius 10px, padding 20px, flat shadow, and raised border/shadow on hover or keyboard focus.
- Do not nest cards inside cards. Event card content can use rows/sections but not another framed card.

Event card content order:
1. Status badge and event name.
2. Dates and local metadata.
3. Capacity line and progress/availability indicator.
4. Admin-only edit action, visually secondary to the card content.

Drawer contract:
- Use existing Sheet/Drawer primitive.
- Width: 440-520px desktop; full-width mobile.
- Header: 18px 24px padding, 16px/600 title.
- Body: 24px padding with 16px form gaps.
- Footer: 16px 24px padding, border-top, primary action left-to-right with secondary cancel action.
- Overlay: `rgba(26,22,18,0.28)`.

---

## Component Contracts

| Component | Contract |
|-----------|----------|
| Button | Radius 7px. Primary uses `#1A1612` background with white text. Gold variant is reserved for event-specific emphasis. Secondary/outline remains transparent with border. |
| Badge | Radius 99px, padding 2px 8px, 11px text, semantic color pair from status map. |
| Input/Select/TextArea | Height near 38px, radius 7px, `surface` background, `border`; focus uses `goldMuted` border and `0 0 0 3px goldLight`. |
| FormField | Label 11px/600 uppercase only when acting as section/category label; normal field labels may stay 13-14px for readability. Error copy appears below the control. |
| FilterTabs | Wrapper `surface`, border, radius 8px, padding 3px, gap 4px. Active item uses `#1A1612` background, white text, 600 weight, radius 6px. |
| Card | Radius 10px, padding 20px, `surface`, `border`; hover/focus uses `borderStrong` and raised shadow. |
| EmptyState | No framed outer card unless it is replacing an event-list region. Include icon, specific heading, body with next step, and admin-aware action. |
| Sheet/Drawer | Follows drawer contract above; close control has accessible label and 30-44px target depending on viewport. |

---

## Interaction Contract

### `/eventos` route

- Route is protected and accessible from desktop sidebar and mobile nav.
- List fetch uses TanStack Query with canonical `eventosKeys` and `/api/v1/eventos`.
- Cards support loading, empty, error, filtered-empty, and mutation-pending states.
- Filtering uses status tabs: `Todos`, `Planejamento`, `Abertos`, `Encerrados`, `Realizados`, `Cancelados`.
- The list must remain useful when events have no `local` name, because current API exposes `local_id` and may not resolve location display yet.

### Create/Edit

- `Novo evento` opens a drawer for admin users only.
- Edit action opens the same drawer with existing values.
- Non-admin users do not see create/edit CTAs; if a stale control is reached, backend 403 remains canonical and the UI must show an actionable error.
- Required fields: nome, data_inicio, data_fim, capacidade_maxima, status.
- Optional fields: descricao, local_id when supported by current UI data.
- Submit disables while pending and invalidates `['eventos']` plus detail keys after success.

### EventPill

- EventPill reads the same event query key as EventosPage.
- It displays selected event name, status badge, calendar icon, and dropdown chevron.
- Selection may be client-only and may persist to local storage.
- Dropdown rows show event name, date, status, and selected indicator.
- Empty event list state inside the pill must direct admins to create an event and non-admins to contact an admin.

### Deferred Interactions

- Do not add fake check-in persistence.
- Do not add server-side selected-event preferences.
- Do not add rich revenue/occupancy aggregates unless the backend already exposes them or the phase plan explicitly adds a tested backend contract.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Criar evento |
| Edit CTA | Editar evento |
| Drawer create title | Novo evento |
| Drawer edit title | Editar evento |
| Submit create | Criar evento |
| Submit edit | Salvar alteracoes do evento |
| Empty state heading | Nenhum evento cadastrado |
| Empty state body | Crie o primeiro evento para liberar inscricoes, acomodacoes e acompanhamento financeiro nas proximas etapas. |
| Non-admin empty action | Solicite a um administrador que cadastre o primeiro evento. |
| Filtered empty heading | Nenhum evento neste status |
| Filtered empty body | Altere o filtro ou cadastre um evento com outro status. |
| Error state | Nao foi possivel carregar os eventos. Verifique sua conexao e tente atualizar a lista. |
| Mutation error | Nao foi possivel salvar o evento. Revise os campos destacados e tente novamente. |
| Destructive confirmation | Nao aplicavel nesta fase; nao ha exclusao/cancelamento de evento planejado. |

Form labels:
- Nome do evento
- Descricao
- Data de inicio
- Data de fim
- Local
- Capacidade maxima
- Status

Validation copy:
- Informe o nome do evento.
- Informe a data de inicio.
- Informe a data de fim.
- A data final deve ser igual ou posterior a data inicial.
- Informe uma capacidade maior que zero.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party registries | none | not applicable |

No third-party registries or generated blocks are approved for this phase.

---

## Accessibility And Responsive Requirements

- All icon-only controls need `aria-label` or visible text at mobile sizes.
- Event cards must be keyboard focusable if they behave as buttons.
- Drawer focus must move into the drawer on open and return to the triggering button on close.
- Status must be conveyed through text labels, not color alone.
- Progress bars need text values beside them; do not rely on color-only capacity changes.
- Mobile navigation and drawer controls must meet a minimum 44px touch target.
- Text must not truncate critical event names unless the full value is available via title/accessible label.

---

## Implementation Guardrails For Planner

- Plan a shared `use-eventos.ts` hook before wiring EventosPage or EventPill so query keys do not remain duplicated in `use-inscricoes.ts` and `use-acomodacoes.ts`.
- Plan primitive/token alignment before building the Eventos page: `index.css`, `tailwind.config.js`, `Button`, `Badge`, `Input`, `Select`, `TextArea`, `FormField`, `FilterTabs`, `Card`, `Sheet`, and `EmptyState`.
- Keep changes bounded to shared primitives, AppShell, hooks, and Eventos UI. Do not redesign unrelated pages unless a shared primitive change requires a small compatibility adjustment.
- Preserve Better Auth role semantics: backend is canonical; frontend only hides or disables admin-only affordances.
- Use `StatusEventoEnum` exactly: `rascunho`, `aberto`, `encerrado`, `realizado`, `cancelado`.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-04-26
