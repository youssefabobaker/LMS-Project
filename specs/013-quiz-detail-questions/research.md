# Research: Quiz Detail Page & Question Management

**Date**: 2026-06-20
**Feature**: 013-quiz-detail-questions

---

## Finding 1: Existing Route Structure

**Decision**: The quiz detail route `courses/:courseId/quizzes/:quizId` already exists in `app.routes.ts` (line 107-111) but currently redirects back to the quiz list. It must be replaced with a real `QuizDetailComponent` registered with the `questions:read` permission guard.

**Rationale**: Routing infrastructure is already in place; only the redirect needs to be replaced.

**Alternatives considered**: Creating a lazy-loaded route module — rejected because existing routes are all eagerly loaded.

---

## Finding 2: API Base URL — Absolute-Path Question Routes

**Decision**: The Question Controller uses **absolute routes** (not prefixed with `/api`):
- `POST /Quiz/{quizId}` — Add question
- `POST /Update/QuizId/{quizId}` — Update question
- `POST /ToggleStatus/QuizId/{quizId}/QuestionId{questionId}` — Toggle (note: no slash before `{questionId}`)
- `GET /api/Quiz/{id}` — Get quiz by ID (this IS under `/api`)
- `PATCH /api/Quiz/{id}/toggle-active` — Toggle quiz active

The `QuizService` base URL is `https://localhost:7289/api/Quiz`. The question methods must compute their own roots: `https://localhost:7289/Quiz/...` and `https://localhost:7289/ToggleStatus/...`.

**Rationale**: The API documentation explicitly states the QuestionController uses absolute paths. Confirmed by reading the API docs.

**Alternatives considered**: Creating a separate `QuestionService` — the user spec explicitly says to expand the same `quiz.service.ts` file.

---

## Finding 3: Angular Reactive Forms — Dynamic FormArray for Choices

**Decision**: Use Angular `FormArray` to manage the dynamic list of answer choices. When `questionType` changes:
- **MultipleChoice (0)**: Clear the array, then allow adding/removing `FormControl` items. Min 2 required.
- **TrueFalse (1)**: Clear the array, push two fixed `FormControl('True')` and `FormControl('False')` items, then call `.disable()` on both to lock them.

**Rationale**: `FormArray` is the idiomatic Angular approach for dynamic lists. Disabling individual controls prevents editing while still including them in the form value.

**Alternatives considered**: `*ngFor` on a plain array with `[(ngModel)]` — rejected because it bypasses reactive form validation.

---

## Finding 4: Edit Mode — Type String → Integer Mapping

**Decision**: The API's `QuestionResponseDto` returns `questionType` as a **string** (`"MultipleChoice"` or `"TrueFalse"`). When opening the edit modal, this must be mapped back to `0` or `1` for the dropdown form control. Map: `"MultipleChoice" → 0`, `"TrueFalse" → 1`.

**Rationale**: The add/update API payload requires `questionType` as an integer. The display uses string but submission uses int.

**Alternatives considered**: Storing both representations — rejected to avoid model duplication.

---

## Finding 5: Local State Updates (No Full Reload)

**Decision**: After any mutation (add/edit question, toggle question status, toggle quiz active), update the local in-memory array/object directly from the API response, never triggering a new `GET /api/Quiz/{id}` call.

- **Add question**: `this.quiz.quizQuestions.push(responseDto)`
- **Edit question**: Find by `id` in the array and replace with `responseDto`
- **Toggle question**: Find by `id` and replace `isActive` from the `responseDto`
- **Toggle quiz active**: Update `this.quiz.isActive` from the `{ isActive: bool }` response

**Rationale**: Matches the established pattern in `AssignmentDetailComponent` and `QuizViewComponent` (in-place array updates).

---

## Finding 6: Stitch Design Gap

**Decision**: No `stitch-designs/quiz-detail/` folder exists. Per Constitution II, one must be created or flagged. Since the user has explicitly provided detailed layout instructions (header with meta, question cards, modal form), and the visual style is identical to the existing `assignment-detail` pattern, the Stitch design gap is **documented** here and the implementation uses the Assignment Detail as the visual reference. This is noted as a minor Constitution II deviation explicitly approved by the user's instruction.

**Rationale**: User-provided layout spec + existing reference components serve as the design blueprint.

---

## Finding 7: Model Location Convention

**Decision**: The project stores models in `src/app/models/` (not `src/app/core/models/` as the Constitution states). All existing models (`quiz.model.ts`, `assignment.model.ts`, etc.) are in `src/app/models/`. New interfaces will follow the same convention to avoid breaking imports.

**Rationale**: The Constitution says `src/app/core/models/` but the actual codebase uses `src/app/models/`. Scope-Lock principle (V) requires following the actual codebase pattern.
