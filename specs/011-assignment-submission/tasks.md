# Tasks: Assignment Submission & Grading

**Input**: Design documents from `specs/011-assignment-submission/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

## Path Conventions (Lumina Angular Standalone)

- **Feature components**: `src/app/features/assignments/`
- **Core services**: `src/app/core/services/`
- **Model interfaces**: `src/app/models/assignment.model.ts`
- **Global styles**: `src/styles.css`
- Do NOT create NgModule files; all components MUST be standalone

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add new model interfaces and scaffold the new service before any user story work begins.

- [X] T001 Append 4 new interfaces to `src/app/models/assignment.model.ts`: `AssignmentSubmissionAttachmentDto`, `AssignmentSubmissionResponseDto`, `CreateSubmissionDto`, `GradeSubmissionDto` — exact field types from `data-model.md`
- [X] T002 Create `src/app/core/services/assignment-submission.service.ts` as an `@Injectable({ providedIn: 'root' })` stub with the 5 method signatures (no implementation yet): `submitAssignment`, `getStudentSubmissions`, `getSubmissionsForAssignment`, `deleteSubmission`, `gradeSubmission`

**Checkpoint**: Models and service shell exist. All user story phases can now begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement all service methods so every user story has a working API layer.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Implement `submitAssignment(assignmentId, textSubmission, files)` in `src/app/core/services/assignment-submission.service.ts` — build `FormData` with fields `assignmentId`, `textSubmission`, `attachmentFiles`; POST to `/api/AssignmentSubmission/Assignment/Submit`; normalize response using a private `normalizeSubmission(raw)` helper that handles both camelCase and PascalCase keys
- [X] T004 [P] Implement `getStudentSubmissions()` in `src/app/core/services/assignment-submission.service.ts` — GET `/api/AssignmentSubmission/Student/Assignment/Submissions`; return `Observable<AssignmentSubmissionResponseDto[]>`; apply `normalizeSubmission` to each item
- [X] T005 [P] Implement `getSubmissionsForAssignment(assignmentId)` in `src/app/core/services/assignment-submission.service.ts` — GET `/api/AssignmentSubmission/Assignment/{assignmentId}/Students`; return `Observable<AssignmentSubmissionResponseDto[]>`; apply `normalizeSubmission`
- [X] T006 [P] Implement `deleteSubmission(submissionId)` in `src/app/core/services/assignment-submission.service.ts` — DELETE `/api/AssignmentSubmission/Assignment/Submission/{submissionId}`; return `Observable<void>`
- [X] T007 [P] Implement `gradeSubmission(submissionId, dto)` in `src/app/core/services/assignment-submission.service.ts` — PUT `/api/AssignmentSubmission/Assignment/Submission/{submissionId}/Grade`; body `{ grade, feedback }`; return `Observable<AssignmentSubmissionResponseDto>`; apply `normalizeSubmission`

**Checkpoint**: All 5 API methods functional. User story phases can now begin.

---

## Phase 3: User Story 1 — Student Submits Assignment (Priority: P1) 🎯 MVP

**Goal**: A student can see an "Add Submission" button on assignments where they have no submission, open a modal, enter text and/or attach files, and save successfully. The card state updates to "Submitted" after save.

**Independent Test**: Log in as a student → navigate to a course with assignments → confirm "Add Submission" button appears on an unsubmitted assignment → click it → fill text → attach a valid PDF → click Save → confirm card now shows "Edit Submission" button and "Submitted" badge.

### Implementation for User Story 1

- [X] T008 [US1] Update `src/app/features/assignments/assignments-view/assignments-view.component.ts`: add `canSubmit` permission flag (`Ass:solve`), inject `AssignmentSubmissionService`, add `submissionMap: Map<number, AssignmentSubmissionResponseDto>`, replace single `loadAssignments()` with `loadData()` using `forkJoin([getAssignmentsByCourseId, getStudentSubmissions])` — build submissionMap on success; add `getSubmissionState(assignmentId): 'none'|'submitted'|'graded'` helper; add `isLate(submission, assignment): boolean` helper
- [X] T009 [US1] Create `src/app/features/assignments/submission-add-edit/submission-add-edit.component.ts` — standalone component; `@Input() assignment: AssignmentResponseDto`; `@Input() existingSubmission?: AssignmentSubmissionResponseDto`; `@Output() submissionSaved = new EventEmitter<AssignmentSubmissionResponseDto>()`; `@Output() modalDismissed = new EventEmitter<void>()`; state: `textSubmission`, `stagedFiles`, `isSubmitting`, `submitError`, `retryMode`; `submit()` calls `submitAssignment()`; `cancel()` resets and emits `modalDismissed`; file methods: `onFilesSelected()` (PDF/MP4 only, ≤500 MB), `removeFile(i)`, `formatSize(bytes)`, `getFileIcon(mime)`
- [X] T010 [US1] Create `src/app/features/assignments/submission-add-edit/submission-add-edit.component.html` — Bootstrap modal inner content (no outer `<div class="modal">`): header with "Add Submission" / "Edit Submission" title (conditional on `existingSubmission`); textarea for `textSubmission`; upload zone + staged files list identical to `assignment-add.component.html`; progress bar when `isSubmitting`; inline error alert when `submitError`; footer Cancel / Save buttons
- [X] T011 [US1] Create `src/app/features/assignments/submission-add-edit/submission-add-edit.component.css` — copy `src/app/features/assignments/assignment-add/assignment-add.component.css` verbatim; add `.badge-submitted { background: var(--lms-primary); color: #fff; }` and `.btn-submit-add { background: linear-gradient(135deg, #41B3E3, #1a8ab5); color: #fff; border: none; }` and `.btn-submit-edit { border: 2px solid var(--lms-primary); color: var(--lms-primary); background: transparent; }`
- [X] T012 [US1] Add Bootstrap modal host for submission modal to `src/app/features/assignments/assignments-view/assignments-view.component.html` — `<div class="modal fade" id="submissionAddEditModal" ...>` containing `<app-submission-add-edit [assignment]="selectedAssignment" [existingSubmission]="selectedSubmission" (submissionSaved)="onSubmissionSaved($event)" (modalDismissed)="closeSubmissionModal()"></app-submission-add-edit>`; import `SubmissionAddEditComponent` in the component's `imports` array
- [X] T013 [US1] Add student action buttons to each assignment card in `src/app/features/assignments/assignments-view/assignments-view.component.html`: `*ngIf="canSubmit && getSubmissionState(item.id) === 'none'"` → "Add Submission" button; `*ngIf="canSubmit && getSubmissionState(item.id) === 'submitted'"` → "Edit Submission" button + "Submitted" badge + optional "Late" badge (`*ngIf="isLate(submissionMap.get(item.id)!, item)"`)
- [X] T014 [US1] Add `openSubmissionModal(assignment, existingSubmission)`, `closeSubmissionModal()`, and `onSubmissionSaved(updated)` methods to `src/app/features/assignments/assignments-view/assignments-view.component.ts` — `onSubmissionSaved` updates `submissionMap` with the new entry and hides the modal; add `selectedAssignment` and `selectedSubmission` state properties

**Checkpoint**: US1 fully functional — student can add a new submission end-to-end.

---

## Phase 4: User Story 3 — Student Edits Submission (Priority: P2)

**Goal**: A student with an existing ungraded submission can click "Edit Submission", see their previous text pre-filled in the modal, make changes, and save. The edit flow deletes the old submission first, then creates a new one. If the new submission fails, an inline error is shown.

**Independent Test**: Log in as a student who already submitted → click "Edit Submission" → verify `textSubmission` is pre-filled → change text → click Save → verify submission map updates to the new submission.

### Implementation for User Story 3

- [X] T015 [US3] Update `submit()` in `src/app/features/assignments/submission-add-edit/submission-add-edit.component.ts` to branch on `existingSubmission`: if truthy, call `deleteSubmission(existingSubmission.id)` first; on delete success call `submitAssignment()`; on submit failure set `submitError` to "Your previous submission was deleted but the new one could not be saved. Please retry or close." and set `retryMode = true`; on full success emit `submissionSaved`
- [X] T016 [US3] Update `openSubmissionModal()` in `src/app/features/assignments/assignments-view/assignments-view.component.ts` to pass `submissionMap.get(assignment.id)` as `existingSubmission` when state is `'submitted'`; pre-populate `textSubmission` input in the modal component via `ngOnChanges` or `ngOnInit` from `existingSubmission?.textSubmission`
- [X] T017 [US3] Add retry button to `src/app/features/assignments/submission-add-edit/submission-add-edit.component.html` inside the error alert: `*ngIf="retryMode"` → "Retry" button that calls `retrySubmit()` which re-calls `submitAssignment()` using `createdAssignmentId` stored during the failed edit; also update modal title to be dynamic: "Add Submission" vs "Edit Submission"

**Checkpoint**: US3 complete — edit flow with delete-then-resubmit and partial-failure handling works.

---

## Phase 5: User Story 4 — Student Views Grade and Feedback (Priority: P3)

**Goal**: A student whose submission has been graded sees the grade and feedback displayed inside the expanded assignment card instead of action buttons.

**Independent Test**: Log in as a student with a graded submission → expand the assignment card → verify grade (e.g., "85 / 100") and feedback text are displayed; verify "Edit Submission" button is NOT shown.

### Implementation for User Story 4

- [X] T018 [US4] Add graded state UI to `src/app/features/assignments/assignments-view/assignments-view.component.html` inside the card's expanded body section: `*ngIf="getSubmissionState(item.id) === 'graded'"` → grade panel showing `submissionMap.get(item.id)?.grade` / `item.totalMarks` and `submissionMap.get(item.id)?.feedback`; add "Graded" badge alongside the "Submitted" badge when state is graded
- [X] T019 [US4] Add `.grade-panel`, `.grade-value`, `.feedback-text`, `.badge-graded` CSS to `src/app/features/assignments/assignments-view/assignments-view.component.css` — grade value in large bold cyan text; feedback in smaller muted italic; badge in green (`#28a745`)

**Checkpoint**: US4 complete — graded state visible to students.

---

## Phase 6: User Story 2 — Instructor Grading Dashboard (Priority: P1)

**Goal**: An instructor can click "View Submissions" on any assignment card, navigate to a dedicated page listing all student submissions, click a file to open it in a new tab, and open a grading modal to submit a grade and optional feedback.

**Independent Test**: Log in as an instructor → navigate to Assignments tab → click "View Submissions" → verify the URL changes to `/courses/:courseId/assignments/:assignmentId/submissions` → verify a table of student submissions is shown → click an attachment → verify it opens in a new tab → click "Grade" → enter 90 and feedback → click Save → verify grade appears in the row.

### Implementation for User Story 2

- [X] T020 [US2] Add route to `src/app/app.routes.ts`: `{ path: 'courses/:courseId/assignments/:assignmentId/submissions', loadComponent: () => import('./features/assignments/assignment-submissions-list/assignment-submissions-list.component').then(m => m.AssignmentSubmissionsListComponent) }`
- [X] T021 [US2] Create `src/app/features/assignments/assignment-submissions-list/assignment-submissions-list.component.ts` — standalone; inject `ActivatedRoute`, `AssignmentSubmissionService`, `PermissionService`, `Router`; read `courseId` and `assignmentId` from route params; `canGrade = permissionService.hasPermission('Ass:Grade')`; on init call `getSubmissionsForAssignment(assignmentId)`; `openFile(url)` → `window.open(url, '_blank')`; `openGradeModal(submission)` → sets `selectedSubmission` and opens Bootstrap modal `gradeModal`; `onGradeSaved(updated)` → updates local list; `goBack()` → `router.navigate(['/courses', courseId])`
- [X] T022 [US2] Create `src/app/features/assignments/assignment-submissions-list/assignment-submissions-list.component.html` — page header with back button; loading spinner; empty state; Bootstrap table listing each submission: student ID, `submittedAt` date, late badge if applicable, attachment list (each file is a clickable `<button>` calling `openFile(att.fileUrl)`), grade/feedback column (shows grade if graded else "Pending"), and "Grade" action button (`*ngIf="canGrade && sub.grade === null"`); Bootstrap modal host for grade modal at bottom
- [X] T023 [US2] Create `src/app/features/assignments/assignment-submissions-list/assignment-submissions-list.component.css` — table styling consistent with Lumina; `.btn-open-file` as small outlined cyan button; `.badge-late` red; `.badge-pending` muted; `.grade-cell` bold cyan
- [X] T024 [US2] Create `src/app/features/assignments/grade-submission-modal/grade-submission-modal.component.ts` — standalone; `@Input() submission: AssignmentSubmissionResponseDto`; `@Output() gradeSaved = new EventEmitter<AssignmentSubmissionResponseDto>()`; `@Output() modalDismissed = new EventEmitter<void>()`; state: `grade: number | null`, `feedback: string`, `isSubmitting`, `submitError`; `submit(gradeInput, feedbackInput)` validates grade required + positive, calls `gradeSubmission(submission.id, { grade, feedback })`; on success emits `gradeSaved`
- [X] T025 [US2] Create `src/app/features/assignments/grade-submission-modal/grade-submission-modal.component.html` — modal inner content: header "Grade Submission"; body with numeric grade input (required, min 1) and optional feedback textarea; validation error divs; progress bar when submitting; inline error alert; footer Cancel / Save Grade buttons
- [X] T026 [US2] Create `src/app/features/assignments/grade-submission-modal/grade-submission-modal.component.css` — copy `assignment-add.component.css`; rename `.assignment-add-header` → `.grade-modal-header`
- [X] T027 [US2] Add "View Submissions" button to each assignment card in `src/app/features/assignments/assignments-view/assignments-view.component.html`: `*ngIf="canReadAll"` → `[routerLink]="['/courses', courseId, 'assignments', item.id, 'submissions']"`; add `canReadAll = permissionService.hasPermission('AssSubmission:readAll')` flag to `assignments-view.component.ts`; import `RouterLink` in the component's `imports` array

**Checkpoint**: US2 complete — full instructor grading workflow functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Permission gating verification, accessibility, loading/error states, and smoke test.

- [X] T028 [P] Verify all permission flags are correctly checked in `assignments-view.component.ts`: `canSubmit` (`Ass:solve`), `canReadAll` (`AssSubmission:readAll`); confirm `canGrade` (`Ass:Grade`) is set in `assignment-submissions-list.component.ts` — no action buttons visible to unauthorized users
- [X] T029 [P] Add `aria-label` attributes to all new action buttons and modal triggers in `assignments-view.component.html` and `assignment-submissions-list.component.html`; confirm `data-bs-backdrop="static"` on submission modal prevents close during `isSubmitting = true`
- [X] T030 [P] Add loading spinner and error banner to `assignment-submissions-list.component.html` matching the pattern from `assignments-view.component.html` (spinner + retry button on load error)
- [ ] T031 Smoke test the full student happy path: navigate to course → Assignments tab → confirm "Add Submission" visible → submit with text + PDF → confirm "Submitted" badge appears → click "Edit Submission" → change text → save → confirm submission updates
- [ ] T032 Smoke test the full instructor happy path: navigate to "View Submissions" → confirm student list loads → click attachment → confirm new tab opens → click "Grade" → enter grade + feedback → confirm grade appears in table row

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 — first story to implement
- **Phase 4 (US3)**: Depends on Phase 3 (builds on the submission modal)
- **Phase 5 (US4)**: Depends on Phase 2 only (reads from submissionMap built in US1)
- **Phase 6 (US2)**: Depends on Phase 2 only (separate page, independent of US1 modal)
- **Phase 7 (Polish)**: Depends on all phases complete

### Parallel Opportunities

- T003–T007 can all run in parallel (different service methods, same file — be careful of merge conflicts; implement sequentially if solo)
- T009, T011 can run in parallel (different files)
- T021, T024 can run in parallel (different components)
- T022, T025 can run in parallel (different HTML files)
- T023, T026 can run in parallel (different CSS files)
- T028, T029, T030 can run in parallel (different files)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Models & service shell
2. Complete Phase 2: All service methods
3. Complete Phase 3: Student submit flow (US1)
4. **STOP and VALIDATE**: Student can add a submission end-to-end
5. Continue with remaining phases

### Incremental Delivery

1. Phases 1–2 → Foundation ready
2. Phase 3 (US1) → Student can submit → validate independently
3. Phase 4 (US3) → Student can edit → validate independently
4. Phase 5 (US4) → Student can see grade → validate independently
5. Phase 6 (US2) → Instructor grading workflow → validate independently
6. Phase 7 → Polish and smoke test

---

## Notes

- [P] = different files, safe to parallelize
- Each user story is independently testable after its phase completes
- Edit modal (US3) reuses the same `SubmissionAddEditComponent` as US1 — no new component needed
- The `submissionMap` built in `loadData()` drives all student-facing state; keep it updated on every `onSubmissionSaved` call
- Attachment file opening uses `window.open(url, '_blank')` — no additional library needed
