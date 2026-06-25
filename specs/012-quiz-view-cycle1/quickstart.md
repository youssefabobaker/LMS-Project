# Quickstart: Quiz View – Cycle 1

**Feature**: 012-quiz-view-cycle1  
**Date**: 2026-06-19

---

## Prerequisites

- Angular dev server running: `ng serve`
- Backend running on `https://localhost:7289`
- JWT in `localStorage['token']` with `Quiz:read`, `Quiz:addOrUpdate`, `Quiz:delete`, and/or `questions:read` permissions

---

## Files to Create (in order)

1. `src/app/models/quiz.model.ts` — interfaces `QuizListItemDto`, `QuizCreateUpdateDto`
2. `src/app/core/services/quiz.service.ts` — `QuizService` with 3 methods
3. `src/app/features/quizzes/quiz-add-edit/quiz-add-edit.component.ts` — modal form component
4. `src/app/features/quizzes/quiz-add-edit/quiz-add-edit.component.html` — modal form template
5. `src/app/features/quizzes/quiz-add-edit/quiz-add-edit.component.css` — minimal overrides
6. `src/app/features/quizzes/quiz-view/quiz-view.component.ts` — list + CRUD logic
7. `src/app/features/quizzes/quiz-view/quiz-view.component.html` — card list template
8. `src/app/features/quizzes/quiz-view/quiz-view.component.css` — quiz-code badge + meta chips
9. `stitch-designs/quiz-view/index.html` — static HTML mock (Task 0 blocker)

---

## Files to Modify (in order)

10. `src/app/features/content/content-view/content-view.component.ts` — add `'quizzes'` tab branch
11. `src/app/features/content/content-view/content-view.component.html` — add tab button + hidden slot
12. `src/app/app.routes.ts` — register two new child routes

---

## Verify

```bash
ng build --configuration=production
```
Zero errors expected. Then manually test through the browser at `http://localhost:4200/dashboard/courses`.

---

## Key Patterns to Follow

| Pattern | Where to look |
|---------|--------------|
| Tab switch + lazy init | `content-view.component.ts` `switchTab()` |
| Permission flags in `ngOnInit()` | `assignments-view.component.ts` |
| Bootstrap modal open/close | `course-view.component.ts` `openModal()` |
| SweetAlert2 confirmation | `assignments-view.component.ts` `deleteAssignment()` |
| SweetAlert2 success toast | `content-view.component.ts` `saveEdit()` |
| Local list mutation (splice) | `content-view.component.ts` `onContentCreated()` |
| Normalize API response | `assignment.service.ts` `normalizeAssignment()` |
| 404 → empty array | `assignments-view.component.ts` `loadData()` error handler |
