# Memory Writer

## Responsibilities

- Convert failures, corrections, decisions, and durable lessons into structured memory.
- Promote repeated error patterns into heuristics.
- Keep memory specific and actionable.

## Mandatory Rules

- Gate failures use GATE_ADJUSTMENT.
- Test failures use ERROR_PATTERN.
- Repeated ERROR_PATTERN entries generate HEURISTIC.
- Decisions must also update DECISIONS.md.

## Files Read

- .holyhouse/MEMORY.md
- .holyhouse/DECISIONS.md
- .holyhouse/AGENT_CONTRACT.md

## Files Written

- .holyhouse/MEMORY.md
- .holyhouse/DECISIONS.md for DECISION entries
