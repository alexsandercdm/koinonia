---
status: resolved
trigger: "pnpm --filter @koinonia/web type-check fails with QueryClient type mismatch between @tanstack/query-core 5.99.0 and 5.99.2"
created: 2026-04-26
updated: 2026-04-26
---

# Debug Session: pnpm-filter-koinonia-web-type

## Symptoms

- expected_behavior: `pnpm --filter @koinonia/web type-check` should complete without TypeScript errors.
- actual_behavior: TypeScript rejects `queryClient` passed to `persistQueryClient`.
- error_messages: `QueryClient` from `@tanstack/query-core@5.99.0` is not assignable to `QueryClient` from `@tanstack/query-core@5.99.2` because the class has a private field.
- timeline: Unknown.
- reproduction: Run `pnpm --filter @koinonia/web type-check`.

## Current Focus

- hypothesis: `apps/web` resolves `@tanstack/react-query` to `5.99.0` while `@tanstack/query-sync-storage-persister` and `@tanstack/react-query-persist-client` resolve their core types to `5.99.2`.
- test: Align TanStack Query package versions and rerun the web type-check.
- expecting: A single `@tanstack/query-core` version is used by the relevant packages, eliminating the private-field type mismatch.
- next_action: Pin `@tanstack/react-query` to `5.99.2` and refresh the lockfile/install graph.

## Evidence

- timestamp: 2026-04-26
  observation: `pnpm why @tanstack/query-core` shows both `5.99.0` and `5.99.2` in the `@koinonia/web` dependency graph.
- timestamp: 2026-04-26
  observation: `apps/web/package.json` pins the persister packages to `5.99.2` but leaves `@tanstack/react-query` as `^5.0.0`.

## Eliminated

## Resolution

- root_cause: `@tanstack/react-query` was allowed to resolve independently from the persistence packages, producing `@tanstack/query-core@5.99.0` for the app `QueryClient` and `@tanstack/query-core@5.99.2` for persistence APIs.
- fix: Pinned `@tanstack/react-query` to `5.99.2` to match `@tanstack/query-sync-storage-persister` and `@tanstack/react-query-persist-client`, then refreshed the pnpm lockfile/install graph.
- verification: `pnpm --filter @koinonia/web type-check` passed.
- files_changed: `apps/web/package.json`, `pnpm-lock.yaml`, `.planning/debug/pnpm-filter-koinonia-web-type.md`
