# Data Model: Assignment Submission & Grading
**Feature**: `011-assignment-submission`
**Date**: 2026-05-14

---

## New Interfaces — `src/app/models/assignment.model.ts` (additions)

### `AssignmentSubmissionAttachmentDto`

Represents a file attached to a student's submission.

| Field | Type | Source | Notes |
|---|---|---|---|
| `id` | `string` (Guid) | API | Unique attachment identifier |
| `fileName` | `string` | API | Original filename |
| `fileUrl` | `string` | API | Public URL to view/download |
| `type` | `string` | API | MIME type (`application/pdf`, `video/mp4`) |

### `AssignmentSubmissionResponseDto`

The full submission record returned by all submission endpoints.

| Field | Type | Source | Notes |
|---|---|---|---|
| `id` | `number` | API | Submission primary key |
| `assignmentId` | `number` | API | Links to `AssignmentResponseDto.id` |
| `studentId` | `string` | API | JWT-resolved; not used in UI display |
| `textSubmission` | `string \| null` | API | Optional text answer |
| `submittedAt` | `string` | API | ISO 8601; used for "Late" badge comparison |
| `grade` | `number \| null` | API | `null` = Submitted (ungraded); non-null = Graded |
| `feedback` | `string \| null` | API | Instructor feedback text |
| `assignmentSubmissionAttachments` | `AssignmentSubmissionAttachmentDto[]` | API | May be empty |

### `CreateSubmissionDto`

Used as the request body (multipart/form-data) for the submit endpoint.

| Field | Type | Required | Notes |
|---|---|---|---|
| `assignmentId` | `number` | Yes | Which assignment |
| `textSubmission` | `string` | No | Text answer |
| `attachmentFiles` | `File[]` | No | PDF or MP4 files ≤ 500 MB total |

### `GradeSubmissionDto`

Used as the JSON request body for the grade endpoint.

| Field | Type | Required | Notes |
|---|---|---|---|
| `grade` | `number` | Yes | Numeric score |
| `feedback` | `string` | No | Written instructor feedback |

---

## State Machine per Assignment Card (Student View)

```
submissionMap.get(assignment.id) result
         │
    ┌────┴──────────┐
   none           exists
    │                │
  NONE           grade === null?
 (Add btn)         │
              ┌────┴────┐
             Yes        No
              │          │
          SUBMITTED    GRADED
        (Edit btn +  (Grade + Feedback
         badge)       in expanded card)
```

---

## Component / File Inventory

### New Components
| Component | Path | Responsibility |
|---|---|---|
| `SubmissionAddEditComponent` | `src/app/features/assignments/submission-add-edit/` | Add/Edit submission modal (student) |
| `AssignmentSubmissionsListComponent` | `src/app/features/assignments/assignment-submissions-list/` | Instructor view — list all students' submissions |
| `GradeSubmissionModalComponent` | `src/app/features/assignments/grade-submission-modal/` | Instructor grading modal |

### Modified Files
| File | Change |
|---|---|
| `src/app/models/assignment.model.ts` | Add 4 new interfaces above |
| `src/app/core/services/assignment-submission.service.ts` | **New** — all submission API calls |
| `src/app/features/assignments/assignments-view/assignments-view.component.ts` | Add `forkJoin` init, `submissionMap`, student permission flags, `openSubmissionModal()` |
| `src/app/features/assignments/assignments-view/assignments-view.component.html` | Add student state buttons + submission modal host |
| `src/app/app.routes.ts` | Add `/courses/:courseId/assignments/:assignmentId/submissions` route |

---

## Routing

```
/courses/:courseId
  └─ (Content/Assignments tab in content-view)
       └─ [Assignments tab active]
            └─ "View Submissions" button navigates to →
                 /courses/:courseId/assignments/:assignmentId/submissions
                 → AssignmentSubmissionsListComponent
```

---

## Permission Map

| Permission Key | Consumer | Gate |
|---|---|---|
| `Ass:solve` | Student — Add/Edit submission buttons | `canSubmit` flag in `AssignmentsViewComponent` |
| `AssSubmission:read` | Student — view own grade/feedback | `canReadSubmission` |
| `AssSubmission:readAll` | Instructor — View Submissions page | `canReadAllSubmissions` |
| `AssSubmission:delete` | Student — delete before re-submit | Called internally, not directly exposed |
| `Ass:Grade` | Instructor — Grading modal | `canGrade` flag in `AssignmentSubmissionsListComponent` |
