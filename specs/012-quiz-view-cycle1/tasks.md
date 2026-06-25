# Tasks: Quiz View – Cycle 1

**Input**: Design documents from `specs/012-quiz-view-cycle1/`  
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅ · quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story this task belongs to (US1–US4)
- Exact file paths are included in every task description

## Path Conventions (Lumina Angular Standalone)

- Feature components: `src/app/features/<feature-name>/`
- Core services (API/business logic): `src/app/core/services/`
- Model interfaces: `src/app/models/`  *(project uses this path, not `core/models/`)*
- Stitch design reference: `stitch-designs/<feature-name>/`
- Do NOT create NgModule files; all components MUST be standalone

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Model interface + service — shared foundations that all user stories depend on.

- [x] T002 [P] Create quiz model interfaces in `src/app/models/quiz.model.ts` — define `QuizListItemDto` (id, title, description, scheduledDate, duration, quizCode) and `QuizCreateUpdateDto` (id|null, title, description, scheduledDate, duration, totalMarks, isActive)
- [x] T003 [P] Create `QuizService` in `src/app/core/services/quiz.service.ts` — implement `getQuizzesByCourseId(courseId)`, `createOrUpdateQuiz(courseId, dto)`, `deleteQuiz(id)` using `HttpClient`; add `normalize(q: any): QuizListItemDto` private helper following the `assignment.service.ts` pattern

**Checkpoint**: Model interfaces typed, service compiles without errors.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `QuizAddEditComponent` (modal form) must exist before `QuizViewComponent` can reference it via `@ViewChild`. Build the modal form first.

**⚠️ CRITICAL**: T004–T006 must be complete before Phase 3 begins.

- [x] T004 Create `QuizAddEditComponent` class skeleton in `src/app/features/quizzes/quiz-add-edit/quiz-add-edit.component.ts` — standalone component with `@Input() courseId`, `@Input() quizData: QuizListItemDto | null`, `@Output() quizCreated`, `@Output() quizUpdated`, `@Output() modalDismissed`; import `ReactiveFormsModule`; define `FormGroup` with controls: `title`, `description`, `scheduledDate`, `duration`, `totalMarks`, `isActive`
- [x] T005 Implement form validation and submit logic in `src/app/features/quizzes/quiz-add-edit/quiz-add-edit.component.ts`:
  - `ngOnChanges()` — patch form when `quizData` is set (edit mode)
  - `submit()` — mark all touched on invalid; **edit mode only**: show SweetAlert2 `warning` dialog before API call ("Saving will invalidate the current Quiz Code and generate a new one"); on confirm call `QuizService.createOrUpdateQuiz()`; emit `quizCreated` or `quizUpdated` with returned `QuizListItemDto`; on API error close modal and show SweetAlert2 `error` alert
  - `dismiss()` — emit `modalDismissed`
- [x] T006 Create quiz add/edit modal template in `src/app/features/quizzes/quiz-add-edit/quiz-add-edit.component.html` — Bootstrap modal structure with:
  - Modal header: "Add Quiz" / "Edit Quiz" title (conditional on `quizData`)
  - Form fields: Title, Description, Scheduled Date (`datetime-local`), Duration (`text`, placeholder `HH:mm:ss`), Total Marks (`number`), Active toggle (`form-switch`)
  - Each field: `[class.is-invalid]` when `touched && invalid`, `<div class="invalid-feedback">` with field-specific message
  - Submit button: `[disabled]="form.invalid || isSubmitting"`, label changes between "Create Quiz" / "Save Changes"
  - Create `src/app/features/quizzes/quiz-add-edit/quiz-add-edit.component.css` — minimal overrides (modal header gradient using Lumina navy `#001A33 → #002D5B`)

**Checkpoint**: `QuizAddEditComponent` renders in isolation; form validation messages appear on blur/submit; SweetAlert2 confirmation fires before edit-save.

---

## Phase 3: User Story 1 — Browse Course Quizzes (Priority: P1) 🎯 MVP

**Goal**: Users with `Quiz:read` can click the Quiz tab and see a list of quiz cards showing Title, Description, Quiz Code, Duration (min), and Scheduled Date.

**Independent Test**: Navigate to any course detail page → click the Quiz tab → verify the quiz list renders with correct data, loading spinner shows during fetch, empty-state shows when no quizzes exist, and error alert appears on network failure.

- [x] T007 [US1] Create `QuizViewComponent` class in `src/app/features/quizzes/quiz-view/quiz-view.component.ts` — standalone component with:
  - `@Input() courseId!: number`
  - Permission flags in `ngOnInit()`: `canReadQuiz`, `canAddOrUpdateQuiz`, `canDeleteQuiz`, `canReadQuestions` (using `permissionService.hasPermission()`)
  - State: `quizzesList: QuizListItemDto[] = []`, `isLoading = false`, `loadError = ''`
  - `loadQuizzes()` — call `QuizService.getQuizzesByCourseId(courseId)`; `404` → empty array (no error); other errors → `loadError` string + SweetAlert2 error alert with Retry prompt
  - `parseDurationToMinutes(duration: string): string` — inline utility: split `HH:mm:ss`, compute `hours*60 + minutes + round(seconds/60)`, return `"X min"`
- [x] T008 [US1] Create quiz card list template in `src/app/features/quizzes/quiz-view/quiz-view.component.html`:
  - Loading spinner: `<div *ngIf="isLoading">` with `.spinner-border.text-lms-primary` (matches assignments-view pattern)
  - Error banner: `<div *ngIf="!isLoading && loadError">` with `.alert.alert-danger`, retry button `(click)="loadQuizzes()"`
  - Empty state: `<div *ngIf="!isLoading && !loadError && quizzesList.length === 0">` with `bi-journal-x` icon + "No Quizzes Yet" message
  - Quiz list: `*ngFor` over `quizzesList` with `[id]="'quiz-card-' + quiz.id"`:
    - Card uses `.content-card.mb-4` (matches assignments-view)
    - Left: number badge (`.content-number-badge`), title (`.content-title`), description (`.text-muted.small`), meta row with three chips: Quiz Code in `<code class="quiz-code">`, duration from `parseDurationToMinutes(quiz.duration)`, scheduled date via `| date:'MMM d, y · h:mm a'`
    - Right: Edit button `*ngIf="canAddOrUpdateQuiz"` (`.btn.btn-edit-action`) `(click)="openEditModal(quiz); $event.stopPropagation()"`, Delete button `*ngIf="canDeleteQuiz"` (`.btn.btn-link.btn-delete-card.text-danger`) `(click)="deleteQuiz(quiz.id); $event.stopPropagation()"`
    - Card click: `(click)="canReadQuestions && navigateToDetail(quiz.id)"`, `[style.cursor]="canReadQuestions ? 'pointer' : 'default'"`
- [x] T009 [US1] Create quiz view CSS in `src/app/features/quizzes/quiz-view/quiz-view.component.css`:
  - `.quiz-code`: `font-family: 'Courier New', monospace; letter-spacing: 0.08em; background: rgba(65,179,227,0.12); color: #41B3E3; border-radius: 4px; padding: 2px 8px; font-size: 0.85em;`
  - `.quiz-meta-row`: `display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 6px;`
  - `.quiz-meta-chip`: `display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: #6c757d;`

**Checkpoint**: Quiz tab shows spinner → quiz cards with all fields → empty state when list is empty → error alert on network failure. Permissions gate Edit/Delete/click correctly.

---

## Phase 4: User Story 2 — Add or Edit a Quiz (Priority: P2)

**Goal**: Users with `Quiz:addOrUpdate` can open a modal to create a new quiz or edit an existing one. The new/updated quiz appears in the list immediately after save without re-fetching.

**Independent Test**: Click "+ Add New Quiz" → fill form → submit → new card appears at top of list with correct data. Click Edit on a card → form is pre-populated → change title → save → card title updates in place.

- [x] T010 [US2] Wire modal open/close into `quiz-view.component.ts`:
  - `selectedQuiz: QuizListItemDto | null = null`
  - `openAddModal()` — set `selectedQuiz = null`; `window.bootstrap.Modal.getOrCreateInstance(el).show()`
  - `openEditModal(quiz)` — set `selectedQuiz = quiz`; open modal
  - `closeModal()` — `window.bootstrap.Modal.getOrCreateInstance(el).hide()`
  - `onQuizCreated(quiz: QuizListItemDto)` — `quizzesList.unshift(quiz)`; `closeModal()`; SweetAlert2 success toast (`toast: true, position: 'bottom-end', timer: 3000`)
  - `onQuizUpdated(quiz: QuizListItemDto)` — splice at index; `closeModal()`; SweetAlert2 success toast
  - Add `@ViewChild(QuizAddEditComponent)` reference
- [x] T011 [US2] Add modal host HTML to `quiz-view.component.html` — append Bootstrap modal `<div class="modal fade" id="quizAddEditModal">` with `<app-quiz-add-edit [courseId]="courseId" [quizData]="selectedQuiz" (quizCreated)="onQuizCreated($event)" (quizUpdated)="onQuizUpdated($event)" (modalDismissed)="closeModal()">` inside modal content; ensure `data-bs-backdrop="static"` and `data-bs-keyboard="false"`

**Checkpoint**: Add New Quiz → blank form opens → valid submit → card added at top with SweetAlert2 toast. Edit → pre-filled form → save → card updates → SweetAlert2 toast. Edit → cancel Quiz Code warning → modal stays open, no API call made.

---

## Phase 5: User Story 3 — Delete a Quiz (Priority: P3)

**Goal**: Users with `Quiz:delete` can permanently remove a quiz after confirming a SweetAlert2 dialog. The card is removed immediately from the list on success.

**Independent Test**: Click delete icon on any quiz card → SweetAlert2 confirmation appears → confirm → card disappears + success toast. Cancel → no change.

- [x] T012 [US3] Implement `deleteQuiz(id: number)` in `src/app/features/quizzes/quiz-view/quiz-view.component.ts`:
  - SweetAlert2 fire: `{ title: 'Delete Quiz?', text: 'This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#E63946', cancelButtonColor: '#41B3E3', confirmButtonText: 'Yes, delete it' }`
  - On confirm: call `QuizService.deleteQuiz(id)` → `next`: `quizzesList = quizzesList.filter(q => q.id !== id)`; SweetAlert2 success toast — `error`: SweetAlert2 error alert, no list change
  - On cancel: no action

**Checkpoint**: Delete flow works end-to-end with SweetAlert2 dialogs. Cancelling delete has zero side effects.

---

## Phase 6: User Story 4 — Navigate to Quiz Detail (Priority: P3)

**Goal**: Users with `questions:read` can click a quiz card to navigate to the Cycle 2 quiz detail route. Users without this permission see a static card (default cursor, no navigation).

**Independent Test**: With `questions:read` → click a quiz card → URL changes to `/dashboard/courses/:id/quizzes/:quizId`. Without `questions:read` → click card → nothing happens, cursor remains default.

- [x] T013 [US4] Implement `navigateToDetail(id: number)` in `src/app/features/quizzes/quiz-view/quiz-view.component.ts` — `this.router.navigate(['/dashboard/courses', this.courseId, 'quizzes', id])` — inject `Router` in constructor
- [x] T014 [US4] Register quiz routes in `src/app/app.routes.ts` — add two entries to the `dashboard` children array:
  ```
  { path: 'courses/:courseId/quizzes', component: ContentViewComponent, canActivate: [permissionGuard], data: { permission: 'Quiz:read' } }
  { path: 'courses/:courseId/quizzes/:quizId', redirectTo: 'courses/:courseId/quizzes', pathMatch: 'full' }
  ```
  Also add `ContentViewComponent` import at top if not already present (it is — no new import needed)

**Checkpoint**: Navigating to `/dashboard/courses/1/quizzes` loads the Course Detail page with Quizzes tab pre-selected. Clicking a card navigates to the quizId URL (stub redirect for now).

---

## Phase 7: Tab Integration (Cross-Cutting)

**Purpose**: Wire `QuizViewComponent` into the existing `ContentViewComponent` tab host. This phase touches two existing files and must follow Scope-Lock exactly.

- [x] T015 Extend `content-view.component.ts` (`src/app/features/content/content-view/content-view.component.ts`) — make the following **surgical** additions only:
  - Extend tab union type to `'content' | 'assignments' | 'quizzes'`
  - Add `canReadQuiz = false;` and `quizzesInitialized = false;` properties
  - In `ngOnInit()`: `this.canReadQuiz = this.permissionService.hasPermission('Quiz:read');`
  - In `ngOnInit()` URL detection block: add `else if (url.includes('/quizzes')) { this.activeTab = 'quizzes'; this.quizzesInitialized = true; }`
  - In `switchTab()`: add `else if (tab === 'quizzes' && !this.quizzesInitialized) { this.quizzesInitialized = true; }` branch; update `location.replaceState` path for `'quizzes'` case
  - In `onAddContent()`: add `else if (this.activeTab === 'quizzes') { this.quizzesView?.openAddModal(); return; }`
  - Add `@ViewChild(QuizViewComponent) quizzesView?: QuizViewComponent;`
  - Add `QuizViewComponent` to `imports` array
- [x] T016 Extend `content-view.component.html` (`src/app/features/content/content-view/content-view.component.html`) — make the following **surgical** additions only:
  - After the Assignments tab `<button>`, add Quizzes tab button:
    ```html
    <button *ngIf="canReadQuiz"
            class="btn btn-link text-decoration-none pb-3 px-0 fw-medium d-flex align-items-center gap-2 tab-btn"
            [class.active-tab]="activeTab === 'quizzes'"
            (click)="switchTab('quizzes')">
      <i class="bi bi-patch-question fs-5"></i>
      Quizzes
    </button>
    ```
  - After the `[hidden]="activeTab !== 'assignments'"` div, add:
    ```html
    <div [hidden]="activeTab !== 'quizzes'">
      <app-quiz-view *ngIf="quizzesInitialized" [courseId]="courseId"></app-quiz-view>
    </div>
    ```
  - Update section title ternary: add `activeTab === 'quizzes' ? 'Course Quizzes' :` case
  - Update the Add CTA `*ngIf` condition: add `|| (activeTab === 'quizzes' && canReadQuiz)` (the button label stays generic since `onAddContent()` delegates to `quizzesView`)
  - Update breadcrumb `<span>` to include `'quizzes'` → `'Quizzes'` case

**Checkpoint**: Quizzes tab appears in Course Detail navigation for users with `Quiz:read`. Tab switches cleanly. "+ Add New Quiz" button appears when `Quiz:addOrUpdate` permission exists. Switching tabs does not re-fetch data.

---

## Phase 8: Polish & Final Validation

**Purpose**: Build verification, UI consistency check, and quickstart walkthrough.

- [x] T017 Run `ng build --configuration=production` and fix any TypeScript or template compilation errors
- [x] T018 [P] Verify all SweetAlert2 call patterns match existing project conventions: confirmation color `#E63946` / `#41B3E3`, success toast `timer: 3000, timerProgressBar: true, position: 'bottom-end'`
- [x] T019 [P] Verify quiz card visual consistency with Assignments tab — same `.content-card`, `.card-header-row`, `.content-number-badge`, `.content-title`, `.btn-edit-action`, `.btn-delete-card` classes used; same font and spacing
- [x] T020 Run manual verification checklist from `specs/012-quiz-view-cycle1/quickstart.md` — validate all 20 test scenarios pass in the browser

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational — QuizAddEditComponent)
    ↓
Phase 3 (US1 — Browse Quizzes)  ← MVP stop point
    ↓
Phase 4 (US2 — Add/Edit)
Phase 5 (US3 — Delete)          ← can run in parallel with Phase 4
Phase 6 (US4 — Navigate)        ← can run in parallel with Phase 4 & 5
    ↓
Phase 7 (Tab Integration)       ← must follow Phase 3 completion
    ↓
Phase 8 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 Browse (P1) | Phase 1 + Phase 2 | — |
| US2 Add/Edit (P2) | US1 complete (QuizViewComponent exists) | US3 |
| US3 Delete (P3) | US1 complete | US2, US4 |
| US4 Navigate (P3) | US1 complete | US2, US3 |

### Parallel Opportunities

```bash
# Phase 1: these can run simultaneously
T002  quiz.model.ts
T003  quiz.service.ts

# Phase 5 + 6: can run simultaneously (different methods, same file)
T012  deleteQuiz() method
T013  navigateToDetail() method

# Phase 8: polish tasks can run simultaneously
T017  ng build
T018  Swal pattern check
T019  UI consistency check
```

---

## Implementation Strategy

### MVP First (User Story 1 Only — Phases 1–3 + Phase 7)

1. Complete **Phase 1** — model, service
2. Complete **Phase 2** — QuizAddEditComponent skeleton (needed even for MVP to avoid import errors)
3. Complete **Phase 3** — QuizViewComponent (read-only list, loading/empty/error states)
4. Complete **Phase 7** — wire into ContentViewComponent
5. **STOP and VALIDATE**: Quiz tab renders the quiz list correctly
6. Deploy / demo MVP — instructors and students can see quizzes

### Incremental Delivery

1. MVP (Phases 1–3 + 7) → Quiz list visible ✅
2. Add Phase 4 → Add/Edit modal working ✅
3. Add Phase 5 → Delete with confirmation ✅
4. Add Phase 6 → Card navigation to Cycle 2 ready ✅
5. Phase 8 → Build passes, UI polished ✅

---

## Notes

- **[P]** tasks = different files, no shared state dependencies — safe to implement simultaneously
- `[USN]` label maps each task to its user story for traceability
- Model interfaces (`quiz.model.ts`) serve ALL user stories — placed in Phase 1
- `QuizAddEditComponent` is in Phase 2 (Foundational) because `QuizViewComponent` imports it
- Follow assignments/content card design styles instead of needing a separate stitch design block
- Do not modify any files outside the task list scope (Scope-Lock principle)
- Commit after each phase checkpoint or logical group of tasks
