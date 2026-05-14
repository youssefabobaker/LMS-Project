# Data Model: Add Assignment Modal
**Feature**: `010-assignment-add`
**Date**: 2026-05-14

---

## Entities

### AssignmentResponseDto *(existing — `src/app/models/assignment.model.ts`)*

| Field | Type | Validation |
|---|---|---|
| `id` | `number` | ≥ 0 (0 = new, >0 = existing) |
| `title` | `string` | Required, non-empty |
| `description` | `string` | Required, non-empty |
| `dueDate` | `string` | Required, ISO 8601 datetime string |
| `totalMarks` | `number` | Required, > 0 |
| `assignmentAttachments` | `AssignmentAttachmentDto[]` | Optional, may be empty |

### AssignmentAttachmentDto *(existing — `src/app/models/assignment.model.ts`)*

| Field | Type | Notes |
|---|---|---|
| `id` | `string` (Guid) | Assigned by backend |
| `fileName` | `string` | Original filename |
| `fileUrl` | `string` | Public download URL |
| `type` | `string` | MIME type: `application/pdf` or `video/mp4` |

### StagedFile *(reused from `src/app/models/content.ts`)*

| Field | Type | Notes |
|---|---|---|
| `file` | `File` | Native browser File object |
| `name` | `string` | Display name |
| `size` | `number` | Bytes |
| `mimeType` | `string` | `application/pdf` or `video/mp4` |

---

## State Model — AssignmentAddComponent

| Property | Type | Initial Value | Purpose |
|---|---|---|---|
| `title` | `string` | `''` | Bound to Title input |
| `description` | `string` | `''` | Bound to Description textarea |
| `dueDate` | `string` | `''` | Bound to datetime-local input |
| `totalMarks` | `number \| null` | `null` | Bound to number input |
| `stagedFiles` | `StagedFile[]` | `[]` | Files staged for upload |
| `isSubmitting` | `boolean` | `false` | Disables all controls during API calls |
| `submitError` | `string` | `''` | Error message shown in alert |
| `retryMode` | `boolean` | `false` | True if Step 1 succeeded but Step 2 failed |
| `createdAssignmentId` | `number \| null` | `null` | ID returned from Step 1, used for Step 2 |

---

## API Calls

### Step 1: Create Assignment
- **Method**: `POST /api/Assignment/course/{courseId}`
- **Body**: `{ id: 0, title, description, dueDate (ISO 8601), totalMarks }`
- **Success**: Returns `AssignmentResponseDto` (with `id > 0`); proceed to Step 2 if files staged.
- **Failure**: Show error in modal; remain open; do not proceed to Step 2.

### Step 2: Upload Attachments
- **Method**: `POST /api/Assignment/{assignmentId}/attachments`
- **Body**: `multipart/form-data`, field name: `attachmentFiles` (multiple files)
- **Success**: Returns updated `AssignmentResponseDto` (with attachments); emit to parent.
- **Failure**: Set `retryMode = true`; show partial-success error; emit Step 1's result to parent; close modal.

---

## Validation Rules

| Field | Rule |
|---|---|
| Title | Required; `trim()` length > 0 |
| Description | Required; `trim()` length > 0 |
| Due Date | Required; non-empty string from `datetime-local` input |
| Total Marks | Required; numeric value > 0 |
| File type | `application/pdf` or `video/mp4` only; reject others silently with toast |
| File size | Each individual file ≤ 500 MB; reject oversized with toast |
