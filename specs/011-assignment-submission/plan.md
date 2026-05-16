# Implementation Plan: Assignment Submission & Grading

**Branch**: `011-assignment-submission` | **Date**: 2026-05-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/011-assignment-submission/spec.md`

---

## Summary

Implement the full student submission lifecycle (Add/Edit/View Grade) and the instructor grading dashboard for the Lumina LMS assignments module. The student workflow uses a smart state machine (`none → submitted → graded`) driven by a parallel `forkJoin` load of assignments and submissions. The instructor workflow adds a dedicated submissions-list page reachable via router navigation, with a grading modal. All logic is gated by the existing `PermissionService`.

---

## Technical Context

**Language/Version**: TypeScript 5 / Angular 17 (Standalone Components)  
**Primary Dependencies**: Angular HttpClient, RxJS (`forkJoin`, `switchMap`), Bootstrap 5, SweetAlert2, Bootstrap Icons  
**Storage**: N/A (API-backed via `https://localhost:7289`)  
**Testing**: Manual smoke tests (E2E)  
**Target Platform**: Web browser (Desktop-first, responsive via Bootstrap 5)  
**Project Type**: Angular Single-Page Application (frontend only)  
**Performance Goals**: Both API calls complete in parallel; UI state resolves in one network round-trip  
**Constraints**: File uploads limited to PDF/MP4; max 500 MB request size (enforced client + server)  
**Scale/Scope**: Feature-scoped — only `src/app/features/assignments/` and `src/app/core/services/` touched

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Bootstrap-First Styling** — Bootstrap 5 used throughout; new badges/buttons follow Lumina naming (`btn-submit-add`, `btn-submit-edit`, `badge-submitted`); colors from `design.md` (cyan `#41B3E3`, danger red for "Late"/"Missed" badges).
- [x] **II. Stitch Design Blueprint** — No dedicated stitch subfolder exists for submissions; design mirrors the existing `assignments-view` card pattern (already approved). Constitution gap flagged and accepted: the established assignments card design serves as the visual contract.
- [x] **III. Angular Standalone Architecture** — All new components are standalone; placed under `src/app/features/assignments/`; no NgModule introduced.
- [x] **IV. Separation of Concerns** — All HTTP calls in the new `AssignmentSubmissionService` under `src/app/core/services/`; model interfaces in `src/app/models/assignment.model.ts`; components contain zero raw HTTP calls.
- [x] **V. Scope-Lock & Consultation** — Only `assignments/` feature files and `app.routes.ts` (for new route) are touched. `AssignmentsViewComponent` is modified (in-scope). No unrelated files modified.

---

## Project Structure

### Documentation (this feature)

```text
specs/011-assignment-submission/
├── plan.md              ← This file
├── spec.md              ← Feature specification
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code

```text
src/app/
├── core/services/
│   ├── assignment.service.ts           (existing — unchanged)
│   └── assignment-submission.service.ts  ← NEW
│
├── models/
│   └── assignment.model.ts             (existing — 4 new interfaces appended)
│
├── features/assignments/
│   ├── assignments-view/
│   │   ├── assignments-view.component.ts   (modified — forkJoin, submissionMap, modal wiring)
│   │   ├── assignments-view.component.html (modified — student state buttons, modal host)
│   │   └── assignments-view.component.css  (modified — new badge/button styles)
│   │
│   ├── submission-add-edit/            ← NEW COMPONENT
│   │   ├── submission-add-edit.component.ts
│   │   ├── submission-add-edit.component.html
│   │   └── submission-add-edit.component.css
│   │
│   ├── assignment-submissions-list/    ← NEW COMPONENT (Instructor page)
│   │   ├── assignment-submissions-list.component.ts
│   │   ├── assignment-submissions-list.component.html
│   │   └── assignment-submissions-list.component.css
│   │
│   └── grade-submission-modal/         ← NEW COMPONENT
│       ├── grade-submission-modal.component.ts
│       ├── grade-submission-modal.component.html
│       └── grade-submission-modal.component.css
│
└── app.routes.ts                       (modified — new submissions list route)
```

---

## Phase Roadmap

| Phase | Title | User Stories Covered |
|---|---|---|
| Phase 1 | Foundation — Models & Service | All (prerequisite) |
| Phase 2 | Student Workflow — Smart State | US1, US3, US4 |
| Phase 3 | Submission Modal (Add/Edit) | US1, US3 |
| Phase 4 | Instructor — Submissions List | US2 |
| Phase 5 | Instructor — Grading Modal | US2 |
| Phase 6 | Polish & Permission Gates | All |
