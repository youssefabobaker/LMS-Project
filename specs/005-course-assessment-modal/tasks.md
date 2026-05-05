# Tasks: Course Assessment Modal

**Input**: Design documents from `specs/005-course-assessment-modal/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅  
**Tests**: Not requested — no test tasks generated.  
**Stitch Design**: `stitch-designs/course-assessment/` (code.html + DESIGN.md consulted)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in every task description

## Path Conventions (Lumina Angular Standalone)

- **Feature components**: `src/app/features/course-management/course-assessment/`
- **Core services**: `src/app/core/services/course.service.ts`
- **Model interfaces**: `src/app/models/assessment.ts`
- **Stitch design reference**: `stitch-designs/course-assessment/`
- All components MUST be standalone — no NgModule

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the model interfaces and empty component scaffold that every user story depends on.

- [x] T001 Create `src/app/models/assessment.ts` with the `Assessment` interface (`assType: number`, `percentageWeight: number`, `isMandatory: boolean`, `hours: number`) and the `AssessmentType` interface (`value: number`, `name: string`) exactly as specified in `specs/005-course-assessment-modal/data-model.md`
- [x] T002 Create the empty standalone component scaffold: `src/app/features/course-management/course-assessment/course-assessment.component.ts` (Angular standalone, imports `CommonModule` and `ReactiveFormsModule`), `course-assessment.component.html` (empty shell), and `course-assessment.component.css` (empty file)

**Checkpoint**: Model file and component skeleton exist; the app still compiles cleanly.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend `CourseService` with the four assessment API methods. These are required by all three user stories and MUST be complete before any story phase begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 In `src/app/core/services/course.service.ts`, add `getCourseAssessments(courseId: number): Observable<Assessment[]>` — `GET /api/Course/{courseId}/assessments` — apply defensive camelCase/PascalCase normalisation (same pattern as `normalizeCourse`) mapping `assType`/`AssType`, `percentageWeight`/`PercentageWeight`, `isMandatory`/`IsMandatory`, `hours`/`Hours`. Import `Assessment` and `AssessmentType` from `../../models/assessment`.
- [x] T004 [P] In `src/app/core/services/course.service.ts`, add `getAssessmentTypes(): Observable<AssessmentType[]>` — `GET /api/Course/assessment-types` — normalise `value`/`Value` and `name`/`Name` fields.
- [x] T005 [P] In `src/app/core/services/course.service.ts`, add `addAssessment(courseId: number, assessment: Assessment): Observable<any>` — `POST /api/Course/{courseId}/AddAssesment` with body `[assessment]` (wrapped in array), `responseType: 'text'`.
- [x] T006 [P] In `src/app/core/services/course.service.ts`, add `updateAssessment(courseId: number, assessment: Assessment): Observable<any>` — `PUT /api/Course/{courseId}/UpdateAssesment` with body `[assessment]` (wrapped in array), `responseType: 'text'`.

**Checkpoint**: Foundation ready — `ng build` passes; all four service methods exist and are callable.

---

## Phase 3: User Story 1 — View Course Assessments (Priority: P1) 🎯 MVP

**Goal**: When the Assessment modal opens, both the assessment list and the type dropdown are fully loaded and displayed, including a live total-weight counter. The Assessments button on the course card is only shown to users with `Course:read` or `Course:readAll`.

**Independent Test**: Open the Assessment modal for any course that has existing assessments → confirm the list rows, mandatory badges, hours, and total weight % all display correct data from the network response. Open for a course with no assessments → confirm the empty-state message appears.

### Implementation for User Story 1

- [x] T007 [US1] In `src/app/features/course-management/course-assessment/course-assessment.component.ts`, add `@Input() courseId!: number` and `@Input() courseName!: string`; declare component state: `assessments: Assessment[] = []`, `assessmentTypes: AssessmentType[] = []`, `isLoading = false`, `loadError = ''`; inject `CourseService`.
- [x] T008 [US1] In `course-assessment.component.ts`, implement `loadData()` which calls `getCourseAssessments(courseId)` and `getAssessmentTypes()` in parallel using `forkJoin`; populate `this.assessments` and `this.assessmentTypes`; handle errors by setting `loadError`; add `calculateTotalWeight(excludingType?: number): number` that sums `percentageWeight` for all assessments except the one matching `excludingType`.
- [x] T009 [US1] In `course-assessment.component.ts`, add a public `open()` method that resets state (`assessments = []`, `loadError = ''`, `isLoading = true`) then calls `loadData()`. This is called by the parent via `@ViewChild`.
- [x] T010 [P] [US1] In `src/app/features/course-management/course-assessment/course-assessment.component.html`, build the modal shell: Bootstrap modal structure with a dark-navy gradient header (`linear-gradient(90deg, #001A33, #002D5B)`, `color: #41B3E3`, padding `0.9rem 1.25rem`) displaying the `courseName`, a loading spinner (`spinner-border text-info`) shown while `isLoading`, an inline `alert alert-danger` shown when `loadError` is non-empty, and an empty-state paragraph shown when `assessments.length === 0` and not loading.
- [x] T011 [P] [US1] In `course-assessment.component.html`, add the assessments table: columns — **Type** (display `assessmentTypes` name lookup by `assType` value), **Weight (%)**, **Mandatory** (badge: `.status-active` for true, `.status-disabled` for false), **Hours**, **Actions** (placeholder for US2/US3). Apply Lumina table styles: `thead` with `background-color: #001A33; color: #41B3E3`, `tbody tr:hover rgba(65,179,227,0.05)`. Show total weight row at the bottom as `<tfoot>`.
- [x] T012 [P] [US1] In `src/app/features/course-management/course-assessment/course-assessment.component.css`, add all Lumina-themed scoped styles: modal header gradient, table head colours, scrollable table container (`max-height: 420px; overflow-y: auto`), custom scrollbar (`6px, #41B3E3`), `.btn-save-action` and `.btn-edit-action` per design.md spec, inline error alert style.
- [x] T013 [US1] In `src/app/features/course-management/course-view/course-view.component.ts`, import `CourseAssessmentComponent`; add `@ViewChild(CourseAssessmentComponent) assessmentComponent!: CourseAssessmentComponent`; add permission flag `canReadCourse = false`; set it in `ngOnInit` from `permissionService` (checks `Course:read` OR `Course:readAll`); add `openAssessmentModal(course: Course)` method that sets `selectedCourse = course` and calls `this.assessmentComponent.open()` after opening the Bootstrap modal via `bootstrap.Modal`.
- [x] T014 [US1] In `src/app/features/course-management/course-view/course-view.component.html`, add the `<app-course-assessment>` tag (passing `[courseId]` and `[courseName]` from `selectedCourse`) inside a Bootstrap modal host element with id `assessmentModal`; add an "Assessments" button (`bi-bar-chart-fill` icon, `.btn-edit-action` style) to each course card row, visible only when `canReadCourse` is true, that calls `openAssessmentModal(course)`.

**Checkpoint**: US1 fully functional — modal opens, list loads, total weight displayed, empty state works, Assessments button permission-gated.

---

## Phase 4: User Story 2 — Add a New Assessment (Priority: P2)

**Goal**: An authorized user can click "Add Assessment", fill in the collapsible form, and save a new assessment. The weight guard prevents exceeding 100%. On success the row appears in the list immediately and the total updates — modal stays open. On failure an inline error is shown and the form stays open.

**Independent Test**: On a course with 0 assessments, click "Add Assessment" → complete the form → save → confirm the row appears and the total updates. Then try to add a second entry that would push total > 100% → confirm the save button is blocked with an error message.

### Implementation for User Story 2

- [x] T015 [US2] In `course-assessment.component.ts`, add state for the add form: `showAddForm = false`; `addForm: FormGroup` with controls `assType` (required), `percentageWeight` (required, min 0.01), `isMandatory` (default false), `hours` (required, min 1); inject `FormBuilder`. Add computed getter `availableTypes(): AssessmentType[]` that filters out types already present in `this.assessments`. Add `isAddWeightValid(): boolean` that returns `calculateTotalWeight() + addForm.value.percentageWeight <= 100`.
- [x] T016 [US2] In `course-assessment.component.ts`, implement `onToggleAddForm()` (toggles `showAddForm`, resets `addForm` and `addSaveError` on open); implement `onAddSave()`: guard — call `isAddWeightValid()`, if false set `addSaveError = 'Total course weight cannot exceed 100%'` and return; call `courseService.addAssessment(courseId, payload)`; on success push the new `Assessment` to `this.assessments`, reset the add form, set `showAddForm = false`; on error set `addSaveError` with the server message.
- [x] T017 [US2] In `course-assessment.component.ts`, add auto-select logic inside `onToggleAddForm()`: after `availableTypes` is computed, if `availableTypes.length === 1` then patch `addForm.controls['assType'].setValue(availableTypes[0].value)` (FR-016).
- [x] T018 [P] [US2] In `course-assessment.component.html`, above the assessments table add the collapsible add-form section: an "Add Assessment" button (`.btn-lumina-main`, `bi-plus-lg` icon, hidden when `!canAdd`) that calls `onToggleAddForm()`; the form itself (`*ngIf="showAddForm"`) containing: a `<select>` bound to `assType` showing only `availableTypes`; a number input for `percentageWeight` (`min="0.01"`, `step="0.01"`); a checkbox for `isMandatory`; a number input for `hours` (`min="1"`, `step="1"`); an inline `alert-danger` div showing `addSaveError` when non-empty; a Save button (`.btn-save-action`, `[disabled]="addForm.invalid || !isAddWeightValid()"`) and a Cancel button (`.btn-lumina-outline`) calling `onToggleAddForm()`.
- [x] T019 [US2] In `course-assessment.component.ts`, add `canAdd = false`; resolve it in `open()` by calling `permissionService.hasPermission('Course:add')`. Propagate `canAdd` binding to the template (already used in T018).

**Checkpoint**: US2 functional — add form toggles, weight guard works, success pushes to list, failure shows inline error, Add button permission-gated.

---

## Phase 5: User Story 3 — Edit an Existing Assessment (Priority: P3)

**Goal**: An authorized user can click Edit on an assessment row to expand it inline, modify weight/mandatory/hours (not type), and save. The weight guard accounts for the old weight being replaced. Success updates the row in place; failure keeps the row in edit mode with an inline error.

**Independent Test**: On a course with at least two assessments, click Edit on one row → confirm type is read-only, other fields are editable → change weight to a value within the remaining headroom → save → confirm the row value updates without page reload and total recalculates correctly. Then try a weight that exceeds 100% → confirm blocking.

### Implementation for User Story 3

- [x] T020 [US3] In `course-assessment.component.ts`, add edit state: `editingAssType: number | null = null`; `editForm: FormGroup` with controls `percentageWeight` (required, min 0.01), `isMandatory`, `hours` (required, min 1); `editSaveError = ''`. Add `startEdit(assessment: Assessment)`: sets `editingAssType = assessment.assType`, patches `editForm` with current values, clears `editSaveError`, collapses add form (`showAddForm = false`). Add `cancelEdit()`: sets `editingAssType = null`. Add `isEditWeightValid(): boolean`: returns `calculateTotalWeight(editingAssType!) + editForm.value.percentageWeight <= 100`.
- [x] T021 [US3] In `course-assessment.component.ts`, implement `onEditSave()`: guard — if `!isEditWeightValid()` set `editSaveError = 'Total course weight cannot exceed 100%'` and return; build the updated `Assessment` object (keep `assType = editingAssType`, take weight/mandatory/hours from `editForm`); call `courseService.updateAssessment(courseId, payload)`; on success find the index in `this.assessments` by `assType`, replace it with the updated object (`this.assessments[idx] = updatedAssessment`), call `cancelEdit()`; on error set `editSaveError`.
- [x] T022 [P] [US3] In `course-assessment.component.html`, in the assessments table body add `*ngIf` logic per row: when `editingAssType === a.assType` render the inline edit row — show the type name as a read-only `<span>` (not an input); number input for `percentageWeight`, checkbox for `isMandatory`, number input for `hours`; an inline `alert-danger` for `editSaveError`; a Save button (`.btn-save-action`, `[disabled]="editForm.invalid || !isEditWeightValid()"`) and a Cancel button (`.btn-lumina-outline`) calling `cancelEdit()`; otherwise render the normal display row with an Edit button (`.btn-edit-action`, `bi-pencil-square` icon, `*ngIf="canUpdate"`) calling `startEdit(a)`.
- [x] T023 [US3] In `course-assessment.component.ts`, add `canUpdate = false`; resolve it in `open()` by calling `permissionService.hasPermission('Course:update')`. Use `canUpdate` in template (already referenced in T022).

**Checkpoint**: US3 functional — inline edit expands on correct row only, type read-only, weight guard with self-exclusion works, success replaces row in-place, failure shows inline error, Edit button permission-gated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge-case handling, UX refinements, and final validation that affect multiple stories.

- [x] T024 In `course-assessment.component.ts`, enforce single-edit-mode rule: in `startEdit()` call `cancelEdit()` first to collapse any currently open edit row before opening a new one (FR-014 — only one row in edit mode at a time).
- [x] T025 [P] In `course-assessment.component.html`, add the data-inconsistency warning: when `calculateTotalWeight() > 100` and `!isLoading`, show a `alert-warning` banner above the table ("⚠️ Total weight exceeds 100% — please correct existing assessments before adding or editing.") and disable both the Add button and all Edit buttons.
- [x] T026 [P] In `course-assessment.component.css`, add smooth collapse animation for the add form (`transition: max-height 0.3s ease, opacity 0.3s ease`), hover lift on action buttons (`transform: translateY(-1px)`), and disabled-state styling for the Save button (`background: #ccc; cursor: not-allowed`).
- [x] T027 Manually validate the full `quickstart.md` testing checklist: open modal for a course with assessments, add, edit, trigger weight guard, trigger server error (temporarily break API URL), check all permission-gated buttons for a user without each permission.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 completion — no dependency on US2 or US3
- **US2 (Phase 4)**: Depends on Phase 2 completion — builds on US1's component shell but independently testable
- **US3 (Phase 5)**: Depends on Phase 2 completion — builds on US1's component shell but independently testable
- **Polish (Phase 6)**: Depends on all three user story phases being complete

### User Story Dependencies

- **US1 (P1)**: Can start immediately after Phase 2 — pure view, no write logic needed
- **US2 (P2)**: Can start after Phase 2 — T015–T019 are independent of US3 tasks
- **US3 (P3)**: Can start after Phase 2 — T020–T023 are independent of US2 tasks

### Within Each User Story

- Models/interfaces (Phase 1) → Service methods (Phase 2) → Component logic → Template → CSS
- Component logic tasks before their corresponding template tasks (same file bindings)
- Parent wiring (T013–T014) after component `open()` method exists (T009)

### Parallel Opportunities

- **Phase 2**: T004, T005, T006 can all run in parallel with T003 (all different methods, same file — coordinate edits)
- **Phase 3**: T010, T011, T012 can run in parallel (HTML and CSS are independent of each other)
- **Phase 4**: T018 (template) can run in parallel once T015 state is defined
- **Phase 5**: T022 (template) can run in parallel with T020/T021 (logic)
- **Phase 6**: T025 and T026 can run in parallel

---

## Parallel Example: Phase 3 (US1)

```text
# After T007, T008, T009 are complete, launch in parallel:
Task T010: Build modal shell HTML (course-assessment.component.html)
Task T011: Build assessments table HTML (course-assessment.component.html)
Task T012: Write all Lumina CSS (course-assessment.component.css)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete **Phase 1** — create model + scaffold
2. Complete **Phase 2** — add service methods
3. Complete **Phase 3** — implement US1 (view only)
4. **STOP and VALIDATE** — open modal, confirm list loads, total weight correct
5. Demo read-only assessment view to stakeholders

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 → US1 live (view assessments) → validate → demo
3. Phase 4 → US2 live (add assessments) → validate → demo
4. Phase 5 → US3 live (edit assessments) → validate → demo
5. Phase 6 → Polish → full feature complete

### Single-Developer Sequential Order

```
T001 → T002 → T003 → T004 → T005 → T006 →
T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014 →  [US1 ✅]
T015 → T016 → T017 → T018 → T019 →                        [US2 ✅]
T020 → T021 → T022 → T023 →                                [US3 ✅]
T024 → T025 → T026 → T027                                  [Polish ✅]
```

---

## Notes

- `[P]` tasks operate on different files or clearly separated sections — safe to parallelise
- Each phase ends with a named Checkpoint that is independently verifiable
- The `open()` method (T009) is the integration seam — the parent calls it; the component owns all internal state
- Never close the modal programmatically after a successful add/edit — the user dismisses it manually (FR per spec)
- All `number` inputs MUST have `min` attribute; percentageWeight `min="0.01" step="0.01"`; hours `min="1" step="1"`
- Consult `stitch-designs/course-assessment/code.html` for exact HTML structure and class names before writing the template
