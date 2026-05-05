---
description: "Task list for Course View — Cycle 1 (Card Grid Hub)"
---

# Tasks: Course View — Cycle 1 (Card Grid Hub)

**Input**: Design documents from `/specs/003-course-view-cycle1/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Not requested — excluded from this cycle.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in all descriptions

## Path Conventions (Lumina Angular Standalone)

- **Feature component**: `src/app/features/course-management/course-view/`
- **Core service**: `src/app/core/services/course.service.ts`
- **Model interface**: `src/app/models/course.ts`
- **Global styles**: `src/styles.css`
- **Component styles**: `src/app/features/course-management/course-view/course-view.component.css`
- **Stitch design reference**: `stitch-designs/course-view/` ⚠️ Must be created before Phase 4
- Do NOT create NgModule files; all components MUST be standalone

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the feature directory skeleton so all downstream tasks have a target location.

- [X] T001 Create feature directory `src/app/features/course-management/course-view/`
- [X] T002 Stitch design reference `stitch-designs/course-view/` confirmed ✅ — contains `DESIGN.md`, `code.html`, `screen.png` (Constitution II blocker resolved)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data model and service layer — MUST be complete before any component work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Create `Semester` enum, `AcademicLevel` enum, and `Course` interface in `src/app/models/course.ts` (match backend field name `semster` exactly — see data-model.md)
- [X] T004 [P] Implement `CourseService` skeleton in `src/app/core/services/course.service.ts` with `baseUrl`, constructor injection of `HttpClient`, and four method stubs: `getCourses()`, `getAllCourses()`, `toggleCourseStatus(id)`, `deleteCourse(id)`

**Checkpoint**: `course.ts` and `course.service.ts` exist and compile — component work can now begin.

---

## Phase 3: User Story 1 — View Course Catalog (Priority: P1) 🎯 MVP

**Goal**: Users with `Course:read` or `Course:readAll` can navigate to `/dashboard/courses` and see a responsive card grid of courses with loading, error, and empty states.

**Independent Test**: Navigate to `/dashboard/courses`. Verify card grid renders with title, description, image/placeholder, badges, and meta chips. Verify loading spinner shows on first load and error state shows a Retry button.

### Implementation for User Story 1

- [X] T005 [US1] Implement `getCourses(): Observable<Course[]>` in `src/app/core/services/course.service.ts` — `GET /api/Course`
- [X] T006 [US1] Implement `getAllCourses(): Observable<Course[]>` in `src/app/core/services/course.service.ts` — `GET /api/Course/GetAll`
- [X] T007 [P] [US1] Scaffold `CourseViewComponent` standalone component (`.ts`, `.html`, `.css`) in `src/app/features/course-management/course-view/`
- [X] T008 [US1] Implement `ngOnInit` with auto-select logic in `src/app/features/course-management/course-view/course-view.component.ts`: if `hasPermission('Course:readAll')` → call `getAllCourses()`, else → call `getCourses()`
- [X] T009 [US1] Implement loading, error (`loadFailed`), and empty state flags in `src/app/features/course-management/course-view/course-view.component.ts`
- [X] T010 [P] [US1] Build card grid CSS: responsive grid (`auto-fill`, `minmax(300px, 1fr)`), card hover transition, image wrapper, status badge overlay, meta chip row, card footer actions — in `src/app/features/course-management/course-view/course-view.component.css` (reference `stitch-designs/course-view/`)
- [X] T011 [US1] Build HTML template in `src/app/features/course-management/course-view/course-view.component.html`: page header, loading spinner, error state with Retry button, empty state, card grid with all card sub-elements (image/placeholder, status badge, title, description, meta chips, action icons)
- [X] T012 [US1] Add `getSemesterLabel(value)` and `getLevelLabel(value)` helper methods in `course-view.component.ts`
- [X] T013 [US1] Add `onImageError(event)` fallback handler in `course-view.component.ts`

**Checkpoint**: User Story 1 fully functional — card grid renders, loading/error/empty states work independently.

---

## Phase 4: User Story 2 — Toggle Published/Draft Status (Priority: P2)

**Goal**: Users with `Course:update` can click a status badge to toggle a course's published state; the badge updates immediately without a page reload.

**Independent Test**: Click the Published badge on a card. Verify it switches to Draft immediately (optimistic update). Simulate API failure and verify the badge reverts and an error dialog appears.

### Implementation for User Story 2

- [X] T014 [US2] Implement `toggleCourseStatus(id: number): Observable<void>` in `src/app/core/services/course.service.ts` — `PUT /api/Course/{id}/Toggle_Status` with empty body `{}`
- [X] T015 [US2] Implement `toggleStatus(course: Course)` method in `course-view.component.ts`: optimistic flip of `course.isPublished`, call service, revert + SweetAlert2 error on failure
- [X] T016 [US2] Update `course-view.component.html` status badge: make it a clickable `<button>` for `Course:update` users and a read-only `<span>` for others; bind `(click)="toggleStatus(course)"` and `[title]` dynamically

**Checkpoint**: Toggle works independently — badge flips on click, reverts on error.

---

## Phase 5: User Story 3 — Delete a Course (Priority: P3)

**Goal**: Users with `Course:delete` can soft-delete a course after confirming in a SweetAlert2 dialog; the card is removed from the grid immediately on success.

**Independent Test**: Click the delete icon, confirm in dialog, verify card disappears immediately. Cancel dialog and verify no change.

### Implementation for User Story 3

- [X] T017 [US3] Implement `deleteCourse(id: number): Observable<void>` in `src/app/core/services/course.service.ts` — `DELETE /api/Course/{id}`
- [X] T018 [US3] Implement `removeCourse(id: number)` method in `course-view.component.ts` with SweetAlert2 confirmation dialog; on confirm: call service, filter course from `this.courses` array on success, show error dialog on failure
- [X] T019 [US3] Update `course-view.component.html` delete icon button: visible only for `Course:delete` users; bind `(click)="removeCourse(course.id)"`

**Checkpoint**: Delete independently works — card removed on confirm, unchanged on cancel.

---

## Phase 6: User Story 4 — Navigate to Future Cycle Routes (Priority: P4)

**Goal**: Navigation icon buttons on each card and the Create button route to the correct future-cycle URLs (which immediately redirect back to `/dashboard/courses` via Angular route stubs in Cycle 1).

**Independent Test**: Click each icon and verify the URL briefly shows the expected pattern before redirecting back to `/dashboard/courses`. Verify each icon is only shown to the correct permission holders.

### Implementation for User Story 4

- [X] T020 [US4] Implement navigation methods in `course-view.component.ts`: `navigateToCreate()`, `navigateToEdit(course)`, `navigateToAssessments(course)`, `navigateToEnrollment(course)` — using Angular `Router`
- [X] T021 [US4] Update `course-view.component.html`: bind "Create Course" button to `navigateToCreate()` (gated: `Course:add`), Edit icon to `navigateToEdit(course)` (gated: `Course:update`), Assessments icon to `navigateToAssessments(course)` (gated: `Course:update`), Enrollment icon to `navigateToEnrollment(course)` (gated: `Course:enrollInstructor` OR `Course:unenrollInstructor`)
- [X] T022 [US4] Register all routes in `src/app/app.routes.ts`: main hub `{ path: 'courses', component: CourseViewComponent, canActivate: [permissionGuard], data: { permission: 'Course:read' } }` plus four redirect stubs: `courses/new/edit`, `courses/:id/edit`, `courses/:id/assessments`, `courses/:id/enrollment` — all `redirectTo: 'courses'` (use relative redirect inside the `dashboard` children array)
- [X] T023 [US4] Add Course Management sidebar link in `src/app/features/dashboard/dashboard.component.html`: `*ngIf="hasPermission('Course:read') || hasPermission('Course:readAll')"`, `routerLink="courses"`, Bootstrap Icon `bi-book-fill`

**Checkpoint**: All four icons navigate without errors; sidebar link appears for correct users.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final integration checks, `app.component.ts` path recognition, and validation against quickstart.

- [X] T024 Add `/dashboard/courses` (and all sub-paths) to the sidebar-visible and footer-hidden path lists in `src/app/app.component.ts` if the component uses path-based conditional rendering
- [X] T025 Validate `hasPermission` helper is wired correctly in `course-view.component.ts` (delegates to `PermissionService.hasPermission()`)
- [X] T026 Run all 9 scenarios from `specs/003-course-view-cycle1/quickstart.md` manually and confirm each passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Stories (Phase 3–6)**: All depend on Foundational completion; execute sequentially (P1 → P4) since they share the same component files
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Foundation (Phase 2) complete + Stitch design exists
- **US2 (P2)**: US1 complete (badge element and `Course` object in template must already exist)
- **US3 (P3)**: US1 complete (card footer actions area must already exist)
- **US4 (P4)**: US1 complete (card footer actions area must already exist); US2/US3 can be parallel

### Parallel Opportunities

| Parallel Group | Tasks |
|---|---|
| Foundation parallel | T003 (model) + T004 (service shell) — different files |
| US1 parallel | T007 (scaffold) + T010 (CSS) — can start together |
| US3 + US4 parallel | After US1 done, US3 and US4 have no shared writes |

---

## Parallel Execution Example: User Story 1

```bash
# Step 1 — Run in parallel (different files):
T003: Create src/app/models/course.ts
T004: Create src/app/core/services/course.service.ts (stubs)

# Step 2 — Run in parallel (scaffold + CSS):
T007: Scaffold CourseViewComponent
T010: Build card grid CSS

# Step 3 — Sequential (TS logic then template):
T005 → T006 → T008 → T009 → T012 → T013 (service methods + component logic)
T011 (HTML template — depends on all TS being in place)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundation) — T003 + T004
3. Complete Phase 3 (US1) — T005–T013
4. Complete T022 + T023 from Phase 6 (route + sidebar to make the page reachable)
5. **STOP and VALIDATE**: Navigate to `/dashboard/courses` and verify the card grid renders
6. Demo if ready

### Incremental Delivery

1. Foundation ready → US1 (view list) → validate ✅
2. Add US2 (toggle) → validate ✅
3. Add US3 (delete) → validate ✅
4. Add US4 (navigation icons + routing) → validate ✅
5. Polish → final validation against quickstart.md

---

## Notes

- `[P]` tasks operate on different files and have no incomplete dependencies
- `[Story]` label maps each task to its user story for full traceability
- **Do NOT implement** Add/Edit form, Assessment management, or Enrollment logic — these are Cycles 2–4
- Commit after each phase checkpoint to preserve progress
- The Stitch design blocker (T002) must be resolved before starting T010 (CSS) and T011 (HTML)
