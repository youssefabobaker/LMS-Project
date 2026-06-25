# Implementation Plan: Quiz Detail Page & Question Management

**Branch**: `013-quiz-detail-questions` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/013-quiz-detail-questions/spec.md`

---

## Summary

Implement a full Quiz Detail Page (`QuizDetailComponent`) navigable from the existing Quiz list view, integrating 5 new API endpoints: get quiz by ID, toggle quiz active, add question, update question, and toggle question status. The page features a quiz metadata header with an active toggle switch, and a scrollable list of question cards each showing choices with correct-answer highlighting. A unified `QuestionFormModalComponent` handles both adding and editing questions using Angular Reactive Forms with a dynamic `FormArray` for choices.

---

## Technical Context

**Language/Version**: TypeScript 5 / Angular 17 (Standalone Components)
**Primary Dependencies**: Angular Reactive Forms (`FormBuilder`, `FormArray`, `FormGroup`), Bootstrap 5, Bootstrap Icons, SweetAlert2
**Storage**: N/A — all state is remote API + local in-memory array
**Testing**: Manual verification against running `ng serve` dev server
**Target Platform**: Web (desktop-first, responsive)
**Project Type**: Single-page Angular web application
**Performance Goals**: Quiz detail page renders in < 3 seconds on standard connection
**Constraints**: Scope-Lock — only files in `src/app/features/quizzes/`, `src/app/models/quiz.model.ts`, `src/app/core/services/quiz.service.ts`, and `src/app/app.routes.ts` are modified
**Scale/Scope**: Single feature addition; ~5 new files, 2 modified files

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Bootstrap-First Styling** — All new components use Bootstrap 5 classes; Lumina token colors (`#41B3E3`, `#001A33`, `#002D5B`) applied; custom classes follow `.btn-lumina-*` / `.btn-*-action` conventions. Success teal (`#28a745` / Bootstrap `text-success`) used for correct-answer highlighting.
- [x] **II. Stitch Design Blueprint** — No `stitch-designs/quiz-detail/` exists. **Approved deviation**: User's explicit layout instructions + the existing `AssignmentDetailComponent` visual pattern serve as the design reference. Gap is documented in `research.md` (Finding 6).
- [x] **III. Angular Standalone Architecture** — `QuizDetailComponent` and `QuestionFormModalComponent` are standalone. Feature lives under `src/app/features/quizzes/`. No NgModule introduced.
- [x] **IV. Separation of Concerns** — All HTTP calls are in `quiz.service.ts` (Core service). Model interfaces are in `src/app/models/quiz.model.ts`. Components contain only UI and event-handling logic.
- [x] **V. Scope-Lock & Consultation** — Only 7 files touched: 5 new feature files, `quiz.model.ts` (append-only), `quiz.service.ts` (append-only), and `app.routes.ts` (replace one redirect). No unrelated files modified.

---

## Project Structure

### Documentation (this feature)

```text
specs/013-quiz-detail-questions/
├── plan.md              ← This file
├── spec.md
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code Changes

```text
src/app/
├── models/
│   └── quiz.model.ts                        ← MODIFY: append 5 new interfaces
│
├── core/services/
│   └── quiz.service.ts                      ← MODIFY: append 5 new methods
│
├── app.routes.ts                            ← MODIFY: replace quiz detail redirect
│
└── features/quizzes/
    ├── quiz-view/                           (unchanged)
    ├── quiz-add-edit/                       (unchanged)
    ├── quiz-detail/                         ← NEW directory
    │   ├── quiz-detail.component.ts
    │   ├── quiz-detail.component.html
    │   └── quiz-detail.component.css
    └── question-form-modal/                 ← NEW directory
        ├── question-form-modal.component.ts
        ├── question-form-modal.component.html
        └── question-form-modal.component.css
```

---

## Phase 0: Research

✅ **Complete** — see [research.md](./research.md)

Key decisions:
- Question Controller uses **absolute paths** (no `/api` prefix) — methods in `QuizService` compute their own base URL
- `questionType` is returned as `string` ("MultipleChoice"/"TrueFalse") but sent as `int` (0/1)
- `FormArray` is the correct approach for dynamic choices
- Local in-memory state updates after every mutation (no reload)
- Model location follows actual codebase convention: `src/app/models/` (not `src/app/core/models/`)

---

## Phase 1: Design & Contracts

✅ **Complete** — see [data-model.md](./data-model.md)

New TypeScript interfaces to append to `src/app/models/quiz.model.ts`:
- `QuizDetailDto` — full quiz with questions array
- `QuestionResponseDto` — individual question with choices
- `QuestionChoiceDto` — single choice with `isCorrect` flag
- `QuestionFormPayload` — add/update request body
- `QuizToggleActiveResponse` — toggle response `{ isActive: bool }`

---

## Detailed Implementation Steps

### Step 1 — Model Extension (`src/app/models/quiz.model.ts`)

**Action**: Append the 5 new interfaces to the bottom of the existing file. Do NOT modify existing interfaces.

```typescript
// Append after existing interfaces:

/** Returned by GET /api/Quiz/{id} */
export interface QuizDetailDto {
  id: number;
  title: string;
  description: string;
  scheduledDate: string;
  duration: string;
  totalMarks: number;
  isActive: boolean;
  quizCode: string;
  courseId: number;
  quizQuestions: QuestionResponseDto[];
}

export interface QuestionResponseDto {
  id: number;
  isActive: boolean;
  questionText: string;
  questionType: string;           // "MultipleChoice" | "TrueFalse"
  marks: number;
  isAllowableToLookDown: boolean;
  questionChoices: QuestionChoiceDto[];
}

export interface QuestionChoiceDto {
  id: number;
  choiceText: string;
  isCorrect: boolean;
}

/** Sent to POST /Quiz/{quizId} and POST /Update/QuizId/{quizId} */
export interface QuestionFormPayload {
  id: number;
  questionText: string;
  questionType: number;           // 0 = MultipleChoice, 1 = TrueFalse
  marks: number;
  correctAnswerIndex: number;
  isAllowableToLookDown: boolean;
  questionChoices: string[];
}

/** Returned by PATCH /api/Quiz/{id}/toggle-active */
export interface QuizToggleActiveResponse {
  isActive: boolean;
}
```

---

### Step 2 — Service Expansion (`src/app/core/services/quiz.service.ts`)

**Action**: Append 5 new methods. Update the import line for the new model types.

**New imports** (add to existing import line):
```typescript
import { QuizListItemDto, QuizCreateUpdateDto, QuizDetailDto, QuestionResponseDto, QuestionFormPayload, QuizToggleActiveResponse } from '../../models/quiz.model';
```

**New private property** (add alongside `apiUrl`):
```typescript
private questionBaseUrl = `https://localhost:7289`;
```

**New methods**:

```typescript
// GET /api/Quiz/{id} — full detail with questions
getQuizById(id: number): Observable<QuizDetailDto> {
  return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
    map(q => this.normalizeDetail(q))
  );
}

// PATCH /api/Quiz/{id}/toggle-active — flip quiz isActive
toggleQuizActive(id: number): Observable<QuizToggleActiveResponse> {
  return this.http.patch<QuizToggleActiveResponse>(`${this.apiUrl}/${id}/toggle-active`, {});
}

// POST /Quiz/{quizId} — add new question (absolute path, no /api prefix)
addQuestion(quizId: number, payload: QuestionFormPayload): Observable<QuestionResponseDto> {
  return this.http.post<QuestionResponseDto>(`${this.questionBaseUrl}/Quiz/${quizId}`, payload);
}

// POST /Update/QuizId/{quizId} — update existing question (absolute path)
updateQuestion(quizId: number, payload: QuestionFormPayload): Observable<QuestionResponseDto> {
  return this.http.post<QuestionResponseDto>(`${this.questionBaseUrl}/Update/QuizId/${quizId}`, payload);
}

// POST /ToggleStatus/QuizId/{quizId}/QuestionId{questionId}
// CRITICAL: No slash between "QuestionId" and the parameter value
toggleQuestionStatus(quizId: number, questionId: number): Observable<QuestionResponseDto> {
  return this.http.post<QuestionResponseDto>(
    `${this.questionBaseUrl}/ToggleStatus/QuizId/${quizId}/QuestionId${questionId}`,
    {}
  );
}

// Private normalizer for the full detail response
private normalizeDetail(q: any): QuizDetailDto {
  let sDate = q.scheduledDate ?? q.ScheduledDate ?? '';
  if (sDate && !sDate.endsWith('Z')) sDate += 'Z';
  return {
    id: q.id ?? 0,
    title: q.title ?? '',
    description: q.description ?? '',
    scheduledDate: sDate,
    duration: q.duration ?? '00:00:00',
    totalMarks: q.totalMarks ?? 0,
    isActive: q.isActive ?? false,
    quizCode: q.quizCode ?? '',
    courseId: q.courseId ?? 0,
    quizQuestions: (q.quizQuestions ?? []).map((qn: any) => this.normalizeQuestion(qn)),
  };
}

private normalizeQuestion(qn: any): QuestionResponseDto {
  return {
    id: qn.id ?? 0,
    isActive: qn.isActive ?? true,
    questionText: qn.questionText ?? '',
    questionType: qn.questionType ?? 'MultipleChoice',
    marks: qn.marks ?? 0,
    isAllowableToLookDown: qn.isAllowableToLookDown ?? false,
    questionChoices: (qn.questionChoices ?? []).map((c: any) => ({
      id: c.id ?? 0,
      choiceText: c.choiceText ?? '',
      isCorrect: c.isCorrect ?? false,
    })),
  };
}
```

---

### Step 3 — Route Registration (`src/app/app.routes.ts`)

**Action**: Replace the quiz detail redirect placeholder with the real component route.

**Import to add**:
```typescript
import { QuizDetailComponent } from './features/quizzes/quiz-detail/quiz-detail.component';
```

**Replace** (lines 106-111):
```typescript
// BEFORE:
{
  path: 'courses/:courseId/quizzes/:quizId',
  redirectTo: 'courses/:courseId/quizzes',
  pathMatch: 'full',
},

// AFTER:
{
  path: 'courses/:courseId/quizzes/:quizId',
  component: QuizDetailComponent,
  canActivate: [permissionGuard],
  data: { permission: 'questions:read' },
},
```

---

### Step 4 — QuizDetailComponent

**Files to create**:
- `src/app/features/quizzes/quiz-detail/quiz-detail.component.ts`
- `src/app/features/quizzes/quiz-detail/quiz-detail.component.html`
- `src/app/features/quizzes/quiz-detail/quiz-detail.component.css`

**Component responsibilities**:
- Read `courseId` and `quizId` from `ActivatedRoute` params
- Load quiz data on init via `QuizService.getQuizById(quizId)`
- Hold permission flags: `canAddOrUpdateQuiz`, `canAddQuestion`, `canUpdateQuestion`
- Handle quiz active toggle: call `toggleQuizActive()`, update `quiz.isActive` locally
- Handle question toggle: call `toggleQuestionStatus()`, replace the matching question in the local array
- Expose `openAddQuestionModal()` and `openEditQuestionModal(question)` methods
- Handle `questionSaved` event from the modal: append or replace in `quiz.quizQuestions`
- Navigate back via `router.navigate(['/dashboard/courses', courseId, 'quizzes'])`

**Template layout**:
```
├── Loading spinner (while isLoading)
├── Error banner (if loadError)
└── [When loaded]
    ├── Page Header
    │   ├── "Back to Quizzes" breadcrumb link
    │   ├── Quiz Title (h1)
    │   ├── Meta badges: scheduledDate, duration, totalMarks, quizCode
    │   ├── Description paragraph
    │   └── [if canAddOrUpdateQuiz] Active Toggle Switch (bound to quiz.isActive)
    ├── Section Title + [if canAddQuestion] "+ Add Question" button
    └── Question List
        ├── Empty state (if quizQuestions.length === 0)
        └── *ngFor question card
            ├── Number badge + Question text + type badge + marks badge + lookdown indicator
            ├── Choices list
            │   └── *ngFor choice — if isCorrect: success teal bg + checkmark icon
            └── Action buttons (click stopPropagation)
                ├── [if canUpdateQuestion] Edit button → openEditQuestionModal(question)
                └── [if canUpdateQuestion] Toggle button → toggleQuestionStatus(question)
```

**Key CSS classes to follow**:
- Card: `content-card mb-4` (matches quiz-view and assignment-detail patterns)
- Header gradient: `style="background: linear-gradient(90deg, #001A33 0%, #002D5B 100%);"` for the page top
- Correct choice: `badge bg-success bg-opacity-10 text-success border border-success` with `bi-check-circle-fill` icon
- Inactive question card: `opacity-50` + `"Inactive"` badge (`badge bg-secondary`)
- Marks badge: `badge bg-light text-secondary border` e.g. "5 pts"
- Type badge: `badge bg-primary bg-opacity-10 text-primary` for MultipleChoice, `badge bg-info bg-opacity-10 text-info` for TrueFalse

---

### Step 5 — QuestionFormModalComponent

**Files to create**:
- `src/app/features/quizzes/question-form-modal/question-form-modal.component.ts`
- `src/app/features/quizzes/question-form-modal/question-form-modal.component.html`
- `src/app/features/quizzes/question-form-modal/question-form-modal.component.css`

**Inputs**:
- `@Input() quizId: number`
- `@Input() questionData: QuestionResponseDto | null` (null = add mode, non-null = edit mode)

**Output**:
- `@Output() questionSaved = new EventEmitter<QuestionResponseDto>()`
- `@Output() modalDismissed = new EventEmitter<void>()`

**Reactive Form Structure**:
```typescript
form = this.fb.group({
  questionText: ['', Validators.required],
  questionType: [0, Validators.required],       // 0 or 1
  marks: [null, [Validators.required, Validators.min(0.01)]],
  isAllowableToLookDown: [false],
  correctAnswerIndex: [0, Validators.required],
  choices: this.fb.array([])                    // FormArray of FormControl(string)
});
```

**Dynamic Choices Logic** (triggered by `questionType` valueChanges):

```typescript
this.form.get('questionType')!.valueChanges.subscribe((type: number) => {
  const choicesArray = this.form.get('choices') as FormArray;
  choicesArray.clear();
  this.form.get('correctAnswerIndex')!.setValue(0);

  if (type === 1) {
    // TrueFalse: push fixed choices, disable editing
    choicesArray.push(this.fb.control({ value: 'True', disabled: true }));
    choicesArray.push(this.fb.control({ value: 'False', disabled: true }));
  } else {
    // MultipleChoice: start with 2 empty editable choices
    choicesArray.push(this.fb.control('', Validators.required));
    choicesArray.push(this.fb.control('', Validators.required));
  }
});
```

**Edit Mode Population** (`ngOnChanges` on `questionData`):

```typescript
if (this.questionData) {
  const typeInt = this.questionData.questionType === 'TrueFalse' ? 1 : 0;
  const correctIdx = this.questionData.questionChoices.findIndex(c => c.isCorrect);
  
  // Reset choices array with existing values
  const choicesArray = this.form.get('choices') as FormArray;
  choicesArray.clear();
  this.questionData.questionChoices.forEach(c => {
    const ctrl = this.fb.control({ value: c.choiceText, disabled: typeInt === 1 });
    choicesArray.push(ctrl);
  });

  this.form.patchValue({
    questionText: this.questionData.questionText,
    questionType: typeInt,
    marks: this.questionData.marks,
    isAllowableToLookDown: this.questionData.isAllowableToLookDown,
    correctAnswerIndex: correctIdx >= 0 ? correctIdx : 0,
  });
}
```

**Submit Logic**:

```typescript
submit(): void {
  if (this.form.invalid) { this.form.markAllAsTouched(); return; }

  const choicesArray = this.form.get('choices') as FormArray;
  const choiceTexts = choicesArray.controls.map(c => c.value as string);
  
  // Validate minimum 2 choices for MultipleChoice
  if (this.form.value.questionType === 0 && choiceTexts.filter(t => t?.trim()).length < 2) {
    // show inline error
    return;
  }

  const payload: QuestionFormPayload = {
    id: this.questionData ? this.questionData.id : 0,
    questionText: this.form.value.questionText,
    questionType: this.form.value.questionType,
    marks: this.form.value.marks,
    correctAnswerIndex: this.form.value.correctAnswerIndex,
    isAllowableToLookDown: this.form.value.isAllowableToLookDown,
    questionChoices: choiceTexts,
  };

  const request$ = this.questionData
    ? this.quizService.updateQuestion(this.quizId, payload)
    : this.quizService.addQuestion(this.quizId, payload);

  request$.subscribe({
    next: (res) => { this.questionSaved.emit(res); },
    error: () => { /* Swal error toast */ }
  });
}
```

**Template layout**:
```
modal-header (dark navy gradient)
  "Add Question" | "Edit Question" title
  X close button

modal-body
  ├── Question Text (textarea, required)
  ├── Row: Question Type (dropdown) + Marks (number input)
  ├── Allow Looking Down (checkbox)
  ├── Answer Choices (FormArray loop)
  │   ├── [if MultipleChoice] + "Add Choice" button
  │   └── *ngFor choice: [radio correctAnswerIndex] [text input] [remove button if MC]
  └── Validation: "At least 2 choices required" (shown when MC + < 2)

modal-footer
  Cancel button (dismiss)
  Save button (submit, shows spinner when isSubmitting)
```

---

### Step 6 — Wire QuizDetailComponent into QuizViewComponent (existing)

No changes to `quiz-view.component.ts` or its HTML are needed. The `navigateToDetail(id)` method already calls `router.navigate(['/dashboard/courses', this.courseId, 'quizzes', id])` which will now route to the new `QuizDetailComponent`.

---

## Complexity Tracking

> No Constitution Check violations. The Stitch Design gap (Principle II) is an approved deviation per user-provided explicit layout specifications.

---

## Verification Plan

### Manual Verification Steps

1. **Navigation**: Click a quiz card in the Quizzes tab → confirm navigation to `/dashboard/courses/:courseId/quizzes/:quizId`
2. **Quiz Detail Load**: Verify header shows title, description, scheduled date, duration, total marks, quiz code
3. **Permission gating**: Remove `questions:read` → confirm detail page shows access-denied. Remove `questions:add` → confirm "+ Add Question" button is hidden
4. **Add Question (MultipleChoice)**: Click "+ Add Question", select MultipleChoice, fill 3 choices, select correct answer, submit → confirm new card appears at bottom
5. **Add Question (TrueFalse)**: Select TrueFalse → confirm choices lock to "True"/"False". Submit → confirm card appears
6. **Edit Question**: Click Edit on a question → confirm modal pre-populates all fields. Change text, submit → confirm card updates in place
7. **Toggle Question**: Click toggle button on a question → confirm card dims + "Inactive" badge appears without page reload
8. **Toggle Quiz Active**: Click the header toggle → confirm `isActive` state flips
9. **Back Navigation**: Click "Back to Quizzes" → confirm fixed route to `/dashboard/courses/:courseId/quizzes`
10. **Correct Answer Highlight**: Verify correct choice has green/teal tint + checkmark icon
11. **Minimum Choices Validation**: In MultipleChoice modal, delete choices until only 1 remains → confirm submit is blocked with error message
