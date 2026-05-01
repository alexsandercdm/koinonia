# GSD-2 Adapter

HolyHouse Harness does not replace or depend on GSD-2. This adapter is guidance only.

## Boundary

- HolyHouse owns human governance, memory review, quality gates, and forensic analysis.
- GSD-2 may own its own planning and execution state in `.gsd/`.
- HolyHouse does not execute GSD commands.
- HolyHouse does not write GSD files.
- Treat this adapter as a manual operating convention, not an integration.

## Workflow

1. Run your GSD-2 workflow.
2. Run `holyhouse-harness gate` after meaningful agent execution.
3. Use `holyhouse-harness memory` to record durable lessons after execution.
4. Run `holyhouse-harness forensics` when intent, memory, or execution state may have drifted.
