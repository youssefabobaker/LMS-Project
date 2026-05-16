# Feature Specification: Assignment Submission and Grading

**Feature Branch**: `011-assignment-submission`  
**Created**: 2026-05-14  
**Status**: Draft  
**Input**: User description: "I need to implement the full Assignment Submission and Grading cycle in src/app/features/assignments/... "

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Student Submits Assignment (Priority: P1)

Students need the ability to upload their completed assignment work or text submission so the instructor can review it.

**Why this priority**: Core functionality; without submissions, assignments have no value.

**Independent Test**: Can be fully tested by logging in as a student, seeing the "Add Submission" button on an ungraded assignment, and successfully submitting a file and text, verifying the button changes to "Edit Submission".

**Acceptance Scenarios**:

1. **Given** a student is viewing an assignment they haven't submitted yet, **When** the component loads, **Then** an "Add Submission" button (Cyan Gradient) is displayed.
2. **Given** the student clicks "Add Submission", **When** they upload valid files (PDF/MP4) under 500MB, **Then** the submission is saved successfully and the state updates to "Submitted".
3. **Given** the student tries to upload an unsupported file type or a file exceeding 500MB, **When** they attempt to attach it, **Then** the file is rejected with an appropriate error message.

---

### User Story 2 - Instructor Grades Submission (Priority: P1)

Instructors need a dedicated dashboard to view all student submissions for an assignment, review the attachments, and provide grades/feedback.

**Why this priority**: Without grading, the loop isn't closed. It's essential for the instructor's workflow.

**Independent Test**: Can be fully tested by logging in as an instructor, clicking "View Submissions" on an assignment, selecting a student's submission, downloading the file, and submitting a grade and feedback.

**Acceptance Scenarios**:

1. **Given** an instructor views the assignment list, **When** they see an assignment, **Then** there is a "View Submissions" button.
2. **Given** the instructor clicks "View Submissions", **When** the dashboard loads, **Then** a list of students who submitted work is displayed.
3. **Given** the instructor is reviewing a submission, **When** they click an attachment file, **Then** the file opens in a new browser tab.
4. **Given** the instructor grades a submission, **When** they open the grading modal, **Then** they must provide a numeric grade and can optionally provide text feedback, which saves successfully.

---

### User Story 3 - Student Edits Submission (Priority: P2)

Students need the ability to correct or update their submission before it has been graded.

**Why this priority**: Users make mistakes and need a way to resubmit without instructor intervention.

**Independent Test**: Can be fully tested by a student who already submitted an assignment clicking "Edit Submission", seeing their previous work, and saving a new version.

**Acceptance Scenarios**:

1. **Given** a student has submitted an assignment but it is not yet graded, **When** they view the assignment, **Then** an "Edit Submission" button (Outline style) and a "Submitted" badge are displayed.
2. **Given** a student edits their submission, **When** they save the new submission, **Then** the system first deletes the old submission and then creates the new one to ensure a clean update.
3. **Given** the delete step succeeds but the new submission upload fails, **When** the error occurs, **Then** the system displays a clear error message stating the old submission was deleted but the new one could not be saved; the modal stays open so the student can retry or close it.

---

### User Story 4 - Student Views Grade and Feedback (Priority: P3)

Students need to see their results once the instructor has graded their work.

**Why this priority**: Essential for feedback loop, but grading and submission mechanics must exist first.

**Independent Test**: Can be fully tested by a student viewing an assignment that an instructor has graded, and seeing the "Graded" status along with the score and text feedback.

**Acceptance Scenarios**:

1. **Given** a submission has been graded, **When** the student views the assignment, **Then** the "Edit Submission" button is hidden, and the Grade and Feedback are displayed inside the expanded card.

---

### Edge Cases

- **Failed Edit Re-submit**: If the delete step succeeds but the new submission upload fails, the system notifies the student that their old submission was deleted but the new one was not saved. The modal remains open, allowing the student to retry or close it.
- **Late Submissions**: Students may submit or edit their work after the assignment's due date has passed. The system MUST display a red "Late" badge on such submissions for both the student and the instructor to see.
- What if an instructor tries to grade a submission while the student is in the middle of editing it? In this case, the student's next edit attempt will re-delete and re-submit without conflict, as the grade state is checked on component load.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST fetch assignments and student submissions in parallel and match them via `assignmentId` on component load.
- **FR-002**: The system MUST display an 'Add Submission' button (Cyan Gradient) if no submission exists for the student.
- **FR-003**: The system MUST display an 'Edit Submission' button (Outline) and a 'Submitted' badge if the student has submitted but not been graded.
- **FR-004**: The system MUST hide submission action buttons and display the Grade and Feedback inside the expanded card if the submission has been graded.
- **FR-005**: The system MUST execute edit operations by first calling `deleteSubmission()` and then calling `submit()` with the new data. If the submission step fails after a successful delete, the system MUST display an inline error message inside the open modal stating the old submission was deleted but the new one was not saved, and MUST allow the user to retry or dismiss the modal.
- **FR-006**: The system MUST restrict file uploads to PDF and MP4 extensions.
- **FR-007**: The system MUST enforce a maximum upload request size of 500 MB.
- **FR-008**: The system MUST provide a 'View Submissions' button for instructors to navigate to a specific assignment's submission list.
- **FR-009**: The system MUST open submission attachment files in a new browser tab (`window.open(fileUrl)`) when clicked by an instructor.
- **FR-010**: The system MUST provide a Grading Modal for instructors requiring a numeric grade input and an optional text feedback area.
- **FR-011**: The system MUST allow students to submit or edit submissions after the assignment `dueDate` has passed, and MUST display a red "Late" badge on any submission where `submittedAt` is after `dueDate`.

### Key Entities

- **AssignmentSubmissionResponseDto**: Represents a student's submission, including text, timestamps, grade, feedback, and links to attachments.
- **AssignmentSubmissionAttachmentDto**: Represents a file uploaded as part of a submission, including its URL and MIME type.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Students can successfully submit, edit, and view grades for an assignment without encountering unhandled errors.
- **SC-002**: Instructors can view a list of submissions and successfully apply grades and feedback.
- **SC-003**: 100% of files uploaded during submission conform to the PDF or MP4 restrictions and the 500 MB limit.
- **SC-004**: The UI state accurately reflects the current status (No Submission, Submitted, Graded) immediately upon component load.

## Assumptions

- Students cannot edit a submission after it has been graded by an instructor.
- The student's ID is inferred directly from the JWT token by the backend for submission endpoints.
- The instructor's submission dashboard will be a list view showing all students who submitted work for the specific assignment.

## Clarifications

### Session 2026-05-14

- Q: What happens if the delete step succeeds but the new submission upload fails during an edit? → A: The system notifies the student that their old submission was deleted but the new one was not saved. The modal stays open so the student can retry or close it.
- Q: Should students be blocked from submitting after the assignment due date, or allowed with a warning? → A: Late submissions are allowed. The system displays a red "Late" badge when the submission timestamp is after the assignment due date.
