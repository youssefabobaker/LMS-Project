# Tasks: Course Enrollment Modal

**Input**: Design documents from `specs/006-course-enrollment-modal/`
**Stitch Design**: `stitch-designs/course-enrollment/` (MUST be consulted before any HTML/CSS work)
**Plan**: `specs/006-course-enrollment-modal/plan.md`
**Spec**: `specs/006-course-enrollment-modal/spec.md`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to ([US1], [US2], [US3])
- Tests are NOT included (not requested)

## Path Conventions (Lumina Angular Standalone)

- **Feature components**: `src/app/features/course-management/course-enrollment/`
- **Core services**: `src/app/core/services/` → Note: project uses `src/app/core/services/` mapped via `course.service.ts` import pattern
- **Model interfaces**: `src/app/models/` (project convention — confirmed from `user.ts`, `assessment.ts` locations)
- **Stitch design reference**: `stitch-designs/course-enrollment/`
- Do NOT create NgModule files; all components MUST be standalone

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new files and model interfaces that ALL user stories depend on.

- [x] T001 Consult `stitch-designs/course-enrollment/` — open `code.html` and note all HTML structure, class names, and layout before writing any template or CSS
- [x] T002 Create `EnrolledUser` interface in `src/app/models/enrolled-user.ts` with fields: `id: string`, `firstName: string`, `lastName: string`, `email: string`
- [x] T003 Create the feature folder and three empty shell files: `src/app/features/course-management/course-enrollment/course-enrollment.component.ts`, `.html`, `.css`

**Checkpoint**: Model and folder structure are ready — implementation phases can begin. ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Service-layer API methods that ALL user stories depend on. Must be complete before any component work.

⚠️ **CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Import `EnrolledUser` from `src/app/models/enrolled-user.ts` in `src/app/core/services/course.service.ts` and add the `normalizeEnrolledUser(u: any): EnrolledUser` private helper method that handles camelCase/PascalCase inconsistencies (id/Id, firstName/FirstName, lastName/LastName, email/Email)
- [x] T005 Add `getEnrolledUsers(courseId: number): Observable<EnrolledUser[]>` to `src/app/core/services/course.service.ts` — `GET /api/Course/{courseId}/users`, pipes through `normalizeEnrolledUser`
- [x] T006 [P] Add `enrollUser(courseId: number, userId: string): Observable<any>` to `src/app/core/services/course.service.ts` — `POST /api/Course/{courseId}/users` with body `{ userId }` and `responseType: 'text'`
- [x] T007 [P] Add `unenrollUser(courseId: number, userId: string): Observable<any>` to `src/app/core/services/course.service.ts` — `DELETE /api/Course/{courseId}/users/{userId}` with `responseType: 'text'`

**Checkpoint**: `CourseService` exposes all three enrollment endpoints — component work can now begin. ✅

---

## Phase 3: User Story 1 — View Enrolled Instructors (Priority: P1) 🎯 MVP

**Goal**: Admin opens the modal and sees all enrolled instructors (name + email) for that course, with a proper empty state and error state.

**Independent Test**: Open the modal for any course → enrolled instructors table renders with correct names and emails; opening for an empty course shows the empty-state message; network failure shows an error banner.

### Implementation for User Story 1

- [x] T008 [US1] Implement the `CourseEnrollmentComponent` class skeleton in `src/app/features/course-management/course-enrollment/course-enrollment.component.ts`:
  - Declare as `standalone: true`, imports `[CommonModule, FormsModule]`
  - Properties: `courseId: number`, `courseName: string`, `enrolledUsers: EnrolledUser[]`, `allInstructors: User[]`, `isLoading: boolean`, `loadError: string`, `canEnroll: boolean`, `canUnenroll: boolean`
  - Inject `CourseService`, `UserService`, `PermissionService`
  - Implement `open(courseId: number, courseName: string)` method that sets `isLoading = true`, resets error state, sets permission flags via `PermissionService.hasPermission('Course:enrollInstructor')` and `'Course:unenrollInstructor'`, then calls `forkJoin({ enrolled: getEnrolledUsers, users: getUsers })`, populates `enrolledUsers` and filters `allInstructors` to `roles.some(r => r.toLowerCase() === 'instructor')`

- [x] T009 [US1] Build the modal HTML skeleton in `src/app/features/course-management/course-enrollment/course-enrollment.component.html` (referencing `stitch-designs/course-enrollment/code.html`):
  - Modal header with course name (`{{ courseName }}`) and Bootstrap close button (`data-bs-dismiss="modal"`)
  - Modal body: loading spinner `*ngIf="isLoading"`, error banner `*ngIf="loadError"`, empty-state block `*ngIf="enrolledUsers.length === 0 && !isLoading && !loadError"`
  - Enrolled instructors table with columns: **Name**, **Email**, **Actions** — rows use `*ngFor="let user of enrolledUsers"`; Name column displays `{{ user.firstName }} {{ user.lastName }}`; Email column displays `{{ user.email }}`
  - Apply Lumina table styles: `thead` with `background-color: #001A33; color: #41B3E3`

- [x] T010 [US1] Write the component CSS in `src/app/features/course-management/course-enrollment/course-enrollment.component.css` — mirror the `course-assessment.component.css` pattern: table container with `max-height: 420px; overflow-y: auto`, sticky thead, hover row tint `rgba(65,179,227,0.05)`, scrollbar styled `#41B3E3`, `.empty-state` muted text style, `.alert-sm` style. Reference `stitch-designs/course-enrollment/` for any deviations.

- [x] T011 [US1] Wire the `CourseEnrollmentComponent` into `src/app/features/course-management/course-view/course-view.component.ts`:
  - Import and add `CourseEnrollmentComponent` to the `imports` array
  - Add `@ViewChild(CourseEnrollmentComponent) enrollmentComponent!: CourseEnrollmentComponent`
  - Add `openEnrollmentModal(course: Course): void` method — instantiates Bootstrap modal for `#enrollmentModal` (same pattern as `openAssessmentModal`) and calls `this.enrollmentComponent.open(course.Id, course.Title)`

- [x] T012 [US1] Add the enrollment Bootstrap modal `<div id="enrollmentModal">` to `src/app/features/course-management/course-view/course-view.component.html` — `modal-dialog-scrollable modal-lg`, contains `<app-course-enrollment>` as the only child inside `modal-content`

- [x] T013 [US1] Add the "Manage Enrollment" trigger button to the course card in `src/app/features/course-management/course-view/course-view.component.html` — gated by `*ngIf="canReadCourse"`, calls `(click)="openEnrollmentModal(course)"`, uses Bootstrap Icon `bi-person-plus`, Lumina outline button style

**Checkpoint**: User Story 1 is complete. Open the modal for any course — enrolled instructors list (or empty state) renders correctly. ✅

---

## Phase 4: User Story 2 — Enroll an Instructor (Priority: P2)

**Goal**: Authorised admin selects an instructor from the dropdown (excluding already-enrolled) and clicks "Enroll" — instructor appears in the table immediately, success toast shown. Enroll button/dropdown hidden for users without `Course:enrollInstructor`.

**Independent Test**: Log in as admin with `Course:enrollInstructor` → select an available instructor from the dropdown → click Enroll → instructor row appears in the table without page reload → success toast displayed. Verify that the enrolled instructor is no longer in the dropdown.

### Implementation for User Story 2

- [x] T014 [US2] Add `selectedUserId: string | null = null` and `enrollError: string = ''` properties to `CourseEnrollmentComponent` in `src/app/features/course-management/course-enrollment/course-enrollment.component.ts`

- [x] T015 [US2] Add the `availableInstructors` computed getter to `CourseEnrollmentComponent` — filters `allInstructors` by excluding IDs present in `enrolledUsers` using a `Set`:
  ```typescript
  get availableInstructors(): User[] {
    const enrolledIds = new Set(this.enrolledUsers.map(u => u.id));
    return this.allInstructors.filter(u => !enrolledIds.has(u.id));
  }
  ```

- [x] T016 [US2] Add `onEnroll(): void` method to `CourseEnrollmentComponent` — guards against null `selectedUserId`, calls `courseService.enrollUser(courseId, selectedUserId)`, on success pushes a new `EnrolledUser` object to `enrolledUsers` (constructed from `allInstructors.find`), resets `selectedUserId = null`, clears `enrollError`, and fires a SweetAlert2 toast (`toast: true, position: 'bottom-end', icon: 'success', timer: 3000`); on error sets `enrollError = 'Failed to enroll instructor. Please try again.'`

- [x] T017 [US2] Add the enroll section to `src/app/features/course-management/course-enrollment/course-enrollment.component.html` — wrapped in `*ngIf="canEnroll"`:
  - `<select [(ngModel)]="selectedUserId">` iterating `*ngFor="let u of availableInstructors"` with `[ngValue]="u.id"` and display `{{ u.firstName }} {{ u.lastName }}`
  - Informational message `*ngIf="availableInstructors.length === 0"` reading "All available instructors are already enrolled."
  - "Enroll" button `[disabled]="!selectedUserId || availableInstructors.length === 0"` calling `(click)="onEnroll()"` with `.btn-lumina-main` class
  - Inline error message `*ngIf="enrollError"` below the button using `alert-danger alert-sm`

**Checkpoint**: User Story 2 is complete. Enroll flow works end-to-end. ✅

---

## Phase 5: User Story 3 — Unenroll an Instructor (Priority: P3)

**Goal**: Authorised admin clicks the delete icon → inline "Confirm / Cancel" prompt appears in the row → on "Confirm", instructor removed in-place with success toast. Unenroll icon hidden for users without `Course:unenrollInstructor`.

**Independent Test**: Log in as admin with `Course:unenrollInstructor` → click delete icon on any row → inline confirm prompt replaces the icon → click "Confirm" → row removed without page reload → success toast shown. Click delete then "Cancel" — row returns to normal unchanged.

### Implementation for User Story 3

- [x] T018 [US3] Add `confirmingUnenrollId: string | null = null` and `unenrollError: string = ''` properties to `CourseEnrollmentComponent` in `src/app/features/course-management/course-enrollment/course-enrollment.component.ts`; also reset both in `open()` method

- [x] T019 [US3] Add three unenroll methods to `CourseEnrollmentComponent`:
  - `requestUnenroll(userId: string): void` — sets `confirmingUnenrollId = userId`, clears `unenrollError`
  - `cancelUnenroll(): void` — sets `confirmingUnenrollId = null`
  - `confirmUnenroll(): void` — calls `courseService.unenrollUser(courseId, confirmingUnenrollId!)`, on success filters `enrolledUsers` to remove the entry, fires success toast, resets `confirmingUnenrollId = null`; on error sets `unenrollError` and resets `confirmingUnenrollId = null`

- [x] T020 [US3] Update the Actions column in the enrolled table in `src/app/features/course-management/course-enrollment/course-enrollment.component.html`:
  - Delete icon `<button *ngIf="canUnenroll && confirmingUnenrollId !== user.id" (click)="requestUnenroll(user.id)">` with `bi-trash` icon and `btn-outline-danger border-0` styling
  - Inline confirm block `*ngIf="confirmingUnenrollId === user.id"` containing: a short warning text ("Remove this instructor?"), "Confirm" button calling `confirmUnenroll()` with danger styling, and "Cancel" button calling `cancelUnenroll()` with outline styling
  - Unenroll error row `*ngIf="unenrollError"` as a `colspan` alert row beneath the table (or inline near footer)

**Checkpoint**: All three user stories complete. Full enrollment modal is functional. ✅

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final review, accessibility, and visual consistency pass.

- [x] T021 [P] Verify all Lumina colour tokens are used consistently throughout `course-enrollment.component.css` — run a visual diff against `stitch-designs/course-enrollment/` and `design.md`; confirm `#41B3E3` for accents, `#001A33`/`#002D5B` for table head, `.btn-lumina-main`/`.btn-lumina-outline`/`.btn-save-action` class usage
- [x] T022 [P] Add `aria-label` attributes to the delete icon button and confirm/cancel buttons in `course-enrollment.component.html` for accessibility
- [x] T023 Reset `enrollError` when the enroll section re-renders (e.g., call `this.enrollError = ''` at the start of `onEnroll()`) and `unenrollError` at the start of `confirmUnenroll()` — verify no stale error messages linger across multiple actions in `src/app/features/course-management/course-enrollment/course-enrollment.component.ts`
- [ ] T024 Manual smoke test: open the modal → verify enrolled list loads → enroll a new instructor → verify dropdown exclusion → unenroll via confirm → verify list updates in-place → verify toasts fire for both actions → close and reopen modal → verify state is reset cleanly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on T001–T003; BLOCKS all user story phases
- **Phase 3 (US1)**: Depends on Phase 2 — T008 must precede T009, T010, T011, T012, T013 (T009–T013 can run in parallel once T008 is done)
- **Phase 4 (US2)**: Depends on Phase 3 checkpoint — T014 → T015 → T016 → T017
- **Phase 5 (US3)**: Depends on Phase 3 checkpoint — T018 → T019 → T020
- **Phase 6 (Polish)**: Depends on Phases 3–5 complete

### User Story Dependencies

- **US1 (P1)**: Foundational must be done; no dependency on US2 or US3
- **US2 (P2)**: Requires US1 component to exist (T008); can build enroll section on top
- **US3 (P3)**: Requires US1 component to exist (T008); can build unenroll section independently of US2

### Within Each User Story

- Models before services (T001–T002 before T004)
- Service methods before component methods (Phase 2 before Phase 3)
- Component class before template (T008 before T009)
- Core implementation before polish (Phases 3–5 before Phase 6)

### Parallel Opportunities

- T006 and T007 (enrollUser / unenrollUser service methods) — different method additions to same file; write sequentially to avoid conflicts
- T009 and T010 (HTML template and CSS) — different files, can be parallel once T008 is done
- T011 and T012 (TS and HTML changes in course-view) — different concerns but same files; do sequentially
- T021 and T022 (Polish) — different concerns, fully parallel

---

## Parallel Example: User Story 1

```
Sequential: T008 (component class)
  → then parallel:
      T009 (HTML template)   T010 (CSS)
  → then sequential:
      T011 (course-view.ts wiring)
      T012 (modal div in course-view.html)
      T013 (trigger button in course-view.html)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only — Read View)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T007)
3. Complete Phase 3: User Story 1 (T008–T013)
4. **STOP and VALIDATE**: Modal opens; enrolled instructors display; empty state works; error state works
5. Demo read-only view to stakeholders

### Incremental Delivery

1. Setup + Foundational → Service layer ready
2. Add US1 → Read view works → Demo
3. Add US2 → Enroll works → Demo
4. Add US3 → Unenroll works → Demo
5. Polish phase → Production-ready

---

## Notes

- **Stitch design MUST be consulted first** (T001 is intentionally the first task for this reason)
- Model location is `src/app/models/` not `src/app/core/models/` — confirmed by inspecting existing `user.ts` and `assessment.ts` paths
- `UserService.getUsers()` already returns `roles: string[]`; instructor filter is `roles.some(r => r.toLowerCase() === 'instructor')`
- SweetAlert2 (`import Swal from 'sweetalert2'`) is already a project dependency — confirmed in `course-view.component.ts`
- The `open()` method pattern (rather than `@Input` lifecycle) is required to avoid Angular change detection timing issues — confirmed by the existing `assessmentComponent.open()` pattern
- `confirmingUnenrollId` must be reset in `open()` to avoid stale confirm state if the modal is reopened quickly
