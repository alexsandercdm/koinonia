# Plan: Phase 1 - 01 Auth E2E Tests

**Wave:** 1
**Objective:** Replace mocks with real E2E tests for Better Auth, ensuring login/logout and session persistence work as expected.
**Requirements:** AUTH-01

## Tasks

### 1. Configure Test Auth Environment
- **<read_first>** 
    - `apps/api/src/config/auth.ts`
    - `apps/api/src/tests/setup.ts`
- **<action>**
    - Add `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` to test environment variables.
    - Ensure `db:test:migrate` includes the auth schema.
- **<acceptance_criteria>**
    - `pnpm test` runs without environment errors.

### 2. Implement Real Auth E2E Tests
- **<read_first>** 
    - `apps/api/src/tests/auth.test.ts`
    - `apps/api/src/routes/auth.ts`
- **<action>**
    - Refactor `apps/api/src/tests/auth.test.ts` to use a real Fastify instance and real database.
    - Test: `POST /api/v1/auth/sign-up` with email/password.
    - Test: `POST /api/v1/auth/sign-in` and verify response contains session token.
    - Test: `POST /api/v1/auth/sign-out` and verify session is invalidated.
- **<acceptance_criteria>**
    - `grep -r "auth.api.getSession" apps/api/src/tests/auth.test.ts` (Verify no mocks).
    - `vitest apps/api/src/tests/auth.test.ts` passes with green results.

### 3. Verify Session Persistence
- **<read_first>** 
    - `apps/api/src/db/auth-schema.ts`
- **<action>**
    - Assert that sessions are correctly written to the `session` table after sign-in.
    - Assert that user record is created in the `user` table after sign-up.
- **<acceptance_criteria>**
    - Database query returns exactly 1 row for the test session.

## must_haves
- [ ] No more mocks in `auth.test.ts`.
- [ ] Sign-up, Sign-in, and Sign-out verified against real DB.
- [ ] 100% pass rate in `auth.test.ts`.
