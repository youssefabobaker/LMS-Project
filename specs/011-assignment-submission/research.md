# Research: Assignment Submission & Grading
**Feature**: `011-assignment-submission`
**Date**: 2026-05-14

---

## Decision 1: Parallel Data Fetching Pattern

**Decision**: On component init, use `forkJoin([getAssignmentsByCourseId(courseId), getStudentSubmissions()])` to load both assignments and submissions concurrently. After both resolve, build a local `submissionMap: Map<number, AssignmentSubmissionResponseDto>` keyed by `assignmentId`.

**Rationale**: The two API calls are fully independent. `forkJoin` is the idiomatic RxJS operator for parallel, completion-bounded streams. It eliminates sequential waterfall latency and is already used in other Lumina features.

**Alternatives considered**:
- Sequential fetch (get assignments → then get submissions) — rejected; adds unnecessary latency.
- Fetching submissions inline per card — rejected; creates N+1 API call explosion.

---

## Decision 2: Submission State Machine per Card

**Decision**: Determine each assignment card's student UI state from the `submissionMap` at render time:
- **No entry in map** → `NONE` state → show "Add Submission" button (Cyan Gradient, `btn-submit-add`).
- **Entry exists, `grade === null`** → `SUBMITTED` state → show "Edit Submission" (Outline, `btn-submit-edit`) + "Submitted" badge.
- **Entry exists, `grade !== null`** → `GRADED` state → show Grade + Feedback inside expanded card (read-only).

**Rationale**: A pure mapping function from data to UI state is testable, stateless, and avoids hidden boolean flags. It mirrors Angular's declarative template approach.

---

## Decision 3: Submit/Add Modal Architecture

**Decision**: Create a standalone `SubmissionAddEditComponent` that handles both Add and Edit modes via an `@Input() existingSubmission?: AssignmentSubmissionResponseDto`. It is hosted as a Bootstrap modal inside `AssignmentsViewComponent`.

**Rationale**: A single component for both Add and Edit prevents code duplication and is the same pattern used by `assignment-add` / `content-add`. The `existingSubmission` input drives mode selection at open time.

---

## Decision 4: Edit — Delete-Then-Submit Sequence

**Decision**: On Edit save, call `deleteSubmission(existingSubmission.id)` first. On success, call `submitAssignment(...)`. If delete succeeds but submit fails, display an inline error inside the open modal: *"Your previous submission was deleted but the new one could not be saved. Please retry or close."* The modal stays open; the parent list entry is removed to reflect the deletion.

**Rationale**: Matches FR-005 and the clarified Q1 answer. Keeping the modal open with user inputs intact allows immediate retry without data re-entry.

---

## Decision 5: Instructor Grading Dashboard — Routing vs. In-Page Panel

**Decision**: Use Angular Router to navigate to a new route `/courses/:courseId/assignments/:assignmentId/submissions` which renders a new `AssignmentSubmissionsListComponent`. A "View Submissions" button on each card navigates there.

**Rationale**: A full page for the submissions list is appropriate — it is a distinct context from the assignment list, and routing enables browser back-navigation. A modal would be too constrained for a student table with attachment previews.

**Alternatives considered**:
- Inline expandable panel inside the card — rejected; space-constrained and loses context when scrolling.
- Route-less modal — rejected; deep navigation and multiple student rows benefit from a full page.

---

## Decision 6: New Service — `AssignmentSubmissionService`

**Decision**: Create a dedicated `AssignmentSubmissionService` under `src/app/core/services/` with the following methods:
- `submitAssignment(dto: CreateSubmissionDto): Observable<AssignmentSubmissionResponseDto>`
- `getStudentSubmissions(): Observable<AssignmentSubmissionResponseDto[]>`
- `getSubmissionsForAssignment(assignmentId: number): Observable<AssignmentSubmissionResponseDto[]>`
- `deleteSubmission(id: number): Observable<void>`
- `gradeSubmission(id: number, grade: number, feedback?: string): Observable<AssignmentSubmissionResponseDto>`

**Rationale**: Submission logic is a distinct API boundary from `AssignmentService`. Separating it follows the Separation of Concerns principle (Constitution IV) and prevents `AssignmentService` from becoming a god service.

---

## Decision 7: Model Interfaces Location

**Decision**: Add `AssignmentSubmissionResponseDto`, `AssignmentSubmissionAttachmentDto`, and `CreateSubmissionDto` to `src/app/models/assignment.model.ts` (co-located with existing assignment models).

**Rationale**: These are tightly coupled to the existing assignment model and have no consumers outside the assignments feature. Keeping them in the same file mirrors how `AssignmentResponseDto` and `AssignmentAttachmentDto` are already co-located.

---

## Decision 8: Late Submission Badge

**Decision**: Compare `submission.submittedAt > assignment.dueDate` at render time. If true, render a `<span class="badge bg-danger ms-2">Late</span>` beside the "Submitted" badge. No additional API fields are needed.

**Rationale**: The comparison is cheap, purely client-side, and avoids backend schema changes. Matches FR-011 and the Q2 clarification.

---

## Decision 9: Grading Modal

**Decision**: Implement a Bootstrap modal `GradeSubmissionModalComponent` (standalone). Triggered from the submission list page. Uses a simple reactive form with `grade` (required, numeric) and `feedback` (optional, textarea). Calls `gradeSubmission()` on save.

**Rationale**: A modal form for grading is standard UX, keeps the student list visible in the background, and is consistent with the rest of the Lumina modal pattern.

---

## Decision 10: File Opening for Instructors

**Decision**: In the submissions list, clicking an attachment calls `window.open(attachment.fileUrl, '_blank')`. No preview iframe is embedded.

**Rationale**: Matches FR-009. Simple, reliable, and avoids CORS complexity with external storage URLs.
