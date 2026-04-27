# 08-04 Summary - Eventos CRUD Screen

## Goal

Deliver the protected Eventos management UI with read access for authenticated users and create/edit access for admins.

## Changes

- Added the `/eventos` route behind `ProtectedRoute`.
- Added the Eventos sidebar entry to `AppLayout`.
- Added `EventosPage` with search, status filters, loading/error/empty states, and admin-only actions.
- Added `EventoCard`, `EventoForm`, and event status helpers.
- Wired create and update submissions through the shared event hooks.

## Verification

- `pnpm --filter @koinonia/web type-check`
- `pnpm --filter @koinonia/web build`

## Notes

- `canWrite` is restricted to `user?.role === 'admin'`.
- Vite continues to report the existing large chunk warning after production builds.

## Commit

- `8346ee8 feat(08-04): add events CRUD screen`
