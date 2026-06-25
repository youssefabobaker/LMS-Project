# Research: Quiz View – Cycle 1

**Feature**: 012-quiz-view-cycle1  
**Date**: 2026-06-19  
**Status**: Complete — all unknowns resolved

---

## 1. Tab-Switching Pattern

**Decision**: Reuse the `activeTab` string-union pattern from `content-view.component.ts`.  
**Rationale**: `ContentViewComponent` already implements a clean `'content' | 'assignments'` tab union with `[hidden]` for DOM preservation and lazy initialization guards (`assignmentsInitialized`). The Quiz tab will extend this union to `'content' | 'assignments' | 'quizzes'` with the same lazy-init flag `quizzesInitialized`.  
**Alternatives considered**: Angular `@defer` block — rejected because the project targets a version that already uses `[hidden]` consistently.

---

## 2. Model File Location

**Decision**: Models live in `src/app/models/` (not `src/app/core/models/`).  
**Rationale**: All existing models (`assignment.model.ts`, `content.ts`, `course.ts`) are under `src/app/models/`. Constitution says `src/app/core/models/` but the actual project diverges — Scope-Lock requires following the project convention, not restructuring it.  
**New file**: `src/app/models/quiz.model.ts`

---

## 3. Permission-Flag Pattern

**Decision**: Synchronous `permissionService.hasPermission(name)` calls in `ngOnInit()`, stored as boolean component properties.  
**Rationale**: `PermissionService.hasPermission()` decodes the JWT synchronously from `localStorage`. No observable needed. Every existing feature component (`AssignmentsViewComponent`, `ContentViewComponent`) follows this exact pattern.  
**Permissions needed**:
- `canReadQuiz` — `Quiz:read`  
- `canAddOrUpdateQuiz` — `Quiz:addOrUpdate`  
- `canDeleteQuiz` — `Quiz:delete`  
- `canReadQuestions` — `questions:read`

---

## 4. Duration Conversion

**Decision**: Pure function inside the component (or a shared utility function) — no Angular Pipe.  
**Rationale**: A pipe would require registration in the standalone imports array of every consumer. A utility function `parseDurationToMinutes(duration: string): number` is simpler, co-located, and consistent with how `assignment.model.ts` handles date normalization (the `fixDate` function pattern).  
**Algorithm**: Split `HH:mm:ss` → `hours * 60 + minutes + Math.round(seconds / 60)`. Display as `"X min"`.

---

## 5. HTTP Service Pattern

**Decision**: New `QuizService` under `src/app/core/services/quiz.service.ts`, following `AssignmentService` as the template.  
**Rationale**: Every feature has a dedicated service. The assignment service pattern (normalize function + cache) maps directly to quiz needs. The quiz service will normalize raw API JSON to typed `QuizListItemDto` objects.  
**Base URL**: `https://localhost:7289/api/Quiz`

---

## 6. Quiz Add/Edit Modal

**Decision**: Inline Bootstrap 5 modal hosted inside `quiz-view.component.html`, using a child `QuizAddEditComponent` via `@ViewChild` — same pattern as `CourseViewComponent` with `CourseAddEditComponent`.  
**Rationale**: The project uses Bootstrap modal API via `window.bootstrap.Modal.getOrCreateInstance(el)` consistently. Reusing this avoids introducing a new modal library.  
**Alternative considered**: Angular CDK Dialog — rejected for consistency.

---

## 7. Navigation to Quiz Detail (Cycle 2)

**Decision**: `this.router.navigate(['/dashboard/courses', courseId, 'quizzes', quizId])` with `$event.stopPropagation()` on action buttons.  
**Rationale**: This follows the assignment detail pattern: `navigateToDetail()` calls `router.navigate` with the `courseId` + `quizId`. The route `/dashboard/courses/:courseId/quizzes/:quizId` will be registered in `app.routes.ts` as a stub pointing to a placeholder component (or `redirectTo: 'quizzes'`) until Cycle 2 is built.

---

## 8. SweetAlert2 Patterns (existing project conventions)

From existing code:
- **Confirmation before destructive action**: `Swal.fire({ title, text, icon: 'warning', showCancelButton: true, confirmButtonColor: '#E63946', cancelButtonColor: '#41B3E3' })`
- **Success toast**: `Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', showConfirmButton: false, timer: 3000, timerProgressBar: true })`
- **Error dialog**: `Swal.fire({ icon: 'error', title, text, confirmButtonColor: '#41B3E3' })`
- **Warning before edit-save** (new for quiz): `Swal.fire({ icon: 'warning', title: 'Quiz Code Will Change', text: '...', showCancelButton: true })` — same shape as delete confirmation.

---

## 9. Stitch Design Status

No `stitch-designs/quiz-view/` subfolder exists. Per Constitution II, one **must be created and populated before implementation begins**, or the gap **must be flagged as a blocker**.

**Resolution**: Flag as a blocker — the stitch design for quiz-view must be created before the implementation task begins. The plan marks this as Task 0.

---

## 10. Route Registration

**Decision**: Add two new child routes to `app.routes.ts`:
1. `/dashboard/courses/:courseId/quizzes` → `ContentViewComponent` (same host, `permissionGuard` with `Quiz:read`)
2. `/dashboard/courses/:courseId/quizzes/:quizId` → stub `redirectTo: 'quizzes'` (Cycle 2 placeholder)

**Rationale**: `ContentViewComponent` already hosts both Content and Assignments tabs. The Quizzes tab is served by the same component host — the `activeTab` state determines which child view renders.
