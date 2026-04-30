<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0
Bump type: MAJOR (initial ratification — all placeholders resolved; first concrete governance established)

Modified principles:
  [PRINCIPLE_1_NAME] → I. Bootstrap-First Styling
  [PRINCIPLE_2_NAME] → II. Stitch Design Blueprint
  [PRINCIPLE_3_NAME] → III. Angular Standalone Architecture
  [PRINCIPLE_4_NAME] → IV. Separation of Concerns
  [PRINCIPLE_5_NAME] → V. Scope-Lock & Consultation Rule

Added sections:
  - "Operational Constraints" (merged into Principle V)
  - "Technology Stack" (new Section 2)
  - "Development Workflow" (new Section 3)

Removed sections: none

Templates requiring updates:
  ✅ .specify/templates/plan-template.md  — Constitution Check updated
  ✅ .specify/templates/spec-template.md  — Assumptions section updated
  ✅ .specify/templates/tasks-template.md — Path Conventions updated

Follow-up TODOs:
  TODO(RATIFICATION_DATE): Exact project start date unknown — set to 2026-04-30 (today, first constitutional recording)
-->

# Lumina Constitution

## Core Principles

### I. Bootstrap-First Styling

All UI styling MUST use **Bootstrap 5** as the primary framework. Custom styles MUST
strictly follow the Lumina theme defined in `design.md`:

- **Dark Navy Gradients**: `#001A33` → `#002D5B` (sidebar, card headers, table heads)
- **Cyan accent**: `#41B3E3` (primary buttons, active states, links, borders)
- Custom CSS classes MUST follow the Lumina naming convention:
  `.btn-lumina-*`, `.btn-*-action`, `.status-*`, `.auth-*`
- Global CSS tokens MUST live in `src/styles.css` under `:root { … }`
- Component-scoped overrides MUST reside in each component's own `.css` file

**Rationale**: A single, well-defined design system prevents visual drift, reduces
review overhead, and ensures every screen is immediately recognizable as "Lumina."

---

### II. Stitch Design Blueprint

Before implementing any feature or page, the implementer MUST:

1. Open the `stitch-designs/` folder at the project root.
2. Locate the subfolder matching the current task
   (e.g., `stitch-designs/department-management/`).
3. Use the HTML, CSS, and logic provided in those design files as the
   authoritative blueprint for the implementation.

No feature MUST ship without a corresponding Stitch design reference being consulted
first. If a subfolder does not yet exist, one MUST be created and populated before
implementation begins, or the gap MUST be flagged as a blocker.

**Rationale**: Stitch designs encode the agreed visual contract between designer and
developer. Bypassing them leads to visual inconsistency that is costly to fix later.

---

### III. Angular Standalone Architecture

The project MUST use **Angular Standalone Components** exclusively. Deviation from the
standalone architecture requires explicit written approval from the project owner.

File-structure rules:

- New features MUST be created under `src/app/features/<feature-name>/`
  (e.g., `src/app/features/department-management/`)
- Services and API-call logic MUST live under `src/app/core/services/`
- TypeScript interfaces and model types MUST live under `src/app/core/models/`
- No `NgModule`-based modules MUST be introduced

**Rationale**: The standalone model keeps components self-contained, simplifies lazy
loading, and aligns with the Angular team's recommended direction for new projects.

---

### IV. Separation of Concerns

Every layer of the application MUST have a single, clearly defined responsibility:

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Features** | Component logic + HTML templates | `src/app/features/` |
| **Core / Services** | API calls and business logic | `src/app/core/services/` |
| **Models** | TypeScript interfaces and types | `src/app/core/models/` |

Cross-layer dependencies MUST flow downward only (Feature → Service → Model).
A component MUST NOT contain raw HTTP calls; all HTTP logic MUST be delegated to a
service. A service MUST NOT import or reference component classes.

**Rationale**: Clean separation makes each layer independently testable and replaceable
without ripple effects across the codebase.

---

### V. Scope-Lock & Consultation Rule

**Scope-Lock**: Every implementation task MUST be strictly limited to the requested
feature or fix. Refactoring or modifying existing, unrelated files is PROHIBITED
unless explicitly instructed by the project owner.

**Consultation Rule**: If the implementer encounters any of the following situations,
they MUST stop and seek written approval before proceeding:

- A conflict between a new requirement and the existing architecture.
- A perceived need to change an existing file that is outside the scope of the
  current task.
- Ambiguity about whether a change would violate Principle III or IV above.

This principle is NON-NEGOTIABLE. Unsolicited refactoring has caused alignment
regressions in the past and MUST be prevented.

---

## Technology Stack

| Concern | Choice | Constraint |
|---------|--------|-----------|
| Frontend framework | Angular (Standalone Components) | No NgModule |
| CSS framework | Bootstrap 5 | MUST be primary; custom classes extend it |
| Icon library | Bootstrap Icons (`bi bi-*`) | CDN or npm |
| Design reference | Stitch Designs folder | MUST be consulted before implementation |
| Design tokens | `design.md` | Single source of truth for colors & components |
| API communication | Angular `HttpClient` via Core services | No raw HTTP in components |
| Models / Types | TypeScript interfaces | Under `src/app/core/models/` |

---

## Development Workflow

1. **Check the Stitch design** for the target feature before writing any code.
2. **Confirm alignment** with `design.md` for every color, gradient, and component class.
3. **Create the feature folder** under `src/app/features/<feature-name>/` if new.
4. **Create / update service** under `src/app/core/services/` for all API logic.
5. **Define / update model interfaces** under `src/app/core/models/`.
6. **Implement the component** template and logic, referencing the Stitch blueprint.
7. **Self-review** against the Constitution Check gate in `plan.md` before marking
   any task complete.
8. **Request review** — do NOT merge until a peer or the project owner has signed off.

---

## Governance

This Constitution supersedes all informal conventions and prior verbal agreements.
All contributors (human and AI agent alike) MUST comply with every principle above.

**Amendment Procedure**:
- Amendments MUST be proposed in writing with clear rationale.
- Any amendment that changes or removes an existing principle triggers a MAJOR
  version bump.
- Adding a new principle or section triggers a MINOR version bump.
- Wording clarifications and typo fixes trigger a PATCH version bump.
- All amendments MUST be recorded in the Sync Impact Report comment at the top of
  this file.

**Versioning Policy**: Semantic versioning (`MAJOR.MINOR.PATCH`) is used for this
document. The version line below MUST be updated with every amendment.

**Compliance Review**: Every `plan.md` MUST include a "Constitution Check" gate that
explicitly confirms each of the five principles is satisfied before Phase 1 design
begins, and again before final implementation review.

**Version**: 1.0.0 | **Ratified**: 2026-04-30 | **Last Amended**: 2026-04-30
