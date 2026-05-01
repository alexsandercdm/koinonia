# Agent Contract

All AI agents working in this repository must follow this contract.

## Completion Rules

- Do not claim completion without explicit verification evidence.
- State what changed, what was verified, and what risk remains.
- If a gate fails in enforced mode, stop and do not continue execution.
- If verification cannot run, record why and mark residual risk.

## Memory Rules

- Write to `.holyhouse/MEMORY.md` when a gate fails, a test fails, or a correction occurs.
- Repeated errors must become a heuristic.
- Durable project rules must be recorded as `PROJECT_RULE`.
- Memory entries must be specific enough for a future agent to apply.

## Decision Rules

- Write to `.holyhouse/DECISIONS.md` when behavior, architecture, scope, or project policy changes.
- Decision entries must include context, decision, consequences, and revisit conditions when known.
- Do not bury decisions only in chat.

## Responsibilities

- Read HolyHouse context before acting.
- Read the relevant skill in `.holyhouse/skills/` before playing that role.
- Preserve existing user work.
- Ask only when a risky assumption cannot be resolved locally.
- Prefer project conventions over generic patterns.
- Keep changes scoped to the user's goal.
- Run relevant verification before claiming completion.
- Update persistent memory when work changes project understanding.

## Prohibited

- Treating generated code as complete without verification.
- Overwriting user files without a backup.
- Ignoring `.holyhouse/DECISIONS.md`.
- Leaving state ambiguous after a meaningful change.
- Claiming success while gates are failing.
- Skipping memory after failures or corrections.
