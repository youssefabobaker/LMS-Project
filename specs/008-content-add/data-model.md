# Data Model: Add Content Modal (008-content-add)

**Date**: 2026-05-08  
**Phase**: 1 — Design & Contracts  
**Source**: spec.md + research.md

---

## Existing Interfaces (no changes)

These interfaces already exist in `src/app/models/content.ts` and are used as-is.

```typescript
// src/app/models/content.ts  (already exists — DO NOT modify)

export interface ContentAttachment {
  id: string;          // UUID / Guid from backend
  fileName: string;
  fileUrl: string;
  contentType: string; // MIME type — drives icon logic (video/mp4, application/pdf)
}

export interface Content {
  id: number;
  title: string;
  body: string;
  contentAttachments: ContentAttachment[];
}
```

---

## New Client-Side Types (add to content.ts or inline in component)

```typescript
// Represents a file staged for upload — lives only in component state,
// never serialized or sent as-is.
export interface StagedFile {
  file: File;           // Native File object for FormData construction
  name: string;         // file.name — displayed in the list row
  size: number;         // file.size in bytes — formatted for display
  mimeType: string;     // file.type — drives icon (application/pdf | video/mp4)
}
```

---

## ContentAddComponent State Shape

```typescript
// Lives inside content-add.component.ts — not a shared model
interface ContentAddState {
  title: string;              // Bound to MODULE TITLE input; required
  body: string;               // Bound to DESCRIPTION textarea; required
  stagedFiles: StagedFile[];  // Files awaiting upload

  isSubmitting: boolean;      // True while Step 1 or Step 2 is in-flight
  submitError: string;        // Inline error message; '' when none
  retryMode: boolean;         // True after Step 1 succeeded but Step 2 failed
  createdContentId: number | null; // Set after Step 1 succeeds; used for Step 2 retry
}
```

---

## API Request / Response Contracts

### Step 1 — Create Content

| Property | Value |
|---|---|
| Method | `POST` |
| Endpoint | `/api/Content/course/{courseId}` |
| Request body (JSON) | `{ "title": string, "body": string }` |
| Response | `ContentResponseDto` → normalized to `Content` |
| Service method | `ContentService.createContent(courseId, title, body)` |

### Step 2 — Add Attachments

| Property | Value |
|---|---|
| Method | `POST` |
| Endpoint | `/api/Content/{contentId}/attachments` |
| Request body | `multipart/form-data`, field name: `attachmentFiles` |
| Accepted MIME types | `application/pdf`, `video/mp4` |
| Max size (per file) | 500 MB |
| Response | Updated `ContentResponseDto` → normalized to `Content` (with `contentAttachments` populated) |
| Service method | `ContentService.addAttachments(contentId, files[])` |

---

## Validation Rules

| Field | Rule | Enforcement |
|---|---|---|
| Title | Required, non-empty string | Client-side: block submit; no max-length enforced this cycle |
| Body | Required, non-empty string | Client-side: block submit |
| File type | `.pdf` or `.mp4` only | Client-side: MIME check on selection; silently discard others |
| File size | ≤ 500 MB per file | Client-side: reject on selection with inline message |
| Attachment count | No limit in this cycle | N/A |

---

## State Transitions

```
IDLE
  │  user clicks "Add New Content"
  ▼
FORM_OPEN (empty form, no files)
  │  user types title, body; selects files
  ▼
FORM_READY (title + body filled; files optionally staged)
  │  user clicks "Save Content"
  ▼
SUBMITTING_STEP1 (isSubmitting=true, progress bar visible)
  │  Step 1 succeeds → createdContentId set
  ├──► SUBMITTING_STEP2 (files present) → Step 2 in-flight
  │       │  success → emit contentCreated → close modal
  │       └► STEP2_FAILED (retryMode=true, error shown, title+body pre-populated)
  │               │  user clicks "Retry Upload"
  │               └► SUBMITTING_STEP2 (retry, same contentId)
  └──► STEP1_FAILED (submitError shown, modal stays open, user can edit and retry all)
       │  user edits → clicks "Save Content" again → SUBMITTING_STEP1
       │  user clicks "Cancel" → IDLE (modal closes)
```
