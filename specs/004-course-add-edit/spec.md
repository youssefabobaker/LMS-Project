# Feature Specification: Course Add / Edit Modal

**Feature Branch**: `004-course-add-edit`  
**Created**: 2026-05-02  
**Status**: Draft  
**Input**: User description: "Implement the technical logic for the Add/Edit Course Modal based on the design in stitch-designs/course-add-edit/. POST and PUT operations for courses via multipart/form-data."

## Clarifications

### Session 2026-05-02

- Q: If the user has partially filled the form and tries to dismiss (Cancel / ×), should the system warn about unsaved changes? → A: Show a "Discard changes?" confirmation dialog on Cancel/× if any field is dirty; Escape closes silently without a warning.
- Q: Should the Save button show a loading/disabled state while the API call is in flight? → A: Disable the Save button and replace its label with a spinner icon for the duration of the API call.
- Q: When a new course is created, should active search/filter be reset so the user can see the new card? → A: Clear any active search term and semester filter after a successful Create, then insert the new card at the top of the grid.
- Q: If two users edit the same course simultaneously and one saves first, what should happen? → A: Last-write-wins; no special frontend conflict handling. The general API error flow (FR-013) covers any backend-enforced rejection.
- Q: Where does the departmentId come from at submission time? → A: On Create, it is a required Department dropdown field the user selects in the form. On Edit, it is taken directly from the existing course object passed to the modal.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a New Course (Priority: P1)

An authorised user (Department Head / Admin with `Course:add` permission) opens the Courses page, clicks **Create New Course**, fills in all required fields, optionally uploads a thumbnail, and submits. The new course card appears immediately in the grid without a full page reload.

**Why this priority**: Creating a course is the entry-point for all downstream activity (assessments, enrolment). Without it, the module has no data.

**Independent Test**: Open the modal, fill every field, submit, and verify a new card is inserted at the top of the grid in the same session.

**Acceptance Scenarios**:

1. **Given** the user has `Course:add` permission, **When** they click "Create New Course", **Then** a modal dialog opens showing an empty form with all required fields.
2. **Given** the form is fully filled with valid data, **When** the user clicks "Save Course", **Then** the modal closes, the new course card appears in the grid, and a success notification is shown.
3. **Given** the user submits without completing a required field, **When** the save action fires, **Then** inline validation messages are displayed beside each empty required field and the modal stays open.
4. **Given** the user uploads an image larger than 5 MB or in an unsupported format, **When** they select the file, **Then** an error message is shown and the file is rejected before submission.
5. **Given** the API returns an error, **When** the save action fires, **Then** an error notification is shown and the form data is preserved so the user can correct and retry.

---

### User Story 2 - Edit an Existing Course (Priority: P2)

An authorised user (Department Head / Admin with `Course:update` permission) clicks the **Edit** button on any course card. The same modal opens pre-populated with the course's current values. The user changes one or more fields and saves. The course card updates in place without a page reload.

**Why this priority**: Keeping course data accurate is essential for students and instructors. Edit follows Create logically.

**Independent Test**: Click Edit on any card, change the title, save, and verify the card title updates immediately with no full-list reload.

**Acceptance Scenarios**:

1. **Given** the user has `Course:update` permission, **When** they click the Edit icon on a course card, **Then** the modal opens with all fields pre-filled from the existing course data.
2. **Given** the user clears and re-enters the title, **When** they save, **Then** the course card title updates in place.
3. **Given** the user does not select a new image, **When** they save, **Then** the existing thumbnail is preserved and no image data is sent to the server.
4. **Given** the user selects a new image, **When** they save, **Then** the new image is uploaded and the card thumbnail updates.
5. **Given** the API returns a conflict or validation error, **When** the save fires, **Then** the modal remains open with a descriptive error message.

---

### User Story 3 - Cancel / Dismiss Without Saving (Priority: P3)

The user opens the modal (Create or Edit) and then decides not to proceed. They click Cancel, press Escape, or click outside the modal. No data is persisted and the courses list remains unchanged.

**Why this priority**: Preventing accidental data loss and ensuring the modal is dismissible is a fundamental UX requirement.

**Independent Test**: Open the modal, type in a field, click Cancel, and verify the grid is unchanged and no API call was made.

**Acceptance Scenarios**:

1. **Given** the modal is open, **When** the user clicks Cancel, **Then** the modal closes and no save operation occurs.
2. **Given** the modal is open, **When** the user presses the Escape key, **Then** the modal closes without saving.

---

### Edge Cases

- What happens when the department context is unavailable at the time of submission?
- *(Resolved)* Dirty-state on dismiss: Cancel/× show a "Discard changes?" confirmation dialog if any field is dirty; Escape closes immediately without confirmation.
- How does the system handle a network timeout during file upload?
- What if the user attempts to open a second modal while one is already open?
- What happens when the API returns a 413 (payload too large) error for the image?
- How does the form behave if credit hours are entered as a decimal or negative number?
- *(Resolved)* Concurrent edits: last-write-wins; no optimistic locking required on the frontend.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a "Create New Course" trigger exclusively to users with the `Course:add` permission.
- **FR-002**: The system MUST display an "Edit" trigger on each course card exclusively to users with the `Course:update` permission.
- **FR-003**: The modal MUST contain the following required fields: Course Title, Semester (Fall / Spring / Summer), Academic Level (1–5), Credit Hours, Description, Learning Outcomes, and Department (a dropdown of available departments, required on Create).
- **FR-004**: The modal MUST contain an optional Course Thumbnail upload area that shows a preview of the selected image before submission.
- **FR-005**: The system MUST validate all required fields before allowing submission; each invalid field MUST show an inline error message.
- **FR-006**: The system MUST submit course data as a multipart payload (text fields + optional image file) to the correct endpoint based on the operation (Create = POST, Edit = PUT).
- **FR-007**: On Create, the user MUST select a Department from a dropdown; the selected departmentId is included in the POST request. On Edit, the departmentId is read from the existing course object and included in the PUT request without user input.
- **FR-008**: When editing, the system MUST pre-populate the form with the selected course's current values.
- **FR-009**: When editing without a new image, the system MUST NOT include an image field in the PUT request payload.
- **FR-010**: On successful Create, the system MUST clear any active search term and semester filter, then insert the returned course object at the top of the grid without reloading the full list.
- **FR-011**: On successful Edit, the system MUST update the existing course card's data in place without reloading the full list.
- **FR-012**: On success, the modal MUST close automatically and display a non-blocking success notification.
- **FR-013**: On API error, the modal MUST remain open and display a descriptive error message; form data MUST be preserved.
- **FR-014**: The user MUST be able to dismiss the modal via a Cancel button, a close (×) icon, or the Escape key without triggering a save. If any form field is dirty and the user clicks Cancel or ×, the system MUST display a "Discard changes?" confirmation dialog before closing. Pressing Escape MUST close the modal immediately without a confirmation dialog.
- **FR-015**: The Thumbnail upload MUST reject files exceeding 5 MB or formats other than JPEG, PNG, and WebP, with a user-facing error.
- **FR-016**: While a save operation is in progress, the system MUST disable the Save button and display a spinner in place of the button label to prevent duplicate submissions and signal progress to the user.

### Key Entities

- **Course**: Represents a curriculum unit. Key attributes: title, description, semester (1=Fall, 2=Spring, 3=Summer), academicLevel (1–5), credit_Hour, learningOutcomes, ImageFile, departmentId.
- **Department**: A selectable entity. On Create, the user picks a department from a dropdown list. On Edit, the department is fixed to the one the course already belongs to.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the Create Course flow (open modal → fill form → submit) in under 2 minutes.
- **SC-002**: 100% of required-field validation errors are surfaced inline before any network request is made.
- **SC-003**: The courses grid reflects a newly created or edited course within 1 second of the modal closing, with no visible full-page reload.
- **SC-004**: Editing a course without changing the thumbnail results in zero image bytes transferred to the server (verifiable via network inspection).
- **SC-005**: The modal is dismissible (Cancel / Escape / ×) in all states without leaving orphaned data or UI artefacts.

## Assumptions

- Bootstrap 5 is the CSS framework; design.md and `stitch-designs/course-add-edit/` are the visual sources of truth.
- The modal is implemented as a Bootstrap Modal (not a routed page); it is opened programmatically from `CourseViewComponent`.
- Angular Standalone Components; no NgModule; the new component lives under `src/app/features/course-management/course-add-edit/`.
- All HTTP calls are delegated to the existing `CourseService` (`src/app/core/services/course.service.ts`).
- The authenticated user's `departmentId` is NOT auto-derived from the session. On Create, the Department field is a required dropdown in the form. On Edit, `departmentId` is sourced from the course object received by the modal.
- Scope-Lock is in effect: only files within the course-management feature scope and `CourseService` will be modified.
- The `LearningOutcomes` field is stored as a comma-separated string by the backend; the UI renders it as a plain textarea.
- Mobile support is in scope for basic responsiveness (two-column grid collapses to single column on small screens).
