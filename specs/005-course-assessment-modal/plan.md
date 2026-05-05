# Implementation Plan: Course Assessment Modal

**Branch**: `005-course-assessment-modal` | **Date**: 2026-05-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/005-course-assessment-modal/spec.md`

## Summary

Implement a Course Assessment Modal that allows authorized users to view, add, and edit
assessments for a specific course. The modal is triggered from the existing `CourseViewComponent`,
receives `courseId` and `courseName` as inputs, and manages all state in-place without page
reloads. It enforces a 100% total-weight guard and gates all write actions behind existing
`Course:add` / `Course:update` permission checks.

## Technical Context

**Language/Version**: TypeScript 5 / Angular 17 (Standalone Components)  
**Primary Dependencies**: Angular HttpClient, Bootstrap 5, Bootstrap Icons, RxJS  
**Storage**: N/A (all state is transient per modal session; backend is source of truth)  
**Testing**: Angular CLI default test runner (Karma/Jasmine)  
**Target Platform**: Web browser (desktop-primary, responsive via Bootstrap grid)  
**Project Type**: Single-page Angular web application (admin panel module)  
**Performance Goals**: Assessment list + type dropdown visible within 2 s of modal open  
**Constraints**: No NgModule; no raw HTTP in components; Scope-Lock in effect  
**Scale/Scope**: Single modal handling ≤ ~20 assessment types per course

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Bootstrap-First Styling** — All new CSS uses Lumina tokens (`#41B3E3`, `#001A33`, `#002D5B`); button classes follow `.btn-lumina-*` / `.btn-save-action` / `.btn-edit-action` conventions from `design.md`.
- [x] **II. Stitch Design Blueprint** — `stitch-designs/course-assessment/` consulted; `code.html` and `DESIGN.md` are the visual source of truth for this feature.
- [x] **III. Angular Standalone Architecture** — New component lives under `src/app/features/course-management/course-assessment/`; no NgModule introduced.
- [x] **IV. Separation of Concerns** — Four new methods added to `src/app/core/services/course.service.ts`; two new interfaces added to `src/app/models/assessment.ts`; component contains zero HTTP calls.
- [x] **V. Scope-Lock & Consultation** — Only `CourseService`, `course-view` host (to wire the modal), and the new `course-assessment` folder are modified.

## Project Structure

### Documentation (this feature)

```text
specs/005-course-assessment-modal/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code

```text
src/app/
├── models/
│   └── assessment.ts                          ← NEW: Assessment + AssessmentType interfaces
│
├── core/services/
│   └── course.service.ts                      ← MODIFY: +4 assessment endpoint methods
│
└── features/course-management/
    ├── course-view/
    │   ├── course-view.component.ts           ← MODIFY: wire assessment modal @ViewChild + open handler
    │   └── course-view.component.html         ← MODIFY: add assessment modal host + button binding
    │
    └── course-assessment/                     ← NEW folder
        ├── course-assessment.component.ts
        ├── course-assessment.component.html
        └── course-assessment.component.css
```

**Structure Decision**: Single Angular project; feature folder extends existing `course-management`.
The assessment sub-component is embedded in the same Bootstrap modal already used by `course-view`,
keeping the shell consistent with the existing `course-add-edit` pattern.

## Complexity Tracking

> No Constitution violations detected. Table not required.
