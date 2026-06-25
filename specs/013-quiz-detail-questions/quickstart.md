# Quickstart: Quiz Detail Page & Question Management

**Feature**: 013-quiz-detail-questions
**Date**: 2026-06-20

---

## What This Feature Does

Adds a full Quiz Detail Page that instructors navigate to by clicking a quiz card. The page shows the complete quiz with all its questions and allows adding, editing, and toggling individual questions.

---

## Files to Create (New)

| File | Purpose |
|---|---|
| `src/app/features/quizzes/quiz-detail/quiz-detail.component.ts` | Page component: loads quiz, manages state |
| `src/app/features/quizzes/quiz-detail/quiz-detail.component.html` | Page template: header, question cards |
| `src/app/features/quizzes/quiz-detail/quiz-detail.component.css` | Scoped styles |
| `src/app/features/quizzes/question-form-modal/question-form-modal.component.ts` | Modal form component for add/edit questions |
| `src/app/features/quizzes/question-form-modal/question-form-modal.component.html` | Modal template with dynamic FormArray |
| `src/app/features/quizzes/question-form-modal/question-form-modal.component.css` | Modal scoped styles |

---

## Files to Modify (Existing)

| File | Change |
|---|---|
| `src/app/models/quiz.model.ts` | Append 5 new interfaces (append-only, no existing code changed) |
| `src/app/core/services/quiz.service.ts` | Append 5 new methods + `questionBaseUrl` property + `normalizeDetail`/`normalizeQuestion` private helpers |
| `src/app/app.routes.ts` | Replace quiz detail redirect with real `QuizDetailComponent` route |

---

## Key Implementation Notes

### URL Gotcha — Question Controller Absolute Paths
The three Question endpoints do NOT use the `/api` prefix:
```
POST https://localhost:7289/Quiz/{quizId}
POST https://localhost:7289/Update/QuizId/{quizId}
POST https://localhost:7289/ToggleStatus/QuizId/{quizId}/QuestionId{questionId}
                                                                    ↑ NO slash here!
```

### Type Mapping — Edit Mode
API returns `questionType` as a string, form needs an integer:
```typescript
const typeInt = questionData.questionType === 'TrueFalse' ? 1 : 0;
```

### Dynamic FormArray — Type Switch
When `questionType` control changes:
- **0 (MultipleChoice)**: Clear array → add 2 empty editable `FormControl`s
- **1 (TrueFalse)**: Clear array → push `{value: 'True', disabled: true}` and `{value: 'False', disabled: true}`

### Inactive Question Card Visual
```html
<div class="content-card mb-4" [class.opacity-50]="!question.isActive">
  <span *ngIf="!question.isActive" class="badge bg-secondary ms-2">Inactive</span>
```

### Correct Answer Highlight
```html
<div *ngFor="let choice of question.questionChoices"
     [class.text-success]="choice.isCorrect"
     [class.bg-success]="choice.isCorrect"
     [class.bg-opacity-10]="choice.isCorrect">
  <i *ngIf="choice.isCorrect" class="bi bi-check-circle-fill text-success me-2"></i>
  {{ choice.choiceText }}
</div>
```

---

## Permissions Summary

| Permission | Gates |
|---|---|
| `questions:read` | Entire page access (route guard) |
| `questions:add` | "+ Add Question" button |
| `questions:update` | Edit button + Toggle button on each question card |
| `Quiz:addOrUpdate` | Active toggle switch in page header |

---

## Dev Server
The app is already running via `ng serve`. Just navigate to:
```
http://localhost:4200/dashboard/courses/{courseId}/quizzes/{quizId}
```
