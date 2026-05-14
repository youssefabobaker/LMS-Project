# Tasks: Add Assignment Modal

**Input**: Design documents from `specs/010-assignment-add/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in all descriptions

## Path Conventions (Lumina Angular Standalone)

- **Feature components**: `src/app/features/<feature-name>/`
- **Core services**: `src/app/core/services/`
- **Model interfaces**: `src/app/models/`
- **Stitch reference**: `content-add` component is the authoritative design blueprint

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the new component scaffold and confirm all prerequisite files are in place.

- [x] T001 Create component directory `src/app/features/assignments/assignment-add/` with empty files: `assignment-add.component.ts`, `assignment-add.component.html`, `assignment-add.component.css`
- [x] T002 [P] Verify `src/app/models/assignment.model.ts` exports `AssignmentResponseDto` and `AssignmentAttachmentDto`; confirm `StagedFile` is importable from `src/app/models/content.ts`
- [x] T003 [P] Verify `src/app/core/services/assignment.service.ts` exposes `createOrUpdateAssignment()` and `deleteAttachment()` — confirm the method signatures match the quickstart reference

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend `AssignmentService` with the `addAttachments` method, which is required by all user stories involving file upload.

**⚠️ CRITICAL**: Phases 4 (US2) and 5 (US3 retry) depend on this being complete.

- [x] T004 Add `addAttachments(assignmentId: number, files: File[]): Observable<AssignmentResponseDto>` to `src/app/core/services/assignment.service.ts` — build `FormData` with field name `attachmentFiles`, POST to `/api/Assignment/{assignmentId}/attachments`, normalize response with existing `normalizeAssignment()`

**Checkpoint**: `AssignmentService` now supports all three required operations (create, addAttachments, deleteAttachment). User story phases can begin.

---

## Phase 3: User Story 1 — Create a New Assignment (Priority: P1) 🎯 MVP

**Goal**: Instructor fills in Title, Description, Due Date, Total Marks; clicks Save; assignment is created and appended to the list.

**Independent Test**: Open the modal with no files selected, fill all fields, click Save — confirm the new assignment card appears at the bottom of the list with correct data and a success toast fires.

### Implementation for User Story 1

- [x] T005 [US1] Implement `AssignmentAddComponent` class in `src/app/features/assignments/assignment-add/assignment-add.component.ts`:
  - Standalone component with `@Input() courseId: number` and `@Output() assignmentCreated` / `@Output() modalDismissed` EventEmitters
  - State: `title`, `description`, `dueDate`, `totalMarks`, `stagedFiles`, `isSubmitting`, `submitError`, `retryMode`, `createdAssignmentId`
  - `submit()`: validate all fields, convert `dueDate` to ISO 8601 via `new Date(this.dueDate).toISOString()`, call `AssignmentService.createOrUpdateAssignment(courseId, { id: 0, title, description, dueDate, totalMarks })`
  - On Step 1 success with no files: call `emitSuccess(response)`
  - On Step 1 error: set `submitError`, `isSubmitting = false`
  - `emitSuccess()`: fire SweetAlert2 success toast, emit `assignmentCreated`, call `resetForm()`
  - `resetForm()`: clear all state, mark all NgModel controls as untouched
  - `cancel()`: call `resetForm()`, emit `modalDismissed`

- [x] T006 [US1] Build HTML template in `src/app/features/assignments/assignment-add/assignment-add.component.html` — mirror `content-add.component.html` exactly with these field substitutions:
  - Header: `<div class="assignment-add-header">` with title "Add New Assignment"
  - Field 1: TITLE (`<input type="text">` with `required`, `#titleInput="ngModel"`, `[(ngModel)]="title"`)
  - Field 2: DESCRIPTION (`<textarea rows="3">` with `required`, `#descInput="ngModel"`, `[(ngModel)]="description"`)
  - Field 3: DUE DATE (`<input type="datetime-local">` with `required`, `#dueDateInput="ngModel"`, `[(ngModel)]="dueDate"`, label "DUE DATE")
  - Field 4: TOTAL MARKS (`<input type="number" min="1">` with `required`, `#marksInput="ngModel"`, `[(ngModel)]="totalMarks"`, label "TOTAL MARKS")
  - Keep upload zone, staged file list, progress bar, error/retry alert, and footer (Cancel / Save Assignment) identical to `content-add.component.html`
  - Save button: `(click)="submit(titleInput, descInput, dueDateInput, marksInput)"`

- [x] T007 [US1] Create CSS in `src/app/features/assignments/assignment-add/assignment-add.component.css` — copy `content-add.component.css` verbatim; rename selector `.content-add-header` → `.assignment-add-header`; no other changes

- [x] T008 [US1] Add `openAddModal()`, `closeAddModal()`, and `onAssignmentCreated(newItem)` methods to `src/app/features/assignments/assignments-view/assignments-view.component.ts`:
  - `openAddModal()`: `bootstrap.Modal.getOrCreateInstance(document.getElementById('assignmentAddModal')).show()`
  - `closeAddModal()`: `bootstrap.Modal.getOrCreateInstance(document.getElementById('assignmentAddModal')).hide()`
  - `onAssignmentCreated(newItem)`: `this.assignmentsList = [...this.assignmentsList, newItem]; this.closeAddModal();`

- [x] T009 [US1] Update `src/app/features/assignments/assignments-view/assignments-view.component.html`:
  - Import `AssignmentAddComponent` in the component's `imports` array (in `.ts` file)
  - Add Bootstrap modal host at the bottom of the template (before closing `</div>`):
    ```html
    <div class="modal fade" id="assignmentAddModal" tabindex="-1"
         data-bs-backdrop="static" data-bs-keyboard="false"
         aria-labelledby="assignmentAddModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content rounded-3 overflow-hidden shadow-lg">
          <app-assignment-add
            [courseId]="courseId"
            (assignmentCreated)="onAssignmentCreated($event)"
            (modalDismissed)="closeAddModal()">
          </app-assignment-add>
        </div>
      </div>
    </div>
    ```

- [x] T010 [US1] Update `src/app/features/content/content-view/content-view.component.ts`:
  - Add `@ViewChild(AssignmentsViewComponent) assignmentsView?: AssignmentsViewComponent`
  - Refactor existing `onAddContent()` to branch on `activeTab`:
    - `'content'` → existing Bootstrap modal show logic (unchanged)
    - `'assignments'` → `this.assignmentsView?.openAddModal()`

**Checkpoint**: US1 complete — instructor can open modal, fill 4 fields, save with no files, and see the new assignment card appended to the list.

---

## Phase 4: User Story 2 — Upload Attachments (Priority: P2)

**Goal**: After filling form fields, instructor optionally selects PDF/MP4 files; system uploads them after Step 1 succeeds; assignment card shows correct attachment count.

**Independent Test**: Fill all fields AND select one `.pdf` file; click Save — confirm Step 1 fires, then Step 2 fires, then success toast fires, and the assignment card shows "1 file(s)".

**Dependency**: Requires T004 (addAttachments service method) from Phase 2.

### Implementation for User Story 2

- [x] T011 [US2] Add `onFilesSelected()`, `removeFile()`, `formatSize()`, and `getFileIcon()` methods to `src/app/features/assignments/assignment-add/assignment-add.component.ts` — copy exactly from `ContentAddComponent`:
  - `onFilesSelected()`: filter by `application/pdf` / `video/mp4`; reject per-file if > 500 MB (SweetAlert2 warning toast); push valid files to `stagedFiles`
  - `removeFile(index)`: splice from `stagedFiles`
  - `formatSize(bytes)`: format to B / KB / MB string
  - `getFileIcon(mimeType)`: return `bi bi-file-earmark-pdf-fill file-icon-pdf` or `bi bi-play-circle-fill file-icon-video`

- [x] T012 [US2] Add `addAttachmentsStep(assignmentId)` and `retryUpload()` to `src/app/features/assignments/assignment-add/assignment-add.component.ts`:
  - `addAttachmentsStep(id)`: call `AssignmentService.addAttachments(id, stagedFiles.map(sf => sf.file))`
    - On success: `emitSuccess(updatedResponse)`
    - On error: `retryMode = true; submitError = 'partial-success message'; isSubmitting = false; assignmentCreated.emit(step1Result); closeModal`
  - `retryUpload()`: guard `createdAssignmentId && retryMode`, reset flags, call `addAttachmentsStep(createdAssignmentId)`
  - Update `submit()` to call `addAttachmentsStep(response.id)` when `stagedFiles.length > 0`

**Checkpoint**: US2 complete — file upload path is fully functional end-to-end.

---

## Phase 5: User Story 3 — Form Validation (Priority: P3)

**Goal**: All required fields show inline error messages when empty/invalid; Save is blocked; oversized/wrong-type files are rejected.

**Independent Test**: Click Save with all fields empty — confirm each field is highlighted red with "This field is required."; confirm Save does not trigger any API call.

**Dependency**: Requires T005-T007 (US1 component scaffold).

### Implementation for User Story 3

- [x] T013 [US3] Update `submit()` in `src/app/features/assignments/assignment-add/assignment-add.component.ts` to accept all four `NgModel` refs and call `.control.markAsTouched()` on each before the empty-check guard
- [x] T014 [US3] Add validation error divs to each field in `src/app/features/assignments/assignment-add/assignment-add.component.html`:
  - Title: `<div class="invalid-feedback" *ngIf="titleInput.invalid && titleInput.touched">This field is required.</div>`
  - Description: same pattern for `descInput`
  - Due Date: same pattern for `dueDateInput`
  - Total Marks: `<div class="invalid-feedback" *ngIf="marksInput.invalid && marksInput.touched">Total Marks must be a positive number.</div>`
  - Add `[class.is-invalid]="fieldInput.invalid && fieldInput.touched"` to each `form-control`
- [x] T015 [US3] Add due-date-in-past non-blocking warning: in `submit()`, after validation passes but before API call, check `new Date(this.dueDate) < new Date()` and display a SweetAlert2 `warning` toast ("Note: Due date is in the past") — allow submission to continue regardless

**Checkpoint**: US3 complete — form validation is fully functional; all three user stories are independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final wiring verification, accessibility cleanup, and permission guard check.

- [x] T016 [P] Verify the `canAdd` / `canAddOrUpdate` permission flag in `src/app/features/assignments/assignments-view/assignments-view.component.ts` is already wired correctly to the `+ Add New Assignment` button's `*ngIf` — no structural change needed, just confirm using `PermissionService.hasPermission('Ass:addOrUpdate')`; add the flag if missing
- [x] T017 [P] Add `id="assignmentAddModalLabel"` to the modal title `<h5>` element in `src/app/features/assignments/assignment-add/assignment-add.component.html` for Bootstrap accessibility
- [x] T018 [P] Confirm `data-bs-backdrop="static"` prevents modal close during `isSubmitting = true` by testing manually; if not, add `[disabled]="isSubmitting"` to the `btn-close-modal` button (already present in template mirror — verify it is wired)
- [x] T019 Smoke test the full happy path: navigate to a course → Assignments tab → click "+ Add New Assignment" → fill all fields → attach a PDF → click Save → verify assignment appears at bottom of list with attachment count → verify only one success toast fires

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)       → No dependencies — start immediately
Phase 2 (Foundation)  → Requires Phase 1 complete — BLOCKS US2 file upload path
Phase 3 (US1)         → Requires Phase 1 complete (can start alongside Phase 2)
Phase 4 (US2)         → Requires Phase 2 (T004) AND Phase 3 (T005 component scaffold)
Phase 5 (US3)         → Requires Phase 3 (T005-T007 component scaffold)
Phase 6 (Polish)      → Requires Phases 3, 4, 5 complete
```

### User Story Dependencies

- **US1 (P1)**: Depends only on Phase 1. Start immediately after T001-T003.
- **US2 (P2)**: Depends on T004 (service method) + US1 component scaffold (T005). Start after US1 is complete.
- **US3 (P3)**: Depends on US1 component scaffold (T005-T007). Can be worked in parallel with US2.

### Parallel Opportunities Within Phases

- **Phase 1**: T002 and T003 can run in parallel.
- **Phase 3**: T006 (HTML) and T007 (CSS) can be started in parallel with T005 (TS logic) since they are separate files.
- **Phase 6**: T016, T017, T018 can all run in parallel.

---

## Parallel Example: User Story 1

```
# These three tasks can proceed concurrently (different files):
T005 — assignment-add.component.ts (logic)
T006 — assignment-add.component.html (template)
T007 — assignment-add.component.css (styles)

# Then sequentially (component must exist first):
T008 — assignments-view.component.ts (modal wiring)
T009 — assignments-view.component.html (modal host)
T010 — content-view.component.ts (@ViewChild + CTA branching)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete **Phase 1** (Setup — T001-T003)
2. Complete **Phase 3 US1** (T005-T010)
3. **STOP and VALIDATE**: Open modal, fill 4 fields, no files, click Save — new card appears at bottom of list
4. Proceed to Phase 2 + Phase 4 for file upload

### Incremental Delivery

1. **Phase 1 + Phase 3** → MVP: Create assignment without files ✅
2. **Phase 2 + Phase 4** → Full: Create assignment with PDF/MP4 attachments ✅
3. **Phase 5** → Quality: Full form validation and past-date warning ✅
4. **Phase 6** → Polish: Permissions, accessibility, smoke test ✅

---

## Notes

- `[P]` tasks touch different files — safe to execute concurrently
- The CSS task (T007) is a verbatim copy with one selector rename — fastest task in the set
- The `submit()` signature will evolve across tasks (T005 → T013); ensure the final version accepts all 4 NgModel refs
- The `retryMode` branch in `addAttachmentsStep` (T012) must emit the Step 1 result before closing the modal, not the Step 2 error response
- Due date conversion: `new Date(this.dueDate).toISOString()` — test with a datetime-local value like `"2026-06-01T23:59"` to confirm UTC output is expected
