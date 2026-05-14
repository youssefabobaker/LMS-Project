# Feature Specification: Add Assignment

**Feature Branch**: `010-assignment-add`
**Created**: 2026-05-14
**Status**: Draft
**Input**: User description: "Implement Add Assignment functionality inside a modal, following the same sequential logic used in Add Content. Step 1 creates the assignment, Step 2 uploads attachments using the returned ID. Form fields: Title, Description, Due Date, Total Marks. Only .pdf and .mp4 files allowed, max 500 MB. Gated by Ass:addOrUpdate permission. In-place list update on success."

---

## Clarifications

### Session 2026-05-14

- Q: Where in the list should the newly created assignment be inserted? → A: Append to end of list (bottom).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a New Assignment (Priority: P1)

An authorized instructor navigates to a course's Assignments tab and clicks the **+ Add New Assignment** button. A modal dialog opens where the instructor fills in the assignment title, a description, a due date using a calendar picker, and the total marks. The instructor clicks **Save** and the assignment is immediately created and appears at the bottom of the assignment list without a page reload.

**Why this priority**: Creating an assignment is the core action of this feature. All other behavior (file attachment) is optional and depends on this step succeeding first.

**Independent Test**: Can be fully tested by opening the modal, submitting a valid form with no files, and confirming the new assignment card appears in the list.

**Acceptance Scenarios**:

1. **Given** the instructor is on the Assignments tab, **When** they click **+ Add New Assignment**, **Then** a modal dialog opens with empty fields for Title, Description, Due Date, and Total Marks.
2. **Given** all required fields are filled with valid data and no files are selected, **When** the instructor clicks **Save**, **Then** the assignment is created, the modal closes, a success toast is shown, and the new assignment card appears in the list.
3. **Given** the modal is open, **When** the instructor clicks **Cancel** or the close (✕) button, **Then** the modal closes with no data submitted and no changes to the list.

---

### User Story 2 - Upload Attachments to a New Assignment (Priority: P2)

After filling in the assignment details, the instructor optionally selects one or more files to attach. The system uploads those files to the newly created assignment immediately after creation succeeds. The resulting assignment card shows the correct attachment count.

**Why this priority**: File attachments are a key part of distributing assignment materials. This step depends on Story 1 completing successfully.

**Independent Test**: Can be tested by submitting a valid form with one or more allowed files and verifying the returned assignment card contains the correct number of attachments.

**Acceptance Scenarios**:

1. **Given** the form is valid and one or more allowed files (.pdf or .mp4) are selected, **When** the instructor clicks **Save**, **Then** the system first creates the assignment, then uploads the files, and finally shows a success toast and updates the list.
2. **Given** a file with a disallowed extension (e.g., .docx, .png) is selected, **When** the instructor tries to add it to the file list, **Then** the system rejects it and shows an inline validation message listing the allowed types.
3. **Given** the assignment creation step succeeds but the file upload step fails, **When** the error occurs, **Then** the modal shows an error message for the upload step while the newly created assignment (without attachments) is still added to the list.

---

### User Story 3 - Form Validation Prevents Incomplete Submission (Priority: P3)

The system enforces that all required fields are provided and valid before allowing submission, giving the instructor immediate feedback on what needs to be corrected.

**Why this priority**: Validation protects data integrity. It is lower priority than core creation because the backend also validates; the frontend validation is a quality-of-life improvement.

**Independent Test**: Can be tested by clicking **Save** with an empty form and confirming the button is blocked and error messages are shown.

**Acceptance Scenarios**:

1. **Given** any required field (Title, Description, Due Date, Total Marks) is blank, **When** the instructor clicks **Save**, **Then** each empty required field is highlighted with an error message and the submission is blocked.
2. **Given** Total Marks is set to a negative number or zero, **When** the instructor clicks **Save**, **Then** an error message states that Total Marks must be a positive number.
3. **Given** a Due Date in the past is entered, **When** the instructor clicks **Save**, **Then** a warning is shown (submission is still allowed, since instructors may legitimately backdate assignments).

---

### Edge Cases

- What happens when the user selects more than the allowed total file size (500 MB across all selected files)?
- What happens when the network connection drops between Step 1 (assignment creation) and Step 2 (file upload)?
- What happens if the user rapidly double-clicks the **Save** button?
- What happens if the modal is closed while a save is in progress?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The **+ Add New Assignment** button MUST only be visible to users who hold the `Ass:addOrUpdate` permission.
- **FR-002**: Clicking the button MUST open a modal dialog containing input fields for: Title (text), Description (multi-line text), Due Date (calendar/datetime picker), and Total Marks (numeric).
- **FR-003**: All four form fields MUST be required; the **Save** button MUST be disabled or blocked until all are filled with valid values.
- **FR-004**: Total Marks MUST be a positive numeric value; the form MUST reject zero or negative values.
- **FR-005**: The file picker MUST only accept files with the `.pdf` or `.mp4` extension; any other file type MUST be rejected with an inline error.
- **FR-006**: The combined size of all selected files MUST NOT exceed 500 MB; exceeding this limit MUST show an error and prevent upload.
- **FR-007**: On **Save**, the system MUST first submit the assignment form data and wait for a successful confirmation before proceeding to Step 2.
- **FR-008**: If one or more files are selected, the system MUST upload them to the newly created assignment using the ID returned from Step 1.
- **FR-009**: A progress indicator MUST be visible while either Step 1 or Step 2 is in progress; all interactive controls MUST be disabled during this time to prevent duplicate submissions.
- **FR-010**: The Due Date picker MUST enforce datetime selection (date + time); the value MUST be transmitted in ISO 8601 format.
- **FR-011**: On full success (both steps complete, or Step 1 only if no files), the modal MUST close, a success toast notification MUST appear, and the new assignment MUST be **appended to the end (bottom) of the local list** without a page reload.
- **FR-012**: If Step 1 fails, an error message MUST be shown inside the modal; the modal MUST remain open so the user can correct the issue and retry.
- **FR-013**: If Step 2 fails after Step 1 succeeds, a partial-success error message MUST be shown; the modal MUST close and the new assignment (without attachments) MUST still appear in the list.
- **FR-014**: The modal design MUST visually match the existing Add Content modal (same layout, button styles, color palette, and loading indicator pattern).

### Key Entities

- **Assignment**: Represents a task given to students. Key attributes: title, description, due date, total marks.
- **Assignment Attachment**: A file linked to an assignment. Key attributes: file name, file URL, MIME type. Constraints: only PDF and MP4; total upload ≤ 500 MB.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authorized instructor can complete the full add-assignment flow (with or without files) in under 60 seconds.
- **SC-002**: 100% of invalid form submissions (missing fields, wrong file type, oversized files) are blocked with a clear, actionable error message.
- **SC-003**: The newly created assignment appears in the list immediately after the modal closes, with no page reload required.
- **SC-004**: When both creation and upload succeed, only one success toast notification is displayed (not one per step).
- **SC-005**: Unauthorized users (without `Ass:addOrUpdate`) never see the **+ Add New Assignment** button or are able to trigger the modal.
- **SC-006**: The modal's visual design is indistinguishable in style from the existing Add Content modal as judged by a visual review.

---

## Assumptions

- Bootstrap 5 is the CSS framework; `design.md` is the visual source of truth.
- Angular Standalone Components; no NgModule; feature folder under `src/app/features/`.
- All HTTP calls are delegated to Core services; model interfaces live in `src/app/core/models/`.
- Scope-Lock is in effect: only files within the assignment feature scope will be modified.
- The existing **Add Content** modal component serves as the direct design and structural reference; its layout, button classes, and loading-bar pattern will be reused.
- The `Ass:addOrUpdate` permission check is already implemented in `PermissionService` and available in the parent component.
- The `courseId` is already available in the parent `AssignmentsViewComponent` as an `@Input`.
- File-type validation is enforced on the client side (extension check) and also validated server-side.
- The 500 MB limit applies to the combined total of all files selected in a single upload operation.
- A due date in the past is allowed (instructors may backdate assignments); only a non-blocking warning is shown.
