# Tasks: Course Add / Edit Modal (Cycle 2)

**Input**: Design documents from `specs/004-course-add-edit/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unresolved dependencies)
- **[Story]**: Which user story this task belongs to (US1 = Create, US2 = Edit, US3 = Cancel/Dismiss)

## Path Conventions (Lumina Angular Standalone)

- **Feature components**: `src/app/features/course-management/`
- **Core services**: `src/app/core/services/`
- **Model interfaces**: `src/app/models/`
- **Stitch design reference**: `stitch-designs/course-add-edit/`
- Do NOT create NgModule files; all components MUST be standalone

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend the data contract and service before any UI work. These are the prerequisites that must exist for all three user stories to function.

- [x] T001 Extend `Course` interface in `src/app/models/course.ts` — add `LearningOutcomes?: string`, `academicLevel?: number`, `departmentId?: number`
- [x] T002 Update `normalizeCourse()` in `src/app/core/services/course.service.ts` to map the three new fields from both camelCase and PascalCase API responses
- [x] T003 [P] Add `createCourse(departmentId: number, formData: FormData): Observable<Course>` to `src/app/core/services/course.service.ts` — POST `/api/Course/{departmentId}`, no manual Content-Type header
- [x] T004 [P] Add `updateCourse(departmentId: number, courseId: number, formData: FormData): Observable<Course>` to `src/app/core/services/course.service.ts` — PUT `/api/Course/{departmentId}/{courseId}`, no manual Content-Type header
- [x] T005 Create the component folder `src/app/features/course-management/course-add-edit/` and generate three empty files: `course-add-edit.component.ts`, `course-add-edit.component.html`, `course-add-edit.component.css`

**Checkpoint**: Model and service layer complete. ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the `CourseAddEditComponent` shell — wiring that all three user stories depend on.

- [x] T006 Declare `CourseAddEditComponent` as a standalone Angular component in `src/app/features/course-management/course-add-edit/course-add-edit.component.ts` — imports: `[CommonModule, ReactiveFormsModule]`; inject `FormBuilder`, `CourseService`, `AuthService`, `PermissionService`
- [x] T007 Declare component `@Input() courseData: Course | null = null` and `@Output()` events — `courseCreated: EventEmitter<Course>`, `courseUpdated: EventEmitter<Course>`, `modalDismissed: EventEmitter<void>` — in `src/app/features/course-management/course-add-edit/course-add-edit.component.ts`
- [x] T008 Implement `ngOnInit()` in `course-add-edit.component.ts` — call `loadDepartments()` and `initForm()`; if `courseData !== null` call `patchForm(courseData)`
- [x] T009 Implement `initForm()` in `course-add-edit.component.ts` using `FormBuilder.group()` — controls: `title` (required, minLength 5), `description` (required), `semster` (required), `academicLevel` (required), `credit_Hour` (required, min 1, max 10), `learningOutcomes` (required), `departmentId` (required)
- [x] T010 Implement `loadDepartments()` in `course-add-edit.component.ts` — call `AuthService.getDepartments()` and store result in `departments: any[]`
- [x] T011 Add component state properties to `course-add-edit.component.ts`: `isSaving = false`, `selectedFile: File | null = null`, `imagePreviewUrl: string | null = null`
- [x] T012 Add the Bootstrap Modal host `<div class="modal fade" id="courseModal">` wrapping `<app-course-add-edit>` to `src/app/features/course-management/course-view/course-view.component.html` — bind `[courseData]`, `(courseCreated)`, `(courseUpdated)`, `(modalDismissed)`
- [x] T013 Add `CourseAddEditComponent` to the `imports` array of `CourseViewComponent` in `src/app/features/course-management/course-view/course-view.component.ts`
- [x] T014 Add `selectedCourse: Course | null = null` and `modalInstance: any = null` to `CourseViewComponent`; implement `openModal()` and `closeModal()` using `window.bootstrap.Modal` in `src/app/features/course-management/course-view/course-view.component.ts`

**Checkpoint**: Shell complete. ✅

---

## Phase 3: User Story 1 — Create a New Course (Priority: P1) 🎯 MVP

**Goal**: The user can open the modal from the "Create New Course" button, fill in all fields including an optional thumbnail, submit, and see the new course card appear at the top of the grid without a page reload.

**Independent Test**: Click "Create New Course", fill all fields, submit — verify a new card appears at top of the grid (search/semester filters are cleared), and no full `loadCourses()` API call is made.

### Implementation for User Story 1

- [x] T015 [US1] Update `navigateToCreate()` in `src/app/features/course-management/course-view/course-view.component.ts` — set `selectedCourse = null`, then call `openModal()`
- [x] T016 [US1] Implement `onFileSelected(event: Event)` in `course-add-edit.component.ts` — validate file size (≤ 5 MB) and type (JPEG/PNG/WebP); on failure show SweetAlert2 error; on success store the `File` in `selectedFile` and generate a Base64 preview with `FileReader.readAsDataURL()` stored in `imagePreviewUrl`
- [x] T017 [US1] Implement `buildFormData()` in `course-add-edit.component.ts` — create `new FormData()`, append all form control values, append `ImageFile` only when `selectedFile !== null`
- [x] T018 [US1] Implement `onSubmit()` Create branch in `course-add-edit.component.ts` — guard with `form.invalid` → `markAllAsTouched()`; set `isSaving = true`; call `courseService.createCourse(departmentId, fd)`; on success: emit `courseCreated`, call `closeModal()`, show SweetAlert2 success toast; on error: set `isSaving = false`, show SweetAlert2 error with server message
- [x] T019 [US1] Implement `onCourseCreated(newCourse: Course)` in `course-view.component.ts` — reset `searchTerm = ''` and `selectedSemester = ''`, call `courses.unshift(newCourse)`, then call `applyFilters()`
- [x] T020 [US1] Build the modal HTML in `course-add-edit.component.html` following `stitch-designs/course-add-edit/code.html`
- [x] T021 [US1] Apply inline validation error display in `course-add-edit.component.html`
- [x] T022 [US1] Style the modal in `course-add-edit.component.css` following Lumina tokens

**Checkpoint**: US1 fully functional. ✅

---

## Phase 4: User Story 2 — Edit an Existing Course (Priority: P2)

**Goal**: The user can click the Edit icon on any course card; the modal opens pre-populated; they can change any field; saving updates the card in place.

**Independent Test**: Click Edit on a card, change the title, save — verify the card title updates in the grid immediately and no image bytes are sent if the image was not changed.

### Implementation for User Story 2

- [x] T023 [US2] Implement `patchForm(course: Course)` in `course-add-edit.component.ts` — call `form.patchValue()` mapping all seven form fields; convert string semester value to integer; set `imagePreviewUrl = course.ImageUrl` if present
- [x] T024 [US2] Update the modal header title in `course-add-edit.component.html` to be dynamic; pre-set the Department dropdown to `courseData.departmentId` and disable it in Edit mode
- [x] T025 [US2] Implement `onSubmit()` Edit branch in `course-add-edit.component.ts` — call `courseService.updateCourse(departmentId, courseData.Id, fd)` when `courseData !== null`
- [x] T026 [US2] Implement `onCourseUpdated(updatedCourse: Course)` in `course-view.component.ts` — use `findIndex()` to locate the course by `Id`; replace it; call `applyFilters()`
- [x] T027 [US2] Wire the Edit icon button in `course-view.component.html` — replace `navigateToEdit(course)` with `editCourse(course)`
- [x] T028 [US2] Implement `editCourse(course: Course)` in `course-view.component.ts` — set `selectedCourse = course`, then call `openModal()`

**Checkpoint**: US1 and US2 both functional. ✅

---

## Phase 5: User Story 3 — Cancel / Dismiss Without Saving (Priority: P3)

**Goal**: The user can dismiss the modal at any time via Cancel, ×, or Escape without triggering a save.

**Independent Test**: Open modal, type in Title, click Cancel — "Discard changes?" dialog appears; click Discard — modal closes. Press Escape — closes immediately.

### Implementation for User Story 3

- [x] T029 [US3] Implement `onCancel()` in `course-add-edit.component.ts` — check `form.dirty`; if true show SweetAlert2 "Discard changes?" confirmation; if confirmed call `closeModal()`
- [x] T030 [US3] Bind `onCancel()` to both the × icon button and the Cancel button in `course-add-edit.component.html`
- [x] T031 [US3] Ensure the Bootstrap Modal is initialized with `{ keyboard: true }` in `course-view.component.ts` `openModal()` — enables Escape-key close without confirmation

**Checkpoint**: All three user stories complete. ✅

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T032 [P] Verify the `isSaving` spinner state in `course-add-edit.component.html` — while saving, the button shows a Bootstrap spinner and "Saving…"; Cancel and × buttons are disabled during save
- [x] T033 [P] Add the `normalizeSemester` helper — semester string→int mapping in `patchForm` (T023) via `SEMESTER_STR_TO_INT` constant in `course-add-edit.component.ts`
- [x] T034 Reset `selectedFile` and `imagePreviewUrl` to `null` inside `closeModal()` in `course-add-edit.component.ts` to prevent stale preview state
- [x] T035 [P] Call `form.reset()` inside `closeModal()` in `course-add-edit.component.ts` so `form.dirty` is `false` next time the modal opens
- [ ] T036 [P] Manual end-to-end validation against SC-001 through SC-005 in `specs/004-course-add-edit/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (T001–T005) → MUST complete before Phases 2–6
Phase 2 (T006–T014) → MUST complete before Phases 3–6
Phase 3 (T015–T022) → US1 MVP; MUST complete before Phase 4
Phase 4 (T023–T028) → US2; depends on Phase 3 (shares component and parent)
Phase 5 (T029–T031) → US3; can be implemented in parallel with Phase 4
Phase 6 (T032–T036) → Polish; depends on Phases 3–5 complete
```

### Total Task Count: 36 tasks across 6 phases

| Phase | Tasks | User Story | Status |
|---|---|---|---|
| Phase 1: Setup | T001–T005 | — | ✅ Complete |
| Phase 2: Foundational | T006–T014 | — | ✅ Complete |
| Phase 3: Create Course | T015–T022 | US1 (P1) 🎯 MVP | ✅ Complete |
| Phase 4: Edit Course | T023–T028 | US2 (P2) | ✅ Complete |
| Phase 5: Cancel/Dismiss | T029–T031 | US3 (P3) | ✅ Complete |
| Phase 6: Polish | T032–T036 | — | 35/36 ✅ (T036 manual) |
