# Plan 06-02 Summary

## Completed Tasks

### Task 1: Add GET /eventos/:id/inscricoes route (INFRA-03)
- Added route binding in `apps/api/src/modules/inscricoes/routes/inscricoes.ts`:
  - `fastify.get('/eventos/:id/inscricoes', { ...requireAuth }, inscricaoController.listByEvento.bind(inscricaoController))`
- Added `listByEvento` method in `apps/api/src/modules/inscricoes/controllers/InscricaoController.ts`:
  - Delegates to `this.repository.findByEventoId(id)`
  - Returns array of inscrições with joined pessoa data
  - Empty array is valid response for unknown evento_id

### Task 2: Fix shared StatusEventoEnum (INFRA-04a)
- Added `'cancelado'` as 5th value to `StatusEventoEnum` in `packages/shared/src/index.ts`
- Aligns shared contract with Fastify route schema (which already accepted 'cancelado')

### Task 3: Fix valor_total/valor_pago coercion (INFRA-04b)
- Changed `z.number()` to `z.coerce.number()` for both fields in `InscricaoSchema`
- Prevents NaN errors when node-postgres returns numeric columns as strings

## Artifacts Modified
- `apps/api/src/modules/inscricoes/routes/inscricoes.ts` — new route binding
- `apps/api/src/modules/inscricoes/controllers/InscricaoController.ts` — listByEvento method
- `packages/shared/src/index.ts` — StatusEventoEnum + valor coercion

## Verification
- Route bound at GET /eventos/:id/inscricoes with requireAuth
- Controller delegates to repository.findByEventoId
- StatusEventoEnum has 5 values including 'cancelado'
- valor_total and valor_pago use z.coerce.number().min(0)

## Commit
`0eb9917` — feat(06-02): add GET /eventos/:id/inscricoes, fix StatusEventoEnum and valor coercion
