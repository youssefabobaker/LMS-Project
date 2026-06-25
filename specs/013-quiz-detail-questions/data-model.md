# Data Model: Quiz Detail Page & Question Management

**Date**: 2026-06-20
**Feature**: 013-quiz-detail-questions
**Source**: `backend APIs/quiz_question_api.md` + existing `src/app/models/quiz.model.ts`

---

## Existing Interfaces (in `src/app/models/quiz.model.ts`)

These already exist and must NOT be changed:

```typescript
// GET /api/Quiz/course/{courseId} — list view only
export interface QuizListItemDto { ... }

// POST /api/Quiz/course/{courseId} body
export interface QuizCreateUpdateDto { ... }
```

---

## New Interfaces to Add (append to `src/app/models/quiz.model.ts`)

### QuizDetailDto
Returned by `GET /api/Quiz/{id}`.

```typescript
export interface QuizDetailDto {
  id: number;
  title: string;
  description: string;
  scheduledDate: string;    // ISO 8601 — append 'Z' if missing
  duration: string;         // "HH:mm:ss"
  totalMarks: number;
  isActive: boolean;
  quizCode: string;
  courseId: number;
  quizQuestions: QuestionResponseDto[];
}
```

### QuestionResponseDto
Returned by all question endpoints on success.

```typescript
export interface QuestionResponseDto {
  id: number;
  isActive: boolean;
  questionText: string;
  questionType: string;             // "MultipleChoice" | "TrueFalse"
  marks: number;
  isAllowableToLookDown: boolean;
  questionChoices: QuestionChoiceDto[];
}
```

### QuestionChoiceDto
Nested in `QuestionResponseDto`.

```typescript
export interface QuestionChoiceDto {
  id: number;
  choiceText: string;
  isCorrect: boolean;
}
```

### QuestionFormPayload
Sent to POST `/Quiz/{quizId}` (add) and POST `/Update/QuizId/{quizId}` (edit).

```typescript
export interface QuestionFormPayload {
  id: number;                   // 0 for new, existing id for update
  questionText: string;
  questionType: number;         // 0 = MultipleChoice, 1 = TrueFalse
  marks: number;
  correctAnswerIndex: number;   // zero-based index into questionChoices array
  isAllowableToLookDown: boolean;
  questionChoices: string[];    // array of choice text strings
}
```

### QuizToggleActiveResponse
Returned by `PATCH /api/Quiz/{id}/toggle-active`.

```typescript
export interface QuizToggleActiveResponse {
  isActive: boolean;            // the NEW state after toggle
}
```

---

## State Transitions

### Quiz `isActive`
```
Active ──PATCH /api/Quiz/{id}/toggle-active──► Inactive
Inactive ──PATCH /api/Quiz/{id}/toggle-active──► Active
```

### Question `isActive`
```
Active ──POST /ToggleStatus/QuizId/{quizId}/QuestionId{questionId}──► Inactive
Inactive ──POST /ToggleStatus/...──► Active
```

---

## Validation Rules

| Field | Rule |
|---|---|
| `questionText` | Required, non-empty string |
| `questionType` | Required, must be 0 or 1 |
| `marks` | Required, numeric, > 0 |
| `questionChoices` (MultipleChoice) | Minimum 2 non-empty strings |
| `questionChoices` (TrueFalse) | Exactly ["True", "False"], locked |
| `correctAnswerIndex` | Required, 0-based, within bounds of `questionChoices` array |
| `isAllowableToLookDown` | Boolean, defaults to `false` |
