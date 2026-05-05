# Implementation Plan: Course View — Cycle 1 (Card Grid Hub)

**Branch**: `003-course-view-cycle1` | **Date**: 2026-05-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-course-view-cycle1/spec.md`

## Summary

Build the main Course Management hub as a read-only Card Grid view. This cycle establishes the data model, service layer, routing skeleton (with redirect stubs for future cycles), and the full card grid UI. It deliberately excludes all Create/Edit form logic, Assessment management, and Enrollment management. The goal is a clean, production-ready hub that future cycles slot into without refactoring.

## Technical Context

**Language/Version**: TypeScript 5.x / Angular 17+ (Standalone Components)
**Primary Dependencies**: Angular HttpClient, Bootstrap 5, Bootstrap Icons, SweetAlert2
**Storage**: N/A (stateless frontend; data from REST API)
**Testing**: No automated tests in this cycle (not requested in spec)
**Target Platform**: Web (modern browsers; responsive layout for desktop dashboard)
**Project Type**: Web application (Angular SPA dashboard feature)
**Performance Goals**: Course list renders within 3 seconds; toggle/delete badge updates within 500ms
**Constraints**: Scope-Lock enforced — only `course-management/course-view/`, `models/course.ts`, `core/services/course.service.ts`, and integration points (`app.routes.ts`, `dashboard.component.html`) may be modified.
**Scale/Scope**: Single-page card grid; typical course counts expected in the tens to low hundreds.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify all five Lumina Constitution v1.0.0 principles before proceeding:

- [x] **I. Bootstrap-First Styling** — Bootstrap 5 is the primary CSS framework; all custom classes follow the Lumina naming convention (`.btn-lumina-*`, etc.); colors conform to `design.md` (cyan `#41B3E3`, dark navy `#001A33`/`#002D5B`).
- [x] **II. Stitch Design Blueprint** — `stitch-designs/course-view/` exists and contains `DESIGN.md`, `code.html`, and `screen.png`. Constitution II blocker resolved ✅.
- [x] **III. Angular Standalone Architecture** — Feature lives under `src/app/features/course-management/course-view/`; no NgModule introduced; standalone components only.
- [x] **IV. Separation of Concerns** — HTTP/API logic delegated to `CourseService`; model interfaces defined under `src/app/models/`; no cross-layer violations.
- [x] **V. Scope-Lock & Consultation** — Only files within the course-view scope will be modified. The only approved cross-scope touches are: `app.routes.ts` (add routes) and `dashboard.component.html` (add sidebar link).

## Project Structure

### Documentation (this feature)

```text
specs/003-course-view-cycle1/
├── plan.md              # This file
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
├── quickstart.md        # Phase 1 output ✅
├── contracts/
│   └── course-api.md   # Phase 1 output ✅
└── tasks.md             # Phase 2 output (created by /speckit-tasks)
```

### Source Code (this feature)

```text
src/
├── app/
│   ├── models/
│   │   └── course.ts                        ← NEW (Cycle 1)
│   ├── core/
│   │   └── services/
│   │       └── course.service.ts            ← NEW (Cycle 1)
│   ├── features/
│   │   └── course-management/
│   │       └── course-view/                 ← NEW (Cycle 1)
│   │           ├── course-view.component.ts
│   │           ├── course-view.component.html
│   │           └── course-view.component.css
│   ├── app.routes.ts                        ← MODIFY (add course routes + redirects)
│   └── features/
│       └── dashboard/
│           └── dashboard.component.html     ← MODIFY (add sidebar link)

stitch-designs/
└── course-view/                             ← MUST BE CREATED before UI phase (⚠️ Blocker)
```

### Routing Structure

```text
/dashboard/courses                      → CourseViewComponent   (this cycle)
/dashboard/courses/new/edit             → redirectTo: /dashboard/courses  (stub)
/dashboard/courses/:id/edit             → redirectTo: /dashboard/courses  (stub)
/dashboard/courses/:id/assessments      → redirectTo: /dashboard/courses  (stub)
/dashboard/courses/:id/enrollment       → redirectTo: /dashboard/courses  (stub)
```

## Execution Phases

### Phase 1 — Models & Constants

**Goal**: Establish the TypeScript data contracts. No component or service code yet.

**Files**:
- `src/app/models/course.ts` — `Semester` enum, `AcademicLevel` enum, `Course` interface

**Key rules**:
- The API field name is `semster` (NOT `semester`) — match exactly.
- `imageUrl` is optional/nullable.
- No UI-only fields needed for Cycle 1.

---

### Phase 2 — Service Layer

**Goal**: Implement `CourseService` with exactly four methods. Zero UI logic here.

**Files**:
- `src/app/core/services/course.service.ts`

**Methods**:
| Method | HTTP | Endpoint | Permission |
|--------|------|----------|------------|
| `getCourses()` | GET | `/api/Course` | `Course:read` |
| `getAllCourses()` | GET | `/api/Course/GetAll` | `Course:readAll` |
| `toggleCourseStatus(id)` | PUT | `/api/Course/{id}/Toggle_Status` | `Course:update` |
| `deleteCourse(id)` | DELETE | `/api/Course/{id}` | `Course:delete` |

**No other methods** — Add/Edit, Assessments, and Enrollment service methods belong to Cycles 2–4.

---

### Phase 3 — Routing & Component Scaffold

**Goal**: Register all routes and create the empty component shell.

**Files**:
- `src/app/app.routes.ts` — Add the `courses` child route + four redirect stubs
- `src/app/features/course-management/course-view/course-view.component.ts` — Component shell
- `src/app/features/dashboard/dashboard.component.html` — Add sidebar link

**Route registration**:
```typescript
// Main hub
{ path: 'courses', component: CourseViewComponent, canActivate: [permissionGuard], data: { permission: 'Course:read' } },
// Redirect stubs (future cycles)
{ path: 'courses/new/edit', redirectTo: 'courses' },
{ path: 'courses/:id/edit', redirectTo: 'courses' },
{ path: 'courses/:id/assessments', redirectTo: 'courses' },
{ path: 'courses/:id/enrollment', redirectTo: 'courses' },
```

**Sidebar link** (shown when user has `Course:read` OR `Course:readAll`).

---

### Phase 4 — UI Implementation (Card Grid)

**⚠️ PREREQUISITE**: `stitch-designs/course-view/` must exist and be consulted before writing any HTML/CSS.

**Goal**: Build the full card grid template and styles.

**Files**:
- `course-view.component.html`
- `course-view.component.css`
- `course-view.component.ts` (initialization, loadCourses, permission checks, label helpers)

**UI elements**:
- Page header with title + "Create Course" button (gated: `Course:add`)
- Loading spinner state
- Error state with Retry button
- Empty state message
- Card grid: responsive CSS grid, min card width ~300px
- Per card: image / placeholder, Published|Draft badge overlay, title (2-line clamp), description (3-line clamp), Semester / Level / Credit Hour meta chips
- Per card action icons: Edit (gated: `Course:update`), Assessments (gated: `Course:update`), Enrollment (gated: `Course:enrollInstructor` OR `Course:unenrollInstructor`), Delete (gated: `Course:delete`)

**Design tokens** (from `design.md`):
- Card headers / image fallback: dark navy gradient `#001A33` → `#002D5B`
- Published badge: green `rgba(25, 200, 120, 0.88)`
- Draft badge: red `rgba(220, 53, 69, 0.82)`
- Meta chips background: `#e8f6fd`, text: `#0077aa`
- Action accent: cyan `#41B3E3`

---

### Phase 5 — Direct Action Logic

**Goal**: Wire Toggle and Delete to the service and implement response handling.

**Toggle Status** (in `course-view.component.ts`):
1. User clicks badge → call `toggleCourseStatus(course.id)`
2. Optimistic flip: `course.isPublished = !course.isPublished` immediately
3. On API error: revert flip + SweetAlert2 error dialog

**Delete Course**:
1. User clicks delete icon → SweetAlert2 confirmation dialog
2. On confirm: call `deleteCourse(course.id)`
3. On success: `this.courses = this.courses.filter(c => c.id !== id)` + success toast
4. On error: SweetAlert2 error dialog, no list mutation

**Navigation icons** (router.navigate):
```typescript
navigateToEdit(course: Course)       → router.navigate(['/dashboard/courses', course.id, 'edit'])
navigateToAssessments(course: Course)→ router.navigate(['/dashboard/courses', course.id, 'assessments'])
navigateToEnrollment(course: Course) → router.navigate(['/dashboard/courses', course.id, 'enrollment'])
navigateToCreate()                   → router.navigate(['/dashboard/courses', 'new', 'edit'])
```
All four will redirect back to `/dashboard/courses` via the route stubs until future cycles fill them in.

---

### Phase 6 — Integration & Sidebar

**Goal**: Register the sidebar link and app.component.ts path recognition.

**Files**:
- `src/app/features/dashboard/dashboard.component.html` — Add `Course Management` nav item
- `src/app/app.component.ts` — Add `/dashboard/courses` to the sidebar-visible path list (if applicable)

---

## Complexity Tracking

No Constitution violations requiring justification. The Stitch design blocker (Principle II) is a **prerequisite**, not a violation — it must be resolved before Phase 4 begins.

## Post-Phase Notes

- Cycle 2 will add `course-edit/` sub-folder under `course-management/` for the Create/Edit form.
- Cycle 3 will add `course-assessments/` for Assessment management.
- Cycle 4 will add `course-enrollment/` for Enrollment management.
- The routing stubs registered in Phase 3 will be replaced (not modified) by those future cycles.
