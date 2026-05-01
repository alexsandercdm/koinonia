# 08-01 Summary - Backend Event List Contract

## Goal

Expose an event list contract that includes registration capacity data for the frontend Eventos UI.

## Changes

- Added `EventoListItemSchema` and `EventoListItem` to `packages/shared`.
- Added `EventoRepository.listWithStats()` with non-cancelled registration counts.
- Added `ListEventosUseCase` to calculate `ocupacao_percentual`.
- Updated `EventoController.list()` to use the new use case.
- Adjusted event and payment route schemas to accept date-only strings where required.
- Added focused API tests for capacity percentage and date-only update behavior.

## Verification

- `pnpm --filter @koinonia/api test -- --run ListEventosUseCase`
- `pnpm --filter @koinonia/api test -- --run UpdateEventoUseCase`
- `pnpm --filter @koinonia/api type-check`

## Commit

- `cba87c5 feat(08-01): add event capacity list contract`
