---
plan: 03-02
status: complete
---

# `03-02` Summary

## What was built
Camada operacional do backend de acomodações com mapa por evento, busca de inscrições sem cama, atribuição transacional e liberação de cama. As regras críticas ficaram centralizadas no backend: vínculo obrigatório do evento com `local_id` para operar o mapa, compatibilidade de gênero por quarto, bloqueio de camas indisponíveis e proteção contra dupla atribuição concorrente.

## Key Files
### Created
- `apps/api/src/modules/acomodacoes/controllers/AcomodacaoOperationsController.ts`
- `apps/api/src/modules/acomodacoes/usecases/ListMapaAcomodacaoUseCase.ts`
- `apps/api/src/modules/acomodacoes/usecases/ListInscricoesDisponiveisUseCase.ts`
- `apps/api/src/modules/acomodacoes/usecases/AssignCamaUseCase.ts`
- `apps/api/src/modules/acomodacoes/usecases/ReleaseCamaUseCase.ts`
- `apps/api/src/tests/acomodacoes-operacoes.e2e.test.ts`

### Modified
- `apps/api/src/modules/acomodacoes/repositories/AcomodacaoRepository.ts`
- `apps/api/src/modules/acomodacoes/routes/acomodacoes.ts`
- `packages/shared/src/index.ts`

## Verification
- [x] `./node_modules/.bin/tsc -p apps/api/tsconfig.json --noEmit`
- [x] `node --import tsx src/scripts/test-migrate.ts` em `apps/api`
- [x] `./node_modules/.bin/vitest run src/tests/acomodacoes-operacoes.e2e.test.ts`

## Self-Check
- [x] `GET /api/v1/eventos/:eventoId/mapa-acomodacao` retorna o shape compartilhado do mapa
- [x] `GET /api/v1/eventos/:eventoId/inscricoes-sem-cama` filtra apenas inscrições elegíveis
- [x] `POST` e `DELETE /api/v1/acomodacoes/camas/:camaId/atribuir` preservam histórico financeiro
- [x] Concorrência para a mesma cama coberta por teste E2E
- [x] Frontend da fase 3 permaneceu pendente
