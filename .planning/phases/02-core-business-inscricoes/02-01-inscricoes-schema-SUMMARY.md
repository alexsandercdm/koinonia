---
plan: 02-01-inscricoes-schema
status: complete
---

# `02-01-inscricoes-schema` Summary

## What was built
Consolidated the backend foundation for Phase 02 by aligning the GSD context with the actual implementation state, hardening the `inscricoes` domain rules, and completing event management with update support. The API now supports updating events and replacing pricing configurations by role, blocks duplicate registrations for the same participant/event pair, protects payment and cancellation flows from invalid state transitions, and keeps `registrado_por` as the canonical audit field for payments and refunds. The schema was also aligned with unique indexes for pricing configuration per role and one registration per participant/event.

## Key Files
### Created
- `.planning/phases/02-core-business-inscricoes/02-CONTEXT.md`
- `apps/api/src/modules/inscricoes/usecases/UpdateEventoUseCase.ts`
- `apps/api/src/modules/inscricoes/usecases/UpdateEventoUseCase.test.ts`
- `apps/api/src/modules/inscricoes/usecases/CancelInscricaoUseCase.test.ts`
- `apps/api/src/modules/inscricoes/usecases/GetInadimplentesUseCase.test.ts`
- `apps/api/drizzle/0004_glorious_zuras.sql`

### Modified
- `apps/api/src/db/schema.ts`
- `apps/api/src/modules/inscricoes/routes/inscricoes.ts`
- `apps/api/src/modules/inscricoes/controllers/EventoController.ts`
- `apps/api/src/modules/inscricoes/repositories/EventoRepository.ts`
- `apps/api/src/modules/inscricoes/repositories/InscricaoRepository.ts`
- `apps/api/src/modules/inscricoes/usecases/CreateEventoUseCase.ts`
- `apps/api/src/modules/inscricoes/usecases/RegisterInscricaoUseCase.ts`
- `apps/api/src/modules/inscricoes/usecases/RecordPagamentoUseCase.ts`
- `apps/api/src/modules/inscricoes/usecases/CancelInscricaoUseCase.ts`
- `apps/api/src/modules/inscricoes/usecases/ReplaceParticipanteUseCase.ts`
- `apps/api/src/tests/inscricoes-e2e.test.ts`

## Self-Check
- [x] Core backend requirements for Phase 02 implemented
- [x] Event update and pricing replacement covered
- [x] Critical business rules locked with unit tests
- [ ] Full E2E with real PostgreSQL validated
- [x] SUMMARY.md created in plan directory
