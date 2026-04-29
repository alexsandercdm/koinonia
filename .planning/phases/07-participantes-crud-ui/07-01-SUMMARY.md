---
phase: 7
plan: 07-01
subsystem: api-participantes
tags: [backend, participantes, audit, rbac]
key-files:
  created:
    - apps/api/src/modules/pessoas/usecases/UpdateParticipanteUseCase.ts
    - apps/api/src/modules/pessoas/usecases/UpdateParticipanteUseCase.test.ts
  modified:
    - apps/api/src/modules/pessoas/controllers/ParticipanteController.ts
    - apps/api/src/modules/pessoas/routes/participantes.ts
requirements-completed: [UI-PES-02, UI-PES-04]
completed: 2026-04-26
---

# Phase 7 Plan 07-01: Backend participant full-update contract Summary

Implemented an audited full participant update contract at `PATCH /api/v1/participantes/:id`, guarded by `requireRole('lider')`, with duplicate email/phone protection and soft-delete safety.

## Tasks

| Task | Status | Notes |
|------|--------|-------|
| 07-01-T1 | Complete | Added `UpdateParticipanteUseCase` with shared participant fields, duplicate checks, `isNull(pessoas.deleted_at)`, and `UPDATE_PARTICIPANT` audit logging. |
| 07-01-T2 | Complete | Wired controller and route for full participant PATCH before the focused health route. |
| 07-01-T3 | Complete | Added E2E integration coverage for success, audit log, duplicate email, servo denial, and soft-deleted participant update denial. |

## Verification

- PASS: `pnpm --filter @koinonia/api type-check`
- PASS: `pnpm --filter @koinonia/api test -- --run UpdateParticipanteUseCase`

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

The backend endpoint exists, is role-gated, preserves soft-delete semantics, audits sensitive updates, and is covered by targeted integration tests.
