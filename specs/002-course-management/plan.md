# Implementation Plan: Course Management

**Branch**: `002-course-management` | **Date**: 2026-05-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-course-management/spec.md`

## Summary

Implement a Course Management module using Angular Standalone Components, featuring a Card-Based Layout for displaying courses and a collapsible Reactive Form for creating and editing courses. This includes integration with the `/api/Course` endpoints using `multipart/form-data` for image handling, toggle capabilities for publishing status, and UI for assigning instructors directly on course cards. All features are gated by the `PermissionService`.

## Technical Context

**Language/Version**: TypeScript 5+ (Angular 17/18 Standalone)
**Primary Dependencies**: Angular Core, ReactiveForms, HttpClient, SweetAlert2 (via `window.Swal` or package)
**UI/Styling**: Bootstrap 5 + Lumina Design System (Dark Navy, Cyan accents)
**Project Type**: SPA (Single Page Application) - LMS Dashboard Feature
**Target Platform**: Modern Web Browsers
**Constraints**: Follow standalone component architecture. Strict adherence to `stitch-designs` UI blueprints. No cross-layer dependencies (Component -> Service -> Model only).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify all five Lumina Constitution v1.0.0 principles before proceeding:

- [x] **I. Bootstrap-First Styling** — Bootstrap 5 is the primary CSS framework;
  all custom classes follow the Lumina naming convention (`.btn-lumina-*`, etc.);
  colors conform to `design.md` (cyan `#41B3E3`, dark navy `#001A33`/`#002D5B`).
- [x] **II. Stitch Design Blueprint** — The relevant `stitch-designs/<feature>/`
  subfolder has been located and consulted; no visual decisions made without it.
- [x] **III. Angular Standalone Architecture** — Feature lives under
  `src/app/features/<name>/`; no NgModule introduced; standalone components only.
- [x] **IV. Separation of Concerns** — HTTP/API logic delegated to a Core service;
  model interfaces defined under `src/app/models/` (as per project standard); no cross-layer violations.
- [x] **V. Scope-Lock & Consultation** — Only the requested feature is modified;
  any need to touch unrelated files has been escalated and approved in writing.

## Project Structure

### Documentation (this feature)

```text
specs/002-course-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           
│   └── course-api.md    # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   └── course.service.ts
│   ├── models/
│   │   └── course.ts
│   ├── features/
│   │   ├── course-management/
│   │   │   ├── course-management.component.ts
│   │   │   ├── course-management.component.html
│   │   │   ├── course-management.component.css
│   │   │   └── course-management.component.spec.ts
```

**Structure Decision**: Angular Standalone Application structure inside the existing workspace. Models are located in `src/app/models/`, services in `src/app/core/services/`, and the feature component inside `src/app/features/course-management/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
