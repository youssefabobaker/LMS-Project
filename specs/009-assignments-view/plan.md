# Implementation Plan: Assignments View

**Branch**: `009-assignments-view` | **Date**: 2026-05-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/009-assignments-view/spec.md`

## Summary

Implement the Assignments View under `src/app/features/assignments/` to display a list of assignments for a course. The view will integrate into the existing course dashboard, toggled via the 'Assignments' tab, maintaining the static top course banner. It includes fetching assignments via `AssignmentService`, expanding cards to view attachments, and checking permissions for Add/Delete actions.

## Technical Context

**Language/Version**: Angular 17+ (TypeScript)  
**Primary Dependencies**: Bootstrap 5, Bootstrap Icons, Angular `HttpClient`, RxJS  
**Storage**: N/A (Frontend only, calls Backend API)  
**Testing**: Jasmine/Karma (standard Angular)  
**Target Platform**: Web Browser  
**Project Type**: Web Application Frontend  
**Performance Goals**: Instant tab switching without full page reloads  
**Constraints**: MUST follow Lumina Constitution (Standalone components, Core services, Bootstrap-first)  
**Scale/Scope**: Frontend component integration  

## Constitution Check

*GATE: Passed*

- [x] **I. Bootstrap-First Styling** — Bootstrap 5 is the primary CSS framework; custom classes follow `.btn-lumina-*`; colors conform to `design.md`.
- [x] **II. Stitch Design Blueprint** — The `content-view` stitch design blueprint has been consulted for the tab layout and card styling.
- [x] **III. Angular Standalone Architecture** — Feature lives under `src/app/features/assignments/`; standalone components only.
- [x] **IV. Separation of Concerns** — API logic in `AssignmentService` (`src/app/core/services/`); models in `src/app/core/models/`.
- [x] **V. Scope-Lock & Consultation** — Modifying `content-view` HTML strictly to integrate the `app-assignments-view` component toggle.

## Project Structure

### Documentation (this feature)

```text
specs/009-assignments-view/
├── plan.md              
├── research.md          
├── data-model.md        
├── quickstart.md        
└── tasks.md             
```

### Source Code

```text
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   └── assignment.model.ts
│   │   └── services/
│   │       └── assignment.service.ts
│   └── features/
│       ├── content/
│       │   └── content-view/
│       │       └── content-view.component.ts|html (Update to include toggle)
│       └── assignments/
│           └── assignments-view/
│               ├── assignments-view.component.ts
│               ├── assignments-view.component.html
│               └── assignments-view.component.css
```

**Structure Decision**: A new `assignments` feature folder is created for the `assignments-view` standalone component, preserving separation of concerns. `content-view.component` will act as the host shell that toggles between its own content list and the new `<app-assignments-view>` based on tab state.
