# Tasks: Quiz Detail Page & Question Management

**Input**: Design documents from `specs/013-quiz-detail-questions/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Organization**: Tasks grouped by user story (P1–P6) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Exact file paths are included in every task description

## Path Conventions (Lumina Angular Standalone)

- **Feature components**: `src/app/features/quizzes/`
- **Core services**: `src/app/core/services/quiz.service.ts`
- **Model interfaces**: `src/app/models/quiz.model.ts`
- **Global styles / tokens**: `src/styles.css`
- **Routes**: `src/app/app.routes.ts`
- No NgModule files — all components MUST be standalone

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new directories and append foundational model interfaces. No existing code is changed here.

- [x] T001 Create feature directory `src/app/features/quizzes/quiz-detail/` (empty placeholder for component files)
- [x] T002 Create feature directory `src/app/features/quizzes/question-form-modal/` (empty placeholder for modal files)
- [x] T003 Append 5 new TypeScript interfaces to `src/app/models/quiz.model.ts`: `QuizDetailDto`, `QuestionResponseDto`, `QuestionChoiceDto`, `QuestionFormPayload`, `QuizToggleActiveResponse` — exactly as defined in `specs/013-quiz-detail-questions/data-model.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Expand the `QuizService` with all 5 new API methods. This is a hard prerequisite for every user story since all components depend on service calls.

**⚠️ CRITICAL**: No user story component work can begin until this phase is complete.

- [x] T004 In `src/app/core/services/quiz.service.ts`, add the `private questionBaseUrl = 'https://localhost:7289'` property alongside the existing `apiUrl`
- [x] T005 In `src/app/core/services/quiz.service.ts`, update the import line to include the 5 new model types: `QuizDetailDto`, `QuestionResponseDto`, `QuestionFormPayload`, `QuizToggleActiveResponse` (keep existing imports)
- [x] T006 In `src/app/core/services/quiz.service.ts`, add method `getQuizById(id: number): Observable<QuizDetailDto>` — calls `GET ${this.apiUrl}/${id}` and pipes through a new `normalizeDetail()` private helper
- [x] T007 In `src/app/core/services/quiz.service.ts`, add method `toggleQuizActive(id: number): Observable<QuizToggleActiveResponse>` — calls `PATCH ${this.apiUrl}/${id}/toggle-active` with empty body `{}`
- [x] T008 In `src/app/core/services/quiz.service.ts`, add method `addQuestion(quizId: number, payload: QuestionFormPayload): Observable<QuestionResponseDto>` — calls `POST ${this.questionBaseUrl}/Quiz/${quizId}` (absolute path, no `/api` prefix)
- [x] T009 In `src/app/core/services/quiz.service.ts`, add method `updateQuestion(quizId: number, payload: QuestionFormPayload): Observable<QuestionResponseDto>` — calls `POST ${this.questionBaseUrl}/Update/QuizId/${quizId}` (absolute path, no `/api` prefix)
- [x] T010 In `src/app/core/services/quiz.service.ts`, add method `toggleQuestionStatus(quizId: number, questionId: number): Observable<QuestionResponseDto>` — calls `POST ${this.questionBaseUrl}/ToggleStatus/QuizId/${quizId}/QuestionId${questionId}` — **CRITICAL: no slash between `QuestionId` and the parameter value**
- [x] T011 In `src/app/core/services/quiz.service.ts`, add private `normalizeDetail(q: any): QuizDetailDto` method that appends `'Z'` to `scheduledDate` if missing and maps all fields; also add private `normalizeQuestion(qn: any): QuestionResponseDto` helper used inside `normalizeDetail`

**Checkpoint**: All 5 API methods in `QuizService` are complete — any user story component can now consume them.

---

## Phase 3: User Story 1 — View Quiz Details & Questions (Priority: P1) 🎯 MVP

**Goal**: An instructor with `questions:read` permission can navigate from the quiz list to a full quiz detail page showing the quiz header (title, description, scheduled date, total marks, duration, quiz code) and a scrollable list of all question cards with their choices rendered.

**Independent Test**: Navigate to `/dashboard/courses/:courseId/quizzes/:quizId` → verify the page loads, the header matches the quiz data, and each question card shows `questionText`, type badge, marks badge, and a list of choices. A quiz with no questions should show an empty-state message.

### Implementation for User Story 1

- [x] T012 [US1] Create `src/app/features/quizzes/quiz-detail/quiz-detail.component.ts` as a standalone Angular component; inject `ActivatedRoute`, `Router`, `QuizService`, `PermissionService`; read `courseId` and `quizId` from route params in `ngOnInit`; call `quizService.getQuizById(quizId)` and store result in `quiz: QuizDetailDto`; set permission flags `canAddOrUpdateQuiz`, `canAddQuestion`, `canUpdateQuestion`; implement `goBack()` method calling `router.navigate(['/dashboard/courses', this.courseId, 'quizzes'])`; implement loading/error state tracking
- [x] T013 [US1] Create `src/app/features/quizzes/quiz-detail/quiz-detail.component.html` with: (a) a loading spinner `*ngIf="isLoading"`, (b) an error banner `*ngIf="loadError"`, (c) a page-header `div` (dark navy gradient `#001A33 → #002D5B`) containing a "Back to Quizzes" link, the quiz title as `<h1>`, and Bootstrap badge chips for scheduled date (calendar icon), duration (hourglass icon), total marks (star icon), quiz code (copy icon — use existing `copyToClipboard` pattern from `quiz-view.component.html`), and a description `<p>`; (d) a section row with "Questions" heading; (e) an empty-state `*ngIf="quiz.quizQuestions.length === 0"` card; (f) a `*ngFor` loop over `quiz.quizQuestions` rendering each question as a `content-card mb-4` div (matching the pattern in `quiz-view.component.html`) showing: number badge, question text, type badge (`MultipleChoice` = blue, `TrueFalse` = cyan), marks badge (e.g. "5 pts"), allow-looking-down indicator icon, and a choices list
- [x] T014 [US1] In `src/app/features/quizzes/quiz-detail/quiz-detail.component.html`, inside the `*ngFor` choices loop, add correct-answer highlighting: apply CSS classes `text-success`, `bg-success`, `bg-opacity-10`, `border border-success rounded` to each choice `div` when `choice.isCorrect === true`; prepend a `<i class="bi bi-check-circle-fill text-success me-2"></i>` icon to correct choices
- [x] T015 [US1] Create `src/app/features/quizzes/quiz-detail/quiz-detail.component.css` with: `.page-header` gradient style, `.content-card` hover styles matching the existing quiz/assignment card pattern (border-color `rgba(65, 179, 227, 0.4)`, box-shadow, bg `rgba(65, 179, 227, 0.03)`), `.content-number-badge` style (consistent with `quiz-view.component.css`), `.question-type-badge` and `.marks-badge` styles
- [x] T016 [US1] Register the route in `src/app/app.routes.ts`: add `import { QuizDetailComponent } from './features/quizzes/quiz-detail/quiz-detail.component'` at the top; replace the existing redirect block `{ path: 'courses/:courseId/quizzes/:quizId', redirectTo: ..., pathMatch: 'full' }` with `{ path: 'courses/:courseId/quizzes/:quizId', component: QuizDetailComponent, canActivate: [permissionGuard], data: { permission: 'questions:read' } }`

**Checkpoint**: US1 complete — instructor can navigate to the quiz detail page and see the full quiz structure with questions and correct-answer highlighting. Empty-state renders for quizzes without questions.

---

## Phase 4: User Story 2 — Review Correct Answers (Priority: P2)

**Goal**: Correct choices on every question card are visually distinguished from incorrect choices using a green/teal highlight + checkmark icon, allowing instructors to audit the answer key at a glance without additional interaction.

**Independent Test**: Load the quiz detail page for a quiz with both MultipleChoice and TrueFalse questions → verify each question's correct choice (where `isCorrect === true`) has a green/teal tint background and a `bi-check-circle-fill` checkmark, while incorrect choices are styled neutrally.

### Implementation for User Story 2

- [x] T017 [US2] In `src/app/features/quizzes/quiz-detail/quiz-detail.component.css`, add `.correct-choice` class: `background-color: rgba(40, 167, 69, 0.08); border: 1px solid rgba(40, 167, 69, 0.3); border-radius: 6px; color: #155724; font-weight: 500;` and `.incorrect-choice` class: `background-color: transparent; border: 1px solid #dee2e6; border-radius: 6px;`
- [x] T018 [US2] In `src/app/features/quizzes/quiz-detail/quiz-detail.component.html`, update the choices `*ngFor` loop to use `[class.correct-choice]="choice.isCorrect"` and `[class.incorrect-choice]="!choice.isCorrect"` on each choice element; ensure the `bi-check-circle-fill` icon is `*ngIf="choice.isCorrect"` and a neutral placeholder spacer is shown for incorrect choices so all choices align visually

**Checkpoint**: US2 complete — correct answers are instantly identifiable at a glance via green tint + checkmark.

---

## Phase 5: User Story 3 — Add a New Question (Priority: P3)

**Goal**: An instructor with `questions:add` permission can click "+ Add Question", fill in a reactive form modal (question text, type, marks, allow-looking-down, dynamic choices), and submit to create a new question that immediately appears at the bottom of the question list.

**Independent Test**: Click "+ Add Question" → select MultipleChoice → fill question text → add 3 choices → select correct answer radio → submit → verify new question card appears at the bottom of the list. Repeat for TrueFalse: choices must auto-lock to "True"/"False".

### Implementation for User Story 3

- [x] T019 [US3] Create `src/app/features/quizzes/question-form-modal/question-form-modal.component.ts` as a standalone component with: `@Input() quizId: number`, `@Input() questionData: QuestionResponseDto | null = null`; `@Output() questionSaved = new EventEmitter<QuestionResponseDto>()`; `@Output() modalDismissed = new EventEmitter<void>()`; inject `FormBuilder` and `QuizService`; build the reactive form with `FormGroup` containing controls `questionText` (required), `questionType` (default `0`), `marks` (required, min 0.01), `isAllowableToLookDown` (default `false`), `correctAnswerIndex` (default `0`), and `choices` as a `FormArray`
- [x] T020 [US3] In `question-form-modal.component.ts`, initialize the `FormArray` with 2 empty `FormControl` entries on component init (for add mode); subscribe to `questionType` valueChanges: when value changes to `1` (TrueFalse), clear the array and push two `FormControl({value: 'True', disabled: true})` and `FormControl({value: 'False', disabled: true})`; when value changes to `0` (MultipleChoice), clear the array and push 2 empty editable `FormControl('')` entries; also implement `addChoice()` method (pushes new empty `FormControl`) and `removeChoice(index)` method (removes at index, ensuring minimum of 2 remain)
- [x] T021 [US3] In `question-form-modal.component.ts`, implement `submit()` method: (a) validate form, call `markAllAsTouched()` and return if invalid; (b) get raw values from `choices` FormArray using `getRawValue()` to include disabled TrueFalse controls; (c) validate minimum 2 non-empty choices if `questionType === 0`, set `choicesValidationError = true` and return if fewer than 2; (d) build `QuestionFormPayload` with `id: this.questionData ? this.questionData.id : 0`; (e) call `quizService.addQuestion(this.quizId, payload)` (when `questionData` is null) or `quizService.updateQuestion(this.quizId, payload)` (when editing); (f) on success emit `questionSaved`; (g) on error show SweetAlert2 error toast matching the existing pattern
- [x] T022 [US3] Create `src/app/features/quizzes/question-form-modal/question-form-modal.component.html` with: `modal-header` (dark navy gradient, "Add Question" / "Edit Question" title based on `questionData` being null, X close button); `modal-body` containing: (a) Question Text textarea (required, invalid feedback); (b) Row with Question Type dropdown (`<select>`: "Multiple Choice" / "True or False") + Marks number input; (c) Allow Looking Down checkbox; (d) Answer Choices section: `*ngFor` over `choices.controls` showing [radio button for `correctAnswerIndex`] + [text input bound to each `FormControl`] + [remove button — hidden when TrueFalse or when only 2 choices remain]; (e) "+ Add Choice" button hidden when `questionType === 1`; (f) validation error `*ngIf="choicesValidationError"` saying "At least 2 choices are required."; `modal-footer` with Cancel and Save (with spinner) buttons
- [x] T023 [US3] Create `src/app/features/quizzes/question-form-modal/question-form-modal.component.css` with styles for the modal header gradient, `.choice-row` layout (flex, align-items-center, gap), `.choice-input` (flex-grow), radio input styling, and the disabled-state appearance for TrueFalse locked choice inputs
- [x] T024 [US3] In `src/app/features/quizzes/quiz-detail/quiz-detail.component.ts`, add: (a) `selectedQuestion: QuestionResponseDto | null = null`; (b) `openAddQuestionModal()` method that sets `selectedQuestion = null` then opens Bootstrap modal `id="questionFormModal"`; (c) `onQuestionSaved(q: QuestionResponseDto)` event handler: if `selectedQuestion` was null (add mode), push `q` to `quiz!.quizQuestions`; show SweetAlert2 success toast "Question added"; close modal; (d) import `QuestionFormModalComponent` in the `imports` array
- [x] T025 [US3] In `src/app/features/quizzes/quiz-detail/quiz-detail.component.html`, add: (a) `*ngIf="canAddQuestion"` guard on the "+ Add Question" button that calls `openAddQuestionModal()`; (b) the Bootstrap modal host `<div class="modal fade" id="questionFormModal" ...>` containing `<app-question-form-modal [quizId]="quiz!.id" [questionData]="selectedQuestion" (questionSaved)="onQuestionSaved($event)" (modalDismissed)="closeQuestionModal()">` 

**Checkpoint**: US3 complete — instructor can add MultipleChoice and TrueFalse questions; new cards appear at list bottom without page reload.

---

## Phase 6: User Story 4 — Edit an Existing Question (Priority: P4)

**Goal**: Clicking "Edit" on any question card opens the same modal pre-populated with the existing question values. After saving, the question card updates in place.

**Independent Test**: Click "Edit" on a MultipleChoice question → verify all fields (text, type, marks, choices, correct radio) are pre-populated → change the question text → submit → verify the card updates in place with the new text. Repeat for TrueFalse.

### Implementation for User Story 4

- [x] T026 [US4] In `question-form-modal.component.ts`, implement `ngOnChanges(changes: SimpleChanges)`: when `questionData` input changes and is non-null, (a) map `questionType` string to int: `const typeInt = this.questionData.questionType === 'TrueFalse' ? 1 : 0`; (b) find `correctAnswerIndex` by `this.questionData.questionChoices.findIndex(c => c.isCorrect)`; (c) clear the choices `FormArray` and push each `questionData.questionChoices` entry as a `FormControl` — disabled if `typeInt === 1`; (d) call `form.patchValue({ questionText, questionType: typeInt, marks, isAllowableToLookDown, correctAnswerIndex })`; when `questionData` is null (add mode), reset the form and reinitialize the FormArray with 2 empty editable controls
- [x] T027 [US4] In `src/app/features/quizzes/quiz-detail/quiz-detail.component.ts`, add `openEditQuestionModal(question: QuestionResponseDto)` method: set `this.selectedQuestion = question`, then open the Bootstrap modal `id="questionFormModal"`; update `onQuestionSaved(q: QuestionResponseDto)`: if `selectedQuestion` was non-null (edit mode), find the question in `quiz!.quizQuestions` by `id` and replace it with `q`; show SweetAlert2 success toast "Question updated"; close modal
- [x] T028 [US4] In `src/app/features/quizzes/quiz-detail/quiz-detail.component.html`, add to each question card (inside `(click)="$event.stopPropagation()"` wrapper): `<button *ngIf="canUpdateQuestion" class="btn btn-edit-action d-flex align-items-center gap-1" (click)="openEditQuestionModal(question)"><i class="bi bi-pencil-square"></i> Edit</button>`

**Checkpoint**: US4 complete — edit modal pre-populates correctly for both question types; cards update in-place on save.

---

## Phase 7: User Story 5 — Toggle Quiz Active Status (Priority: P5)

**Goal**: An instructor with `Quiz:addOrUpdate` permission can flip the quiz's `isActive` state from the detail page header using an elegant toggle switch. The switch reflects the current state and updates immediately on click.

**Independent Test**: Open the quiz detail for an active quiz → confirm toggle is ON → click the toggle → confirm `quiz.isActive` is now `false` and the toggle visually reflects inactive state without a page reload.

### Implementation for User Story 5

- [x] T029 [US5] In `src/app/features/quizzes/quiz-detail/quiz-detail.component.ts`, add `isTogglingQuiz = false` flag and implement `toggleQuizActive()` method: set `isTogglingQuiz = true`; call `quizService.toggleQuizActive(quiz!.id)`; on success, update `quiz!.isActive` from the response `{ isActive }` value; show SweetAlert2 toast "Quiz is now Active/Inactive"; set `isTogglingQuiz = false`; on error, show error toast and revert the toggle visually by NOT updating `quiz.isActive`
- [x] T030 [US5] In `src/app/features/quizzes/quiz-detail/quiz-detail.component.html`, inside the page header section, add `*ngIf="canAddOrUpdateQuiz"` guarded block: a Bootstrap form-check toggle switch `<div class="form-check form-switch">` with `<input class="form-check-input" type="checkbox" [checked]="quiz.isActive" (change)="toggleQuizActive()" [disabled]="isTogglingQuiz">` and a `<label>` showing "Active" / "Inactive" text reflecting the current state; add a small spinner `*ngIf="isTogglingQuiz"` next to the toggle

**Checkpoint**: US5 complete — quiz active state can be flipped from the detail page header; toggle is hidden for unauthorized users.

---

## Phase 8: User Story 6 — Toggle Individual Question Active Status (Priority: P6)

**Goal**: Each question card has a toggle button (visible only to users with `questions:update` permission) that flips the question's `isActive` state. Inactive question cards are visually dimmed (reduced opacity) with an "Inactive" badge; all content remains readable.

**Independent Test**: Click the toggle on an active question card → confirm the card dims and shows "Inactive" badge → click again → confirm the card returns to full opacity with no "Inactive" badge. Verify the toggle button is hidden when the user lacks `questions:update`.

### Implementation for User Story 6

- [x] T031 [US6] In `src/app/features/quizzes/quiz-detail/quiz-detail.component.ts`, implement `toggleQuestionStatus(question: QuestionResponseDto)` method: call `quizService.toggleQuestionStatus(quiz!.id, question.id)`; on success, find the question in `quiz!.quizQuestions` by `id` and replace it entirely with the API response (which contains the new `isActive` state); show SweetAlert2 toast "Question is now Active/Inactive"; on error, show error toast without updating local state
- [x] T032 [US6] In `src/app/features/quizzes/quiz-detail/quiz-detail.component.html`, on each question card's `div`, add `[class.opacity-50]="!question.isActive"`; inside the card header, add `<span *ngIf="!question.isActive" class="badge bg-secondary ms-2">Inactive</span>`; inside the action buttons section (already `(click)="$event.stopPropagation()"`), add `<button *ngIf="canUpdateQuestion" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" (click)="toggleQuestionStatus(question)" [title]="question.isActive ? 'Deactivate' : 'Activate'"><i [class]="question.isActive ? 'bi bi-toggle-on text-success' : 'bi bi-toggle-off'"></i></button>`
- [x] T033 [US6] In `src/app/features/quizzes/quiz-detail/quiz-detail.component.css`, add `.opacity-50 .correct-choice { opacity: 0.7; }` to preserve choice readability within dimmed inactive cards; also add a subtle transition `transition: opacity 0.25s ease` on `.content-card` for smooth dim/undim animation

**Checkpoint**: US6 complete — inactive questions are visually dimmed with an "Inactive" badge; all content and action buttons remain accessible; toggle is hidden for unauthorized users.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final UX hardening, error boundary coverage, and permission gating verification across all 6 user stories.

- [x] T034 In `src/app/features/quizzes/quiz-detail/quiz-detail.component.html`, add a 404/not-found error state: `*ngIf="!isLoading && notFoundError"` renders a centered card with `bi-journal-x` icon and message "Quiz not found or you don't have access."
- [x] T035 In `src/app/features/quizzes/quiz-detail/quiz-detail.component.ts`, update error handling in `loadData()`: check `err.status === 404` and set `notFoundError = true`; for all other errors set `loadError` string; this ensures the 404 edge case from the spec is handled gracefully
- [x] T036 In `src/app/features/quizzes/question-form-modal/question-form-modal.component.ts`, add `isSubmitting = false` flag; set to `true` before API call; reset to `false` in both `next` and `error` handlers; bind `[disabled]="isSubmitting"` on the Save button and show a Bootstrap spinner `*ngIf="isSubmitting"` inside the Save button
- [x] T037 [P] In `src/app/features/quizzes/quiz-detail/quiz-detail.component.html`, add `parseDurationToMinutes(quiz.duration)` pipe usage for the duration badge (reuse the same helper already in `quiz-view.component.ts`); implement the same `parseDurationToMinutes(duration: string): string` method in `quiz-detail.component.ts` (copy from `quiz-view.component.ts`)
- [x] T038 [P] Manual permission-gating verification pass: confirm (a) "+ Add Question" hidden without `questions:add`; (b) Edit + Toggle buttons hidden without `questions:update`; (c) Active toggle hidden without `Quiz:addOrUpdate`; (d) entire page redirects without `questions:read` — check route guard behavior in browser
- [x] T039 [P] Verify the TrueFalse type-switch edge case: open modal → select MultipleChoice → add 4 choices → switch to TrueFalse → choices lock to True/False → switch back to MultipleChoice → choices reset to 2 empty inputs (verify no stale data leaks)
- [x] T040 Run `ng build --configuration=development` in `d:\GRADUATION PROJECT\LMS-Project` to confirm zero TypeScript compilation errors before marking feature complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (T001-T003 complete)
- **Phase 3–8 (User Stories)**: ALL depend on Phase 2 (T004-T011 complete) — no user story component can compile without the service methods
- **Phase 9 (Polish)**: Depends on all desired user story phases being complete

### User Story Dependencies

- **US1 (P1)**: Depends only on Phase 2 — no dependency on other user stories
- **US2 (P2)**: Depends only on US1 component files existing (shares same component files T012-T015)
- **US3 (P3)**: Depends on Phase 2 + US1 (needs the quiz detail page to exist as host for the modal)
- **US4 (P4)**: Depends on US3 (reuses `QuestionFormModalComponent` created in US3)
- **US5 (P5)**: Depends on US1 (adds the toggle to the page header created in US1) — independent of US3/US4
- **US6 (P6)**: Depends on US1 (adds buttons to question cards created in US1) — independent of US3/US4

### Within Each User Story

- Models (Phase 1) before services (Phase 2)
- Services before components
- Component TypeScript before HTML template
- HTML template before CSS (CSS can be written in parallel with HTML once class names are decided)

### Parallel Opportunities

- T001 and T002 (directory creation) can run in parallel
- T004 through T011 (service methods) are all in the same file, so must be sequential
- T015 (detail CSS) can be written in parallel with T013 (detail HTML) once T012 (TS) defines the class names used
- T023 (modal CSS) can be written in parallel with T022 (modal HTML)
- T034, T037, T038, T039 in Phase 9 are all marked [P] and can proceed concurrently

---

## Parallel Example: User Story 3

```text
# After T019 (modal TS skeleton) is done, these can run in parallel:
Task T022: question-form-modal.component.html (template)
Task T023: question-form-modal.component.css (styles)

# After T024 (detail TS update) is done:
Task T025: quiz-detail.component.html modal host binding
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational service methods (T004–T011)
3. Complete Phase 3: US1 — quiz detail page with question cards (T012–T016)
4. Complete Phase 4: US2 — correct answer highlighting (T017–T018)
5. **STOP and VALIDATE**: Navigate to a quiz, verify header data, question cards, correct answer green tint
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → service layer ready
2. US1 + US2 → Read-only quiz detail with correct answer audit ✅
3. US3 → Add questions ✅
4. US4 → Edit questions ✅
5. US5 → Toggle quiz active ✅
6. US6 → Toggle question active ✅
7. Phase 9 → Polish and harden ✅

---

## Notes

- `[P]` tasks = different files or independent concerns with no blocking dependencies
- `[Story]` label maps each task to its user story for traceability
- The `choices` FormArray uses `getRawValue()` on submit — NOT `.value` — to capture disabled TrueFalse controls
- **No slash** between `QuestionId` and the question ID parameter in the toggle URL (see research.md Finding 2)
- `questionType` comes back as a string from the API but must be sent as int `0` or `1` — map explicitly in edit mode (see research.md Finding 4)
- Commit after each phase checkpoint for clean rollback points
