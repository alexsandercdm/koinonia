# Phase 07 Discussion Log

**Date:** 2026-04-26
**Mode:** auto (triggered by `$gsd-next`)
**Phase:** 07 — Participantes CRUD UI

## Areas Discussed

### List experience and navigation
- Question: How should the operational participant flow live in the UI?
- Selected: Keep `/participantes` as the main operational screen and upgrade it in place.
- Rationale: Reuses existing route, dashboard navigation, and visual shell from phase 05.

### Form structure
- Question: How should create/edit happen without fragmenting the workflow?
- Selected: Use one responsive sheet/drawer with three tabs: Dados, Saude, Emergencia.
- Rationale: Matches the success criteria and keeps the user in the list context.

### Data synchronization and offline behavior
- Question: How should search feel instant while preserving backend sync?
- Selected: Search locally over cached data first, then sync online where useful.
- Rationale: Aligns with phase success criteria and TanStack Query persistence introduced in phase 06.

### Backend integration boundary
- Question: What if the current backend does not fully support complete edit flows?
- Selected: Allow minimal backend changes strictly necessary to complete participant CRUD UI.
- Rationale: This is not scope creep; it is enabling work inside the participants domain already scoped to this phase.

### Permissions and destructive actions
- Question: How should write permissions and soft-delete appear in the UI?
- Selected: Surface role restrictions clearly and require explicit confirmation for inactivation.
- Rationale: Keeps frontend behavior aligned with current backend RBAC and soft-delete semantics.

## Prior Context Carried Forward

- Better Auth remains the canonical auth flow.
- Mobile-first operational UI stays the baseline.
- Reuse existing UI primitives and TanStack Query patterns before inventing new patterns.
- Participants is the first functional CRUD module after the infrastructure foundation of phase 06.

## Deferred Ideas

- Dedicated full-page participant detail route.
- Role-specific frontends or dashboards.
- Import/export capabilities for participant records.

## Notes for Planning

- Current `ParticipantsPage` expects an array, but the backend list returns a paginated object.
- Existing backend supports create, list, get by id, health update, history, and soft-delete; planning should verify whether a broader update endpoint is needed for full edit UX.
- The planner should preserve the architecture boundary and keep any backend additions inside the `pessoas` module.
