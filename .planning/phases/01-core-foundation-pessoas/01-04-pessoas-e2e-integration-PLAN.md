# Plan: Phase 1 - 04 Pessoas E2E Integration

**Wave:** 3
**Objective:** Final verification that all participant-related requirements (PES-01 to PES-05) are fully functional and integrated with Auth.
**Requirements:** PES-01, PES-02, PES-03, PES-05

## Tasks

### 1. Unified Pessoas E2E Suite
- **<read_first>** 
    - `apps/api/src/tests/auth.test.ts`
    - `apps/api/src/modules/pessoas/usecases/`
- **<action>**
    - Create `apps/api/src/tests/pessoas-e2e.test.ts`.
    - Test: `PES-01` - Create participant (w/ Emergency Contact).
    - Test: `PES-02` - Search/List (Verify `q` parameter works).
    - Test: `PES-03` - Get History (Verify empty history initially).
    - Test: `PES-05` - Soft-delete (Verify deleted record is skipped in `list`).
- **<acceptance_criteria>**
    - All tests in `pessoas-e2e.test.ts` pass.

### 2. Verify Soft-delete Logic in List
- **<read_first>** 
    - `apps/api/src/modules/pessoas/usecases/ListParticipantesUseCase.ts`
- **<action>**
    - Ensure `ListParticipantesUseCase` includes `where isNull(pessoas.deleted_at)`.
- **<acceptance_criteria>**
    - `grep -r "isNull(pessoas.deleted_at)" apps/api/src/modules/pessoas/usecases/ListParticipantesUseCase.ts` returns the line.

### 3. Verify Histórico UseCase
- **<read_first>** 
    - `apps/api/src/modules/pessoas/usecases/GetParticipanteHistoricoUseCase.ts`
- **<action>**
    - Ensure it correctly queries `inscricoes` and `eventos` tables.
- **<acceptance_criteria>**
    - `pnpm test` for the historico use case passes with real DB.

## must_haves
- [ ] PES-01 to PES-05 requirements pass unified E2E suite.
- [ ] Soft-delete status correctly honored across the system.
- [ ] History reflects past enrollments.
