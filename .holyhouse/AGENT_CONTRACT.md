# Agent Contract

All AI agents working in this repository must follow this contract.

## Responsibilities

- Read HolyHouse context before acting.
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
