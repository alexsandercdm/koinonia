# Phase 03: Gestao Visual Cama-a-Cama - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 03-Gestao Visual Cama-a-Cama
**Areas discussed:** Interaction model, Accommodation hierarchy, Assignment behavior, Visual map, Export strategy, Access roles

---

## Interaction model

| Option | Description | Selected |
|--------|-------------|----------|
| Modal/Sheet from bed card | Mobile-first flow, aligned with technical doc and simpler than drag interactions | ✓ |
| Direct drag-and-drop | Richer interaction, but adds complexity and weaker mobile ergonomics | |
| Hybrid | Supports both modes, but increases scope and UI complexity | |

**User's choice:** `[auto]` Modal/Sheet from bed card
**Notes:** Recommended default because the technical document already describes a sliding assignment panel and the current project constraints emphasize mobile-first operation.

---

## Accommodation hierarchy

| Option | Description | Selected |
|--------|-------------|----------|
| Canonical `local -> quarto -> cama` linked to `eventos.local_id` | Reuses schema already present and avoids duplicating structures per event | ✓ |
| Duplicate map per event | More isolated data, but creates admin overhead and schema drift | |
| Flat bed list | Simplifies storage, but loses the room-based operational view required by the phase | |

**User's choice:** `[auto]` Canonical `local -> quarto -> cama` linked to `eventos.local_id`
**Notes:** Recommended because the database, shared schemas and roadmap already point to hierarchical accommodation as the stable model.

---

## Assignment behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Transactional backend assignment with strict validation | Enforces gender/occupancy rules and protects against race conditions | ✓ |
| UI-first optimistic assignment | Faster feeling UI, but unsafe for concurrent operators | |
| Manual override flow | Gives flexibility, but breaks the strict business rules of the MVP | |

**User's choice:** `[auto]` Transactional backend assignment with strict validation
**Notes:** Recommended because the project-level constraints and technical doc explicitly prioritize strict rules and concurrency safety.

---

## Visual map

| Option | Description | Selected |
|--------|-------------|----------|
| Room-based grid of bed cards | Matches the existing UX direction and is best for quick field operation | ✓ |
| Table/list view first | Easier to build, but weaker spatial understanding for room allocation | |
| Floorplan/custom diagram | Richer visualization, but outside MVP scope and unsupported by current codebase | |

**User's choice:** `[auto]` Room-based grid of bed cards
**Notes:** Recommended because `Card` primitives already exist in the frontend and the technical doc defines cards by room as the target experience.

---

## Export strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Frontend PDF with `jsPDF`/`html2canvas` | Reuses stack already installed in `apps/web` and mirrors the visible map | ✓ |
| Server-side PDF generation | Centralizes output, but adds backend complexity not otherwise needed in this phase | |
| CSV/export only | Easier, but does not meet the explicit PDF/offline requirement | |

**User's choice:** `[auto]` Frontend PDF with `jsPDF`/`html2canvas`
**Notes:** Recommended because the dependency is already present and the requirement is an operator-friendly offline snapshot.

---

## Access roles

| Option | Description | Selected |
|--------|-------------|----------|
| `admin`/`lider` operate, `servo` reads | Preserves operational control while allowing future read-only visibility | ✓ |
| `admin` only | Strong control, but too restrictive for retreat operations | |
| All roles can assign | Fastest operationally, but conflicts with role separation established earlier | |

**User's choice:** `[auto]` `admin`/`lider` operate, `servo` reads
**Notes:** Recommended because it extends the operational role split already captured in phase 2 without broadening write access.

---

## the agent's Discretion

- Final spacing, typography and density of the room/bed cards.
- Exact UX for blocked-bed management.
- Additional non-essential fields included in the PDF layout.

## Deferred Ideas

- Drag-and-drop direct assignment on the map.
- Richer `servo`-specific accommodation views.
- Event-specific printable template customization.
