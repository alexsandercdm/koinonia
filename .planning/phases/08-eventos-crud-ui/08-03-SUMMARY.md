# 08-03 Summary - Shared Event Hooks And Selector

## Goal

Centralize event data fetching and expose an active-event selector in the shared app layout.

## Changes

- Added `apps/web/src/hooks/use-eventos.ts` with list/detail/create/update hooks and shared query keys.
- Replaced duplicate event list hooks in inscricoes and acomodacoes with re-exports.
- Added an `EventPill` to `AppLayout` using the shared event cache and localStorage persistence.
- Added Material Symbols styling for existing outlined icon usage.

## Verification

- `pnpm --filter @koinonia/web type-check`
- `pnpm --filter @koinonia/web build`

## Notes

- The selected event is stored under `koinonia:selectedEventoId`.
- Vite continues to report the existing large chunk warning after production builds.

## Commit

- `bbda464 feat(08-03): share event hooks and selector`
