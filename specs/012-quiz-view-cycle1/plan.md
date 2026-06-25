# Implementation Plan: Quiz View – Cycle 1

**Branch**: `012-quiz-view-cycle1` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/012-quiz-view-cycle1/spec.md`

---

## Summary

Add a **Quizzes tab** to the existing Course Detail page (`ContentViewComponent`) that lists all quizzes for a course when clicked. Each quiz renders as a card showing Title, Description, Quiz Code, Duration (in minutes), and Scheduled Date. Users with `Quiz:addOrUpdate` permission can create/edit quizzes via a Bootstrap modal. Users with `Quiz:delete` can delete after SweetAlert2 confirmation. Quiz cards are navigable to the Cycle 2 detail route if the user has `questions:read`. All mutations use local (optimistic) list updates without re-fetching. SweetAlert2 is used for all user-facing feedback.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Angular 17+ (Standalone Components)  
**Primary Dependencies**: Angular HttpClient, Bootstrap 5 (modal API), SweetAlert2, Bootstrap Icons  
**Storage**: N/A (stateless frontend; API-backed)  
**Testing**: Jasmine / Karma (existing project setup)  
**Target Platform**: Web browser (desktop-first; responsive)  
**Performance Goals**: Tab switch must feel instant (DOM hidden, not destroyed); API call only on first activation  
**Constraints**: Scope-Lock — only files within quiz-view feature scope may be modified, plus the two shared files below that require minimal additions: `content-view.component.*` (tab extension) and `app.routes.ts` (two new route entries)  
**Scale/Scope**: Single-page feature addition within an existing Course Detail host component

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Bootstrap-First Styling** — Bootstrap 5 is the primary CSS framework; all quiz card classes will follow `.content-card`, `.card-header-row`, `.btn-lumina-main`, `.btn-edit-action`, `.btn-delete-card` naming conventions from existing tabs; cyan `#41B3E3` accent preserved.
- [x] **II. Stitch Design Blueprint** — Waived by user. Following existing card design patterns from Content and Assignments views instead.
- [x] **III. Angular Standalone Architecture** — New feature folder: `src/app/features/quizzes/quiz-view/`. New child component: `src/app/features/quizzes/quiz-add-edit/`. No NgModule. Standalone components only.
- [x] **IV. Separation of Concerns** — HTTP/API logic in `src/app/core/services/quiz.service.ts`; model interfaces in `src/app/models/quiz.model.ts`; component logic in feature folder. No raw HTTP in components.
- [x] **V. Scope-Lock & Consultation** — Only quiz-view files + three minimal additions to existing files: (1) `content-view.component.ts` tab extension, (2) `content-view.component.html` tab button + slot, (3) `app.routes.ts` two new entries. No unrelated files touched.

---

## Project Structure

### Documentation (this feature)

```text
specs/012-quiz-view-cycle1/
├── plan.md              ← This file
├── research.md          ← Phase 0 output ✅
├── data-model.md        ← Phase 1 output ✅
├── quickstart.md        ← Phase 1 output ✅
├── contracts/           ← Phase 1 output ✅
└── tasks.md             ← Phase 2 output (via /speckit-tasks)
```

### Source Code Layout

```text
src/app/
├── models/
│   └── quiz.model.ts                          [NEW] QuizListItemDto, QuizCreateUpdateDto
│
├── core/services/
│   └── quiz.service.ts                        [NEW] getQuizzesByCourseId, createOrUpdateQuiz, deleteQuiz
│
├── features/
│   ├── quizzes/                               [NEW feature folder]
│   │   ├── quiz-view/
│   │   │   ├── quiz-view.component.ts         [NEW] Quiz list logic + permission flags
│   │   │   ├── quiz-view.component.html       [NEW] Card list + loading/empty/error states
│   │   │   └── quiz-view.component.css        [NEW] Scoped quiz card overrides (reuse .content-card)
│   │   └── quiz-add-edit/
│   │       ├── quiz-add-edit.component.ts     [NEW] Add/Edit modal form logic
│   │       ├── quiz-add-edit.component.html   [NEW] Bootstrap modal form with inline validation
│   │       └── quiz-add-edit.component.css    [NEW] Modal-specific style overrides
│   │
│   └── content/
│       └── content-view/
│           ├── content-view.component.ts      [MODIFY] Add 'quizzes' tab, permission flag, lazy-init
│           └── content-view.component.html    [MODIFY] Add Quiz tab button + <div [hidden]> slot
│
└── app.routes.ts                              [MODIFY] Add 2 child routes for /quizzes and /quizzes/:id
```

---

## Detailed Step-by-Step Implementation

### Task 1 — Model Interfaces

**File**: `src/app/models/quiz.model.ts` *(NEW)*

```typescript
/** Returned by GET /api/Quiz/course/{courseId} */
export interface QuizListItemDto {
  id: number;
  title: string;
  description: string;
  scheduledDate: string;   // ISO 8601
  duration: string;        // "HH:mm:ss"
  quizCode: string;        // 8-character code
}

/** Sent to POST /api/Quiz/course/{courseId} */
export interface QuizCreateUpdateDto {
  id: number | null;
  title: string;
  description: string;
  scheduledDate: string;
  duration: string;        // "HH:mm:ss"
  totalMarks: number;
  isActive: boolean;
}
```

---

### Task 2 — Quiz Service

**File**: `src/app/core/services/quiz.service.ts` *(NEW)*

```typescript
@Injectable({ providedIn: 'root' })
export class QuizService {
  private apiUrl = `https://localhost:7289/api/Quiz`;

  constructor(private http: HttpClient) {}

  getQuizzesByCourseId(courseId: number): Observable<QuizListItemDto[]> {
    return this.http.get<any[]>(`${this.apiUrl}/course/${courseId}`)
      .pipe(map(list => list.map(q => this.normalize(q))));
  }

  createOrUpdateQuiz(courseId: number, dto: QuizCreateUpdateDto): Observable<QuizListItemDto> {
    return this.http.post<any>(`${this.apiUrl}/course/${courseId}`, dto)
      .pipe(map(q => this.normalize(q)));
  }

  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private normalize(q: any): QuizListItemDto {
    return {
      id: q.id ?? 0,
      title: q.title ?? '',
      description: q.description ?? '',
      scheduledDate: q.scheduledDate ?? '',
      duration: q.duration ?? '00:00:00',
      quizCode: q.quizCode ?? '',
    };
  }
}
```

---

### Task 3 — Quiz View Component

**File**: `src/app/features/quizzes/quiz-view/quiz-view.component.ts` *(NEW)*

Key responsibilities:
- `@Input() courseId: number` — received from the `ContentViewComponent` host
- `ngOnInit()` — resolve all 4 permission flags; call `loadQuizzes()` if `canReadQuiz`
- `loadQuizzes()` — call `QuizService.getQuizzesByCourseId()`, populate `quizzesList`; handle 404 as empty array
- `openAddModal()` / `closeModal()` — Bootstrap modal lifecycle via `window.bootstrap.Modal.getOrCreateInstance(el)`
- `openEditModal(quiz)` — set `selectedQuiz`, pre-populate `@ViewChild(QuizAddEditComponent)`
- `onQuizCreated(quiz)` — `quizzesList.unshift(quiz)`; close modal; SweetAlert2 success toast
- `onQuizUpdated(quiz)` — splice local array at index; close modal; SweetAlert2 success toast
- `deleteQuiz(id)` — SweetAlert2 confirmation → `QuizService.deleteQuiz()` → `filter()` local array → success toast
- `navigateToDetail(id)` — `router.navigate(['/dashboard/courses', courseId, 'quizzes', id])` — only called if `canReadQuestions`
- `parseDurationToMinutes(duration)` — utility function for template display

**Permission flags**:
```typescript
canReadQuiz        = this.permissionService.hasPermission('Quiz:read');
canAddOrUpdateQuiz = this.permissionService.hasPermission('Quiz:addOrUpdate');
canDeleteQuiz      = this.permissionService.hasPermission('Quiz:delete');
canReadQuestions   = this.permissionService.hasPermission('questions:read');
```

---

### Task 4 — Quiz View Template

**File**: `src/app/features/quizzes/quiz-view/quiz-view.component.html` *(NEW)*

Structure:
```html
<!-- Loading spinner (reuse .spinner-border.text-lms-primary pattern) -->
<!-- Error alert with Retry button (reuse .alert.alert-danger pattern) -->
<!-- Empty state (reuse .empty-state-card pattern with bi-journal-x icon) -->

<!-- Quiz list -->
<div *ngFor="let quiz of quizzesList; let i = index" 
     class="content-card mb-4"
     [id]="'quiz-card-' + quiz.id"
     [class.clickable-card]="canReadQuestions"
     [style.cursor]="canReadQuestions ? 'pointer' : 'default'"
     (click)="canReadQuestions && navigateToDetail(quiz.id)">

  <div class="card-header-row d-flex align-items-center justify-content-between p-4">
    <!-- Left: Number badge + Title + Description + meta chips -->
    <!-- Right: Edit button (*ngIf canAddOrUpdateQuiz) + Delete button (*ngIf canDeleteQuiz) -->
  </div>
</div>

<!-- Add/Edit Modal Host -->
<div class="modal fade" id="quizAddEditModal" ...>
  <app-quiz-add-edit [courseId]="courseId" [quizData]="selectedQuiz"
    (quizCreated)="onQuizCreated($event)"
    (quizUpdated)="onQuizUpdated($event)"
    (modalDismissed)="closeModal()">
  </app-quiz-add-edit>
</div>
```

**Card meta chips** (reuse `.meta-chip` or inline badge classes):
- `<i class="bi bi-upc-scan">` + Quiz Code in `<code>` tag
- `<i class="bi bi-clock">` + `parseDurationToMinutes(quiz.duration)`
- `<i class="bi bi-calendar-event">` + `quiz.scheduledDate | date:'MMM d, y · h:mm a'`

---

### Task 5 — Quiz View CSS

**File**: `src/app/features/quizzes/quiz-view/quiz-view.component.css` *(NEW)*

- Import/reuse `.content-card`, `.card-header-row`, `.content-number-badge`, `.content-title` classes already defined in `content-view.component.css` — these are globally accessible because Angular encapsulation only applies component-level styles, not host inheritance. Use `::ng-deep` only if needed.
- Add `.quiz-code` for the `<code>` monospace badge: `font-family: monospace; letter-spacing: 0.1em; background: rgba(65,179,227,0.1); border-radius: 4px; padding: 2px 6px; color: #41B3E3;`
- Add `.quiz-meta-chips` flex row for the three chips below the description.

---

### Task 6 — Quiz Add/Edit Component

**File**: `src/app/features/quizzes/quiz-add-edit/quiz-add-edit.component.ts` *(NEW)*

Inputs/Outputs:
```typescript
@Input() courseId!: number;
@Input() quizData: QuizListItemDto | null = null;  // null = create mode

@Output() quizCreated = new EventEmitter<QuizListItemDto>();
@Output() quizUpdated = new EventEmitter<QuizListItemDto>();
@Output() modalDismissed = new EventEmitter<void>();
```

Key logic:
- `form: FormGroup` with `ReactiveFormsModule` — fields: `title`, `description`, `scheduledDate`, `duration`, `totalMarks`, `isActive`
- Validators: `Validators.required` on all fields; custom validator for duration format (`/^\d{2}:\d{2}:\d{2}$/`) and not `"00:00:00"`; `Validators.min(0.01)` on `totalMarks`
- `ngOnChanges()` — when `quizData` is set (edit mode), patch the form
- `submit()`:
  - If form is invalid, mark all as touched and return
  - **Edit mode only**: show SweetAlert2 warning about Quiz Code regeneration before calling API
  - Build `QuizCreateUpdateDto`, call `QuizService.createOrUpdateQuiz()`
  - Emit `quizCreated` or `quizUpdated` event with the returned `QuizListItemDto`
- `dismiss()` — emit `modalDismissed`

---

### Task 7 — Quiz Add/Edit Template

**File**: `src/app/features/quizzes/quiz-add-edit/quiz-add-edit.component.html` *(NEW)*

Bootstrap modal structure:
```html
<div class="modal-header"> ... </div>
<div class="modal-body">
  <form [formGroup]="form" (ngSubmit)="submit()">
    <!-- Title field with inline validation -->
    <div class="mb-3">
      <label class="form-label fw-bold">Title <span class="text-danger">*</span></label>
      <input class="form-control" [class.is-invalid]="form.get('title')?.invalid && form.get('title')?.touched" formControlName="title">
      <div class="invalid-feedback">Title is required.</div>
    </div>
    <!-- Description, scheduledDate, duration, totalMarks, isActive fields (same pattern) -->
    <!-- isActive toggle (Bootstrap form-check form-switch) -->
    <div class="form-check form-switch mb-3">
      <input class="form-check-input" type="checkbox" formControlName="isActive" id="quizIsActive">
      <label class="form-check-label" for="quizIsActive">Active</label>
    </div>
    <!-- Submit button (disabled until form.valid) -->
    <button type="submit" class="btn btn-lumina-main" [disabled]="form.invalid || isSubmitting">
      {{ quizData ? 'Save Changes' : 'Create Quiz' }}
    </button>
  </form>
</div>
```

---

### Task 8 — Extend ContentViewComponent (Tab Integration)

**File**: `src/app/features/content/content-view/content-view.component.ts` *(MODIFY)*

Changes (minimal, scope-locked):
1. Extend tab union type: `'content' | 'assignments' | 'quizzes'`
2. Add permission flag: `canReadQuiz = false;`
3. In `ngOnInit()`: `this.canReadQuiz = this.permissionService.hasPermission('Quiz:read');`
4. Add `quizzesInitialized = false;`
5. In `switchTab()`: add `else if (tab === 'quizzes' && !this.quizzesInitialized) { this.quizzesInitialized = true; }` branch
6. In `switchTab()`: update `location.replaceState` path to handle `'quizzes'`
7. Add to `imports` array: `QuizViewComponent`
8. Update the section title `*ngIf` / ternary to include the Quiz tab label
9. Update the Add CTA button condition: add `|| (activeTab === 'quizzes' && canAddOrUpdateQuiz)` and delegate to `quizzesView?.openAddModal()`
10. Add `@ViewChild(QuizViewComponent) quizzesView?: QuizViewComponent;`

**File**: `src/app/features/content/content-view/content-view.component.html` *(MODIFY)*

Changes:
1. Add **Quiz tab button** after the Assignments tab button:
```html
<!-- Quizzes Tab -->
<button *ngIf="canReadQuiz"
        class="btn btn-link text-decoration-none pb-3 px-0 fw-medium d-flex align-items-center gap-2 tab-btn"
        [class.active-tab]="activeTab === 'quizzes'"
        (click)="switchTab('quizzes')">
  <i class="bi bi-patch-question fs-5"></i>
  Quizzes
</button>
```
2. Add hidden slot after the assignments slot:
```html
<div [hidden]="activeTab !== 'quizzes'">
  <app-quiz-view *ngIf="quizzesInitialized" [courseId]="courseId"></app-quiz-view>
</div>
```
3. Update the breadcrumb `<span>` to include `'quizzes'` case.
4. Update the section title ternary to include `activeTab === 'quizzes' ? 'Course Quizzes' : ...`

---

### Task 9 — Route Registration

**File**: `src/app/app.routes.ts` *(MODIFY)*

Add two child routes inside the `dashboard` children array:

```typescript
// ── Quiz View — Cycle 1 ──────────────────────────────────────
{
  path: 'courses/:courseId/quizzes',
  component: ContentViewComponent,
  canActivate: [permissionGuard],
  data: { permission: 'Quiz:read' },
},
// ── Quiz Detail — Cycle 2 placeholder ────────────────────────
{
  path: 'courses/:courseId/quizzes/:quizId',
  redirectTo: 'courses/:courseId/quizzes',  // stub until Cycle 2
  pathMatch: 'full',
},
```

---

## Complexity Tracking

No Constitution violations. All changes are additive (new files + minimal extensions to 3 existing files). The `[MODIFY]` files receive surgical additions — no refactoring of unrelated code.

---

## Verification Plan

### Automated
```bash
ng build --configuration=production   # zero TypeScript errors
```

### Manual Verification Checklist

| Check | Expected |
|-------|----------|
| Quiz tab hidden without `Quiz:read` | Tab button not rendered |
| Quiz tab visible with `Quiz:read` | Tab renders; clicking loads quiz list |
| Empty list | Empty-state illustration displayed |
| 404 from API | Empty list (no error banner) |
| Network error | SweetAlert2 error alert with Retry |
| "+ Add New Quiz" hidden without `Quiz:addOrUpdate` | Button not rendered |
| "+ Add New Quiz" visible | Modal opens with blank form |
| Edit icon hidden without `Quiz:addOrUpdate` | Icon not rendered |
| Edit icon visible → click | Modal opens pre-populated |
| Edit → submit → SweetAlert2 quiz code warning | Warning shown; Cancel keeps modal open |
| Edit → confirm → success | Card updated locally; success toast |
| Delete icon hidden without `Quiz:delete` | Icon not rendered |
| Delete icon → SweetAlert2 confirm | Confirmation shown |
| Delete confirmed | Card removed; success toast |
| Delete cancelled | No change |
| Card click with `questions:read` | Navigates to `/dashboard/courses/:id/quizzes/:quizId` |
| Card click without `questions:read` | No navigation; cursor default |
| Duration "01:30:00" | Displayed as "90 min" |
| Duration "00:00:00" | Displayed as "0 min" |
| Quiz Code | Displayed in monospace style |
| Scheduled date | Formatted as "Jun 25, 2026 · 10:00 AM" |
