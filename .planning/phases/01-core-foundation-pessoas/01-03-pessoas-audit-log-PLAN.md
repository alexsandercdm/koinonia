# Plan: Phase 1 - 03 Pessoas Audit Log

**Wave:** 2
**Objective:** Implement a persistent audit log to track sensitive changes to participant health data.
**Requirements:** PES-04

## Tasks

### 1. Define Audit Log Schema
- **<read_first>** 
    - `apps/api/src/db/schema.ts`
- **<action>**
    - Add `audit_logs` table to `db/schema.ts`.
    - Columns: `id` (uuid), `user_id` (uuid, reference to `user.id`), `target_id` (uuid, reference to `pessoas.id`), `action` (e.g., 'UPDATE_HEALTH'), `changes` (jsonb), `created_at` (timestamp).
    - Add relations in `db/schema.ts`.
- **<acceptance_criteria>**
    - `pnpm db:generate` succeeds.
    - `pnpm db:migrate` results in the table creation.

### 2. Implement Audit Log Repository
- **<read_first>** 
    - `apps/api/src/modules/pessoas/repositories/ParticipanteRepository.ts` (as template)
- **<action>**
    - Create `apps/api/src/modules/pessoas/repositories/AuditLogRepository.ts`.
    - Method: `logAction(data: CreateAuditLog)`.
- **<acceptance_criteria>**
    - `AuditLogRepository` is class-based and uses `drizzle-orm`.

### 3. Integrate Logging in Health Update UseCase
- **<read_first>** 
    - `apps/api/src/modules/pessoas/usecases/UpdateParticipanteSaudeUseCase.ts`
- **<action>**
    - Update `UpdateParticipanteSaudeUseCase` constructor to accept `AuditLogRepository`.
    - Capture the state before the update (if necessary) or just log the new values.
    - Call `logAction` after a successful update.
- **<acceptance_criteria>**
    - `UpdateParticipanteSaudeUseCase.execute` calls `auditLogRepo.logAction` once per execution.

### 4. Verify Audit Log Persistence
- **<read_first>** 
    - `apps/api/src/modules/pessoas/usecases/UpdateParticipanteSaudeUseCase.test.ts`
- **<action>**
    - Refactor test to assert that a log entry was created in the `audit_logs` table.
- **<acceptance_criteria>**
    - `pnpm test` for the health update use case passes.

## must_haves
- [ ] `audit_logs` table correctly reflects the schema.
- [ ] Every health edit results in exactly 1 log entry.
- [ ] User ID of the editor is correctly recorded.
