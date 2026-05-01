---
status: resolved
trigger: "pnpm dev fails with esbuild host version 0.27.7 does not match binary version 0.21.5"
created: 2026-04-26
updated: 2026-04-26
---

# Debug Session: pnpm-dev-esbuild-mismatch

## Symptoms

- expected_behavior: `pnpm dev` should start Turborepo dev tasks for `@koinonia/api`, `@koinonia/shared`, and `@koinonia/web`.
- actual_behavior: `@koinonia/shared` and `@koinonia/api` fail immediately before the dev servers are usable.
- error_messages: `Cannot start service: Host version "0.27.7" does not match binary version "0.21.5"` followed by `Error: The service was stopped`.
- timeline: Unknown from user report.
- reproduction: Run `pnpm dev` from `/Users/alexsandercdm/Projetos/koinonia`.

## Current Focus

- hypothesis: Resolved. Local `node_modules` contained a stale copied esbuild binary for `esbuild@0.27.7`; reinstalling from the lockfile reran esbuild postinstall and restored the matching `0.27.7` binary.
- test: Verified direct esbuild binary version, `tsup` shared build, `tsx` startup, Vite web build, and a bounded `pnpm dev` smoke test.
- expecting: `pnpm dev` should start shared, web, and API dev tasks without `Host version "0.27.7" does not match binary version "0.21.5"`.
- next_action: none
- reasoning_checkpoint:
- tdd_checkpoint:

## Evidence

- timestamp: 2026-04-26T11:xx:xx-03:00
  observation: Lockfile legitimately resolves multiple `esbuild` versions. `tsx@4.21.0` and `tsup@8.5.1` use `esbuild@0.27.7`; `vite@5.4.21` uses `esbuild@0.21.5`.
  implication: Multiple esbuild versions in the lockfile are expected for this dependency graph and are not by themselves the bug.
- timestamp: 2026-04-26T11:xx:xx-03:00
  observation: `require('./node_modules/.pnpm/esbuild@0.27.7/node_modules/esbuild').version` returns `0.27.7`, but `node_modules/.pnpm/esbuild@0.27.7/node_modules/esbuild/bin/esbuild --version` returns `0.21.5`.
  implication: The installed `esbuild@0.27.7` JS host and package-level native binary are out of sync locally, directly matching the reported error.
- timestamp: 2026-04-26T11:xx:xx-03:00
  observation: `node_modules/.pnpm/@esbuild+darwin-arm64@0.27.7/node_modules/@esbuild/darwin-arm64/bin/esbuild --version` returns `0.27.7`.
  implication: The correct platform binary exists in the install; the stale package-level copied binary is the broken artifact.
- timestamp: 2026-04-26T11:xx:xx-03:00
  observation: `pnpm rebuild esbuild` fails with `ERR_PNPM_UNEXPECTED_STORE`: existing `node_modules` is linked from `/Users/alexsandercdm/Library/pnpm/store/v3`, while current pnpm wants `/Users/alexsandercdm/Projetos/koinonia/.pnpm-store/v3`.
  implication: The dependency tree cannot be repaired by rebuild in its current linked state; it needs a pnpm reinstall/relink using the current store.
- timestamp: 2026-04-26T11:xx:xx-03:00
  observation: Initial sandboxed `pnpm install --force --prefer-offline` failed with `ENOTFOUND registry.npmjs.org` after recreating `node_modules`; rerunning `pnpm install --force` with network access completed and ran `esbuild@0.27.7` postinstall.
  implication: Reinstall from lockfile was the required repair; network was needed because not all tarballs were available in the active store.
- timestamp: 2026-04-26T11:xx:xx-03:00
  observation: After reinstall, `node_modules/.pnpm/esbuild@0.27.7/node_modules/esbuild/bin/esbuild --version` returns `0.27.7`; `esbuild@0.21.5` still returns `0.21.5` for Vite's isolated dependency.
  implication: The host/binary mismatch is repaired while preserving expected multi-version dependency isolation.
- timestamp: 2026-04-26T11:xx:xx-03:00
  observation: `pnpm --filter @koinonia/shared build` completed successfully through `tsup`; only pre-existing package export condition warnings appeared.
  implication: The shared package path that previously failed at esbuild service startup now works.
- timestamp: 2026-04-26T11:xx:xx-03:00
  observation: `pnpm --filter @koinonia/api exec tsx --version` returned `tsx v4.21.0` and `node v25.2.1`.
  implication: `tsx` can initialize against the repaired esbuild dependency.
- timestamp: 2026-04-26T11:xx:xx-03:00
  observation: `pnpm --filter @koinonia/web build` completed successfully through `tsc && vite build`; Vite emitted only the existing large chunk warning.
  implication: Vite's esbuild dependency remains functional after reinstall.
- timestamp: 2026-04-26T11:xx:xx-03:00
  observation: Bounded `pnpm dev` smoke test started `@koinonia/shared` watch, Vite on `http://localhost:3000/`, and API on `http://localhost:3001`; no esbuild host/binary mismatch occurred before intentional termination.
  implication: The reported dev startup failure is fixed.

## Eliminated

- Dependency declaration conflict as the primary cause: the lockfile allows multiple esbuild versions under different dependents, and pnpm should isolate them.
- Missing platform package as the primary cause: `@esbuild/darwin-arm64@0.27.7` is installed and its binary reports the expected version.

## Resolution

- root_cause: Local dependency install corruption: the `esbuild@0.27.7` JavaScript host package used by `tsx`/`tsup` had a stale package-level native binary copied from `esbuild@0.21.5`, producing `Host version "0.27.7" does not match binary version "0.21.5"`.
- fix: Recreated `node_modules` from `pnpm-lock.yaml` with `pnpm install --force`, allowing `esbuild@0.27.7` postinstall to restore the matching native binary.
- verification: `esbuild@0.27.7` binary reports `0.27.7`; `pnpm --filter @koinonia/shared build` passes; `pnpm --filter @koinonia/api exec tsx --version` passes; `pnpm --filter @koinonia/web build` passes; bounded `pnpm dev` starts shared, web, and API tasks without the mismatch.
- files_changed: `.planning/debug/pnpm-dev-esbuild-mismatch.md`; generated dependency artifacts under `node_modules` were relinked/reinstalled.
