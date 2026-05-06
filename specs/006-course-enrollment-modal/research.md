# Research: Course Enrollment Modal

**Feature**: 006-course-enrollment-modal
**Date**: 2026-05-05

---

## Decision 1: Instructor Filtering Strategy

**Decision**: Filter the full user list **client-side** using `roles.includes('Instructor')` (case-insensitive) after fetching from the existing `UserService.getUsers()` endpoint.

**Rationale**: The `User` model already includes a `roles: string[]` field which is populated by the API. No new endpoint is needed. The existing `UserService.getUsers()` is the correct call. This avoids backend coupling and keeps the new component self-contained.

**Alternatives considered**:
- Using `getInstructorsByDepartment(departmentId)` — Rejected: scopes to one department only; enrollment should allow cross-department instructors.
- Adding a new `/api/Users?role=instructor` query param — Deferred: would require backend change; not needed given client-side approach is sufficient.

---

## Decision 2: Enrolled Users Endpoint

**Decision**: Add three new methods to **`CourseService`**:
- `getEnrolledUsers(courseId: number)` → `GET /api/Course/{courseId}/users`
- `enrollUser(courseId: number, userId: string)` → `POST /api/Course/{courseId}/users` body: `{ userId }`
- `unenrollUser(courseId: number, userId: string)` → `DELETE /api/Course/{courseId}/users/{userId}`

**Rationale**: All three operations are scoped to the Course resource so they belong in `CourseService` per the Separation of Concerns principle. The response normalizer will handle camelCase/PascalCase inconsistencies (same pattern as `normalizeAssessment`).

**Alternatives considered**:
- Adding to `UserService` — Rejected: these are course-scoped operations, not user-scoped.

---

## Decision 3: Component Modal Pattern

**Decision**: Mirror the **exact same Bootstrap modal + `@ViewChild` + `open(courseId, courseName)` pattern** used by `CourseAssessmentComponent`.

**Rationale**: The assessment modal is already proven in production. It:
- Uses a named Bootstrap modal `<div id="enrollmentModal">` embedded in `course-view.component.html`.
- Is instantiated with `bootstrap.Modal.getInstance()` to prevent duplicate listeners.
- Has an `open(courseId, courseName)` method on the child to avoid `@Input` timing race conditions.

**Alternatives considered**:
- Route-based modal (current `navigateToEnrollment` uses router) — Rejected per user request: must be a modal component, not a routed page.

---

## Decision 4: Inline Unenroll Confirmation

**Decision**: Track a `confirmingUnenrollId: string | null` state variable in the component. When the trash icon is clicked, set `confirmingUnenrollId = user.id`. The template conditionally renders "Confirm / Cancel" buttons in place of the icon for the matching row.

**Rationale**: This is a pure template/state approach with zero additional UI components. It matches the spec requirement (inline, not a modal dialog) and is idiomatic Angular reactive state.

---

## Decision 5: Toast Notifications

**Decision**: Use **SweetAlert2 (`Swal.fire`)** for toast notifications, consistent with the pattern already in `CourseViewComponent` (delete success/error, toggle error).

**Rationale**: SweetAlert2 is already imported and used across the project. Using it for the enrollment toasts ensures visual consistency without adding a new dependency. The `toast: true` + `position: 'bottom-end'` config produces the standard non-blocking toast pattern.

---

## Decision 6: Dropdown Exclusion Logic

**Decision**: Compute `availableInstructors` as a **derived getter**:
```
get availableInstructors(): User[] {
  const enrolledIds = new Set(this.enrolledUsers.map(u => u.id));
  return this.allInstructors.filter(u => !enrolledIds.has(u.id));
}
```

**Rationale**: Using a getter means it automatically recomputes after any enrollment/unenrollment without manual refresh calls. `allInstructors` is set once on load (all users with instructor role); `enrolledUsers` is mutated in-place on each action.

---

## Decision 7: Empty Dropdown State

**Decision**: When `availableInstructors.length === 0`, the "Enroll" button is `[disabled]="true"` and a `<p class="text-muted small">` appears below the dropdown reading "All available instructors are already enrolled."

**Rationale**: Specified directly in FR-015 and clarification Q4-A. Simple `*ngIf` on the message, `[disabled]` binding on the button.

---

## Decision 8: Model — EnrolledUser

**Decision**: Define a minimal `EnrolledUser` interface in `src/app/models/enrolled-user.ts`:
```typescript
export interface EnrolledUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
```

**Rationale**: The full `User` model has fields irrelevant to the enrollment table (departmentId, academicYear, isDisabled, roles). A slimmer interface keeps the display layer clean and matches exactly what FR-001/Q2 requires (name + email). The normalize function maps from API response to this interface.
