# Research: Course Add / Edit Modal (Cycle 2)

**Feature**: `specs/004-course-add-edit/`
**Date**: 2026-05-02

---

## Decision 1: Modal Delivery Mechanism

- **Decision**: Use a native Bootstrap 5 Modal triggered programmatically via Angular (no `NgbModal` from ng-bootstrap dependency). The `CourseAddEditComponent` is loaded inside a `<div class="modal">` that is toggled by the parent component using Bootstrap's JS API via `bootstrap.Modal`.
- **Rationale**: The project already uses Bootstrap 5 directly and does not have ng-bootstrap installed. Introducing `NgbModal` would add a new dependency outside the approved technology stack (Constitution §II & §V). Bootstrap's JS Modal is fully functional and keeps the stack clean.
- **Alternatives considered**: `NgbActiveModal` (ng-bootstrap) — rejected because it requires installing `@ng-bootstrap/ng-bootstrap` and its own `NgbModule`, violating the no-NgModule principle; Angular CDK Dialog — rejected for same reason (extra dependency).

---

## Decision 2: multipart/form-data Upload Strategy

- **Decision**: Use `new FormData()` in the component and pass it directly to `HttpClient.post()` / `HttpClient.put()`. Do **NOT** set the `Content-Type` header manually — Angular's `HttpClient` will let the browser auto-set `multipart/form-data` with the correct boundary string when it detects a `FormData` body.
- **Rationale**: Manually setting `Content-Type: multipart/form-data` omits the `boundary` parameter, causing a `400 Bad Request` on the server. The correct approach is to omit the header entirely.
- **Alternatives considered**: Using `HttpHeaders` to set Content-Type — rejected because the boundary is generated at runtime and cannot be hardcoded.

---

## Decision 3: Image Preview Generation

- **Decision**: Use the browser's `FileReader` API with `readAsDataURL()` to generate a Base64 preview URL stored in a local component property (`imagePreviewUrl: string | null`). The actual `File` object is stored in a separate property (`selectedFile: File | null`) for FormData construction on submit.
- **Rationale**: Keeps the preview fully client-side with no upload until the form is submitted. Matches the stitch design which shows a thumbnail preview area inside the modal.
- **Alternatives considered**: `URL.createObjectURL()` — simpler but requires manual revocation to avoid memory leaks; chosen approach is simpler for the LMS use case.

---

## Decision 4: Dirty-State Detection

- **Decision**: Use Angular Reactive Form's built-in `form.dirty` flag. On Cancel/× button click, check `this.form.dirty` — if true, show a SweetAlert2 confirmation dialog ("Discard changes?"); if false, dismiss directly. Escape key always dismisses silently (handled by Bootstrap modal's `keyboard: true` default).
- **Rationale**: `form.dirty` is automatically tracked by Angular when any control's value changes from its initial value. No manual tracking needed. SweetAlert2 is already in use across the app (User Management, Role Management).
- **Alternatives considered**: Custom `isDirty` boolean flag — redundant since Angular provides this natively.

---

## Decision 5: departmentId Sourcing

- **Decision**: 
  - **Create**: The form contains a `departmentId` dropdown field populated from `AuthService.getDepartments()`. The selected value is appended to FormData at submit time.
  - **Edit**: `departmentId` is read from `course.departmentId` on the input `@Input() courseData` passed to the modal from the parent.
- **Rationale**: Confirmed by Q5 clarification. The `Course` model currently lacks a `departmentId` field — it must be added to the model interface to support Edit mode round-tripping.
- **Alternatives considered**: Reading from JWT — rejected per user clarification.

---

## Decision 6: In-Place State Update Strategy

- **Decision**:
  - **After Create**: Call `applyFilters()` reset (searchTerm = '', selectedSemester = ''), then `unshift()` the new course into `this.courses`.
  - **After Edit**: Find the course by `Id` in `this.courses` using `findIndex()` and replace it with the updated object using array spread.
- **Rationale**: Avoids a network round-trip and matches the optimistic pattern already established in `CourseViewComponent.toggleStatus()`.
- **Alternatives considered**: Full `loadCourses()` refetch — rejected; contradicts FR-010, FR-011, and the in-place update UX requirement.

---

## Decision 7: Course Model Extension

- **Decision**: Add the missing fields to `src/app/models/course.ts`:
  - `LearningOutcomes: string` — required by the form
  - `academicLevel: number` — required by the form (1–5)
  - `departmentId: number` — required for Edit mode and API calls
- **Rationale**: These fields are in the backend response but absent from the current interface, causing TypeScript errors when patching the edit form.
- **Alternatives considered**: Using `any` typing — rejected; violates Principle IV (strong typing via model interfaces).
