# Plan: Phase 1 - 02 RBAC Application

**Wave:** 1
**Objective:** Secure `pessoas` (participants) routes using the existing `authMiddleware` and `requireRole` middleware.
**Requirements:** AUTH-02

## Tasks

### 1. Protect Pessoas Search/List (Servo/Lider/Admin)
- **<read_first>** 
    - `apps/api/src/modules/pessoas/routes/participantes.ts`
    - `apps/api/src/middleware/auth.ts`
- **<action>**
    - Apply `authMiddleware` to `GET /participantes`.
    - Apply `authMiddleware` to `GET /participantes/:id`.
    - Apply `authMiddleware` to `GET /participantes/:id/historico`.
- **<acceptance_criteria>**
    - `curl -I /api/v1/participantes` returns 401 without Bearer token.
    - `curl -H "Authorization: Bearer <valid_token>" /api/v1/participantes` returns 200.

### 2. Restrict Sensitive Write Operations (Lider/Admin)
- **<read_first>** 
    - `apps/api/src/modules/pessoas/routes/participantes.ts`
- **<action>**
    - Apply `requireRole('lider')` to `POST /participantes`.
    - Apply `requireRole('lider')` to `PATCH /participantes/:id/saude`.
    - Apply `requireRole('admin')` to `DELETE /participantes/:id`.
- **<acceptance_criteria>**
    - `POST /participantes` with 'servo' role token returns 403 Forbidden.
    - `POST /participantes` with 'lider' role token returns 201 Created.
    - `DELETE /participantes/:id` with 'lider' role token returns 403 Forbidden (requires admin).

### 3. Implement RBAC E2E Integration Test
- **<read_first>** 
    - `apps/api/src/tests/auth.test.ts` (as template)
- **<action>**
    - Create `apps/api/src/tests/rbac.test.ts`.
    - Test: Accessing protected routes with different roles.
    - Test: Verify that 'admin' can access all routes.
- **<acceptance_criteria>**
    - `vitest apps/api/src/tests/rbac.test.ts` passes.

## must_haves
- [ ] No unauthorized access to `pessoas` routes.
- [ ] Role hierarchy enforced ('admin' covers all roles).
- [ ] E2E tests confirming RBAC behavior.
