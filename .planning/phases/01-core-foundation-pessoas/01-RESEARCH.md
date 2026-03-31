# Research: Phase 1 - Core Foundation & Pessoas

## 1. Better Auth Integration
- **Status:** Configured in `apps/api/src/config/auth.ts` using Drizzle adapter.
- **Dependency:** Root `package.json` contains `better-auth` and `@better-auth/drizzle-adapter`.
- **Gaps:** 
    - No real E2E tests for login/logout (only mocks in `auth.test.ts`).
    - Need to verify if `BETTER_AUTH_SECRET` and other env vars are correctly set in the test environment.

## 2. RBAC (Role-Based Access Control)
- **Status:** Middleware already exists in `apps/api/src/middleware/auth.ts`.
- **Implementation:** 
    - `authMiddleware`: Extracts Bearer token, validates with `auth.api.getSession`, and attaches user info to `request`.
    - `requireRole(role)`: Higher-order function to enforce specific roles.
- **Application:** Not applied to any `pessoas` routes yet.
- **Recommendation:** Admin/Lider roles for write operations, Servo for read-only (based on specific requirements for "Pessoas").

## 3. Audit Log (PES-04)
- **Status:** Not implemented.
- **Requirement:** "Editar dados de saúde (alergias, medicamentos) com registro de log."
- **Proposal:** 
    - Create a new `audit_logs` table in `db/schema.ts`.
    - Columns: `id`, `user_id` (who did it), `target_id` (whose record), `action` (e.g., 'UPDATE_HEALTH'), `changes` (JSONB showing before/after), `created_at`.
    - Inject `AuditLogRepository` into `UpdateParticipanteSaudeUseCase`.

## 4. Pessoas Module (Modular Monolith)
- **Status:** Use cases exist but need E2E validation in the modular structure.
- **Gaps:** 
    - `UpdateParticipanteSaudeUseCase` needs to trigger the audit log.
    - Soft-delete is implemented in `DeleteParticipanteUseCase` but needs to be verified in `ListParticipantesUseCase` (ensure deleted records are filtered out).

## Next Steps
1. Draft `PLAN-01-Auth-E2E-Tests`.
2. Draft `PLAN-02-RBAC-Application`.
3. Draft `PLAN-03-Audit-Log-Setup`.
4. Draft `PLAN-04-Pessoas-Final-Validation`.
