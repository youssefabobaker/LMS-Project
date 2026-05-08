# Feature Specification: Add Content Modal

**Feature Branch**: `008-content-add`  
**Created**: 2026-05-08  
**Status**: Draft  
**Input**: User description: "Implement the Add Content Logic inside src/app/features/content/content-add. This cycle handles the creation of a new content item followed by a sequential file upload for its attachments."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Create Content with Attachments (Priority: P1)

An instructor or admin opens the Content View page for a course and clicks "Add New Content." A modal dialog appears with a form containing a Module Title field, a Description/Body field, and an Attachments upload zone. The user fills in the title and body, selects one or more PDF or MP4 files from their device, and reviews the file list (each row shows file name and size). On clicking "Save Content," the system first creates the content record, then uploads the selected files against the returned content ID. A progress indicator remains active while both operations complete. On success, the modal closes automatically, a toast notification confirms the action, and the new content card appears immediately in the list — without a page reload.

**Why this priority**: This is the primary value of the feature. Without it, instructors cannot populate course material at all.

**Independent Test**: Can be fully tested by navigating to any course's content page, clicking "Add New Content", completing the form with at least one attachment, and verifying the new card appears in the list and a success toast fires.

**Acceptance Scenarios**:

1. **Given** the user has `Content:add` permission, **When** they click "Add New Content", **Then** the modal opens with an empty form and a dashed upload zone.
2. **Given** the user has filled in title and body and selected a `.pdf` file, **When** they click "Save Content", **Then** a progress bar appears, both API calls execute sequentially, and on full completion the modal closes, a success toast fires, and the new card is prepended to the content list.
3. **Given** a newly created content item requires no attachments, **When** the user submits with no files selected, **Then** only Step 1 (create content) runs, the modal closes, and the card appears — no attachment API call is made.

---

### User Story 2 — File Validation & Selection Preview (Priority: P2)

Before submitting, the user selects files via the upload zone. The zone filters selectable files to `.pdf` and `.mp4` only. Each selected file appears as a row in the modal showing the file's icon (PDF or video), its name, size in human-readable format (e.g. "4.2 MB"), and an × button to remove it from the list. If the user attempts to upload a file of an unsupported type, it is silently rejected (not added to the list). The zone allows multiple file selection.

**Why this priority**: Data integrity — preventing unsupported file types from reaching the server avoids server-side rejections and bad UX.

**Independent Test**: Open the modal, attempt to select a `.docx` file and verify it does not appear in the file list; then select a `.pdf` and `.mp4` and verify both appear with correct icons and sizes.

**Acceptance Scenarios**:

1. **Given** the file picker is open, **When** the user selects a `.docx` file, **Then** the file does not appear in the selected files list.
2. **Given** the user selects a `.pdf` file, **When** it is added to the list, **Then** a red PDF icon is shown alongside the filename and formatted size with an × button.
3. **Given** the user selects an `.mp4` file, **When** it is added, **Then** a play-circle icon is shown.
4. **Given** a file is listed, **When** the user clicks its × button, **Then** it is removed from the list immediately.

---

### User Story 3 — Error Handling & Loading State (Priority: P3)

During the sequential upload, a full-width progress bar is visible. If Step 1 (create content) fails, the form stays open with an error alert — no attachment call is made. If Step 2 (add attachments) fails after a successful Step 1, the error is shown but the partially created content item is retained (user may retry). The "Save Content" button is disabled while submission is in progress. The "Cancel" button closes the modal at any time (before submission starts) and discards all unsaved form state.

**Why this priority**: Correct error signaling protects data integrity and gives instructors clear feedback on partial failures.

**Independent Test**: Can be simulated by submitting with an invalid courseId and observing the error alert without the modal closing.

**Acceptance Scenarios**:

1. **Given** the user clicks "Save Content", **When** the create content call is in progress, **Then** the button is disabled and a progress bar is visible.
2. **Given** Step 1 fails (e.g. network error), **Then** an inline error message is shown and the modal remains open.
3. **Given** the user clicks "Cancel", **Then** the modal closes and all form data is discarded with no API calls.

---

### Edge Cases

- What happens when no title is provided? → The form must prevent submission (title is required).
- What happens when no body is provided? → The form must prevent submission (body is required).
- What happens when a user tries to add a file that exceeds 500 MB total? → Show an inline validation message per file; reject the oversized file from the list.
- What happens if the user cancels mid-upload (after "Save Content" is clicked)? → The in-flight HTTP request completes or fails naturally; no cancel mid-request is required for this cycle.
- What happens when zero files are selected? → The attachment upload step is skipped entirely; only the content record is created.
- What happens on Step 2 (attachment upload) failure after Step 1 succeeds? → The modal stays open with title/body pre-populated; a "Retry Upload" button re-attempts Step 2 using the already-created content ID. Step 1 is NOT re-called to prevent duplicate content records.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Add New Content" button MUST only be rendered and functional for users who hold the `Content:add` permission.
- **FR-002**: The add-content modal MUST present three input areas: Module Title (text, required), Description / Body Content (textarea, required), and Attachments (file upload zone, optional).
- **FR-003**: The file picker MUST restrict selectable files to `.pdf` and `.mp4` MIME types only; files of any other type MUST be silently ignored.
- **FR-004**: Each selected file MUST be displayed in the modal as a row containing: a type icon, the file name, the formatted file size, and a remove (×) button.
- **FR-005**: On form submission the system MUST first call the Create Content endpoint and retrieve the returned content ID before proceeding to Step 2.
- **FR-006**: If and only if at least one file is selected, the system MUST call the Add Attachments endpoint using the content ID from Step 1, sending all selected files as `multipart/form-data`.
- **FR-007**: A progress bar MUST be displayed and the Submit button MUST be disabled for the entire duration of the sequential API calls (Steps 1 and 2).
- **FR-008**: On full success, the modal MUST close automatically, a bottom-end success toast MUST fire, and the new content item MUST be prepended to the visible content list without a page reload. The card data source MUST be: the Step 2 (`addAttachments`) response when at least one file was uploaded; the Step 1 (`createContent`) response when no files were selected.
- **FR-009**: If Step 1 fails, an inline error alert MUST appear inside the modal without closing it; Step 2 MUST NOT be called. If Step 2 fails after a successful Step 1, the inline error MUST appear but the modal MUST stay open with the title and body pre-populated; a "Retry Upload" action MUST re-attempt Step 2 using the already-created content ID — Step 1 MUST NOT be called again (to avoid creating duplicate content records).
- **FR-010**: The form MUST perform client-side validation: submission is blocked if title or body is empty.
- **FR-011**: The "Cancel" button MUST close the modal and discard all form state at any time before submission begins.

### Key Entities

- **ContentCreateRequest**: title (string, required), body (string, required).
- **ContentResponseDto**: id (integer), title, body, contentAttachments (array) — returned by Step 1; `id` is used as the target for Step 2.
- **AttachmentFile**: client-side representation — name, size (bytes), MIME type, File object. Not persisted until Step 2 succeeds.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An instructor can create a new content item with at least one attachment in under 60 seconds from opening the modal to seeing the success toast.
- **SC-002**: 100% of unsupported file types (non-.pdf, non-.mp4) are rejected before any API call is made.
- **SC-003**: The new content card appears in the list immediately upon success, with zero manual page refreshes required.
- **SC-004**: Submission with an empty title or empty body is blocked 100% of the time at the client side before any network request.
- **SC-005**: On Step 1 failure, the modal remains open and the user can correct inputs and retry without navigating away.

---

## Assumptions

- Lumina standing assumptions apply: Bootstrap 5, Angular Standalone Components, Core services, feature folder under `src/app/features/`, `design.md` as visual source of truth.
- The Stitch design reference is `stitch-designs/content-add/screen.png` and `DESIGN.md`; the modal layout shown in `screen.png` is authoritative.
- The `ContentService` already exists at `src/app/core/services/content.service.ts` and its `createContent` and `addAttachments` stubs will be activated in this cycle.
- The `Content:add` permission string matches the value already used in `PermissionService.hasPermission()`.
- The "Add New Content" button in `content-view.component.html` is already gated by `*ngIf="canAdd"` and bound to `onAddContent()` — this cycle will wire that stub.
- The `onAddContent()` method stub in `ContentViewComponent` will be replaced by logic that opens a Bootstrap modal.
- File size constraint is enforced client-side per-file (reject files > 500 MB individually); total combined size is not validated in this cycle.
- The `content-add` component will live in `src/app/features/content/content-add/` as a standalone Angular component. It will be declared as `<app-content-add>` inside a Bootstrap `modal fade` div already present in `content-view.component.html`. The parent component opens/closes the modal via Bootstrap's JS API — following the same pattern used by `<app-course-add-edit>`, `<app-course-assessment>`, and `<app-course-enrollment>` in `course-view.component.html`.
- After successful creation, the new item is prepended (added at the top) of `contentList` in the parent view — no re-fetch of the full list.
- ZIP files mentioned in the design's upload zone hint text are not accepted in this cycle (PDF and MP4 only, per the feature description).

---

## Clarifications

### Session 2026-05-08

- Q: When "retry" is triggered after a Step 2 (attachment upload) failure — does the user retry only the attachment upload (reusing the existing content ID) or does the whole form reset from Step 1? → A: Retry Step 2 only, reusing the already-created content ID. Step 1 is not repeated.
- Q: How should `ContentAddComponent` be embedded — as `<app-content-add>` inside a Bootstrap modal div in `content-view.component.html` (opened via Bootstrap JS API), or via Angular `@ViewChild` + an `open()` method pattern? → A: Declare `<app-content-add>` inside a Bootstrap `modal fade` div in `content-view.component.html`; open/close via Bootstrap JS API, matching the existing `app-course-add-edit` pattern.
- Q: Which API response is used to build the newly prepended content card after success — Step 1 response only, Step 2 response (with attachments) as primary / Step 1 as fallback, or a fully client-side constructed object? → A: Use Step 2 response when files were uploaded (complete with `contentAttachments`); fall back to Step 1 response when no files are selected.
