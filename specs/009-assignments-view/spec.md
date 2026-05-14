# Feature Specification: Assignments View

**Feature Branch**: `[009-assignments-view]`  
**Created**: 2026-05-13  
**Status**: Draft  
**Input**: User description: "I need to implement the Assignments View within the existing Course Detail page structure. This view should replace the 'Published Contents' section when the 'Assignments' tab is active..."

## Clarifications

### Session 2026-05-13
- Q: Approaching Deadline Highlight → A: < 48 hours before deadline, highlighted in Red/Danger color
- Q: Assignment Description Truncation → A: Hide the description entirely until the card is expanded

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Course Assignments (Priority: P1)

As a student or instructor, I want to see a list of assignments for a course when I click the "Assignments" tab, so that I can track what work is required and when it is due.

**Why this priority**: Core functionality; without seeing assignments, the feature has no value.

**Independent Test**: Can be fully tested by clicking the "Assignments" tab and verifying the displayed list against backend data.

**Acceptance Scenarios**:

1. **Given** I am on the Course Detail page, **When** I click the "Assignments" tab, **Then** the view switches from "Published Contents" to a list of assignments.
2. **Given** I am viewing the assignments list, **When** I look at an assignment card, **Then** I see the Title, Total Marks, and Due Date (highlighted if approaching).
3. **Given** the assignments list is empty, **When** I view the assignments tab, **Then** I see an empty state message.

---

### User Story 2 - View Assignment Attachments (Priority: P2)

As a student or instructor, I want to expand an assignment card to see its attached files, so that I can download instructions or resources.

**Why this priority**: Necessary for accessing assignment resources.

**Independent Test**: Can be fully tested by expanding an assignment card and clicking an attachment link.

**Acceptance Scenarios**:

1. **Given** I am viewing an assignment card, **When** I click the expand icon, **Then** the card expands to reveal its full Description and a list of `assignmentAttachments`.
2. **Given** I see the list of attachments, **When** I click an attachment, **Then** the file opens in a new browser tab (`_blank`).

---

### User Story 3 - Manage Assignments (Priority: P3)

As an instructor with `Ass:addOrUpdate` and `Ass:delete` permissions, I want to add new assignments and delete existing ones from the Assignments tab, so that I can manage course work.

**Why this priority**: Required for course creators, but viewing is more fundamental for all users.

**Independent Test**: Can be fully tested by clicking "Add New Assignment" to verify the button triggers an action, and clicking "Delete" on an assignment to verify the confirmation dialog and API call.

**Acceptance Scenarios**:

1. **Given** I have `Ass:addOrUpdate` permission, **When** the Assignments tab is active, **Then** the CTA button changes to "Add New Assignment".
2. **Given** I have `Ass:delete` permission, **When** I click the delete icon on an assignment, **Then** I see a confirmation dialog.
3. **Given** I confirmed deletion, **When** the action completes, **Then** the assignment is removed from the list via the `DELETE /api/Assignment/{id}` endpoint.

### Edge Cases

- What happens when an assignment has no attachments? (Should display a clear "No attachments" message).
- How does the system handle API errors when fetching assignments? (Should display an error banner with a retry option, similar to the Content tab).
- What happens if the due date is in the past? (Should it still highlight or show as "Overdue"? Assuming standard behavior of highlighting).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST switch the view from Content to Assignments when the Assignments tab is clicked, keeping the course banner static.
- **FR-002**: System MUST fetch assignments using `GET /api/Assignment/course/{courseId}`.
- **FR-003**: System MUST display each assignment as a card containing: Title, Total Marks, and Due Date.
- **FR-004**: System MUST highlight the Due Date in Red/Danger color if the deadline is within 48 hours.
- **FR-005**: System MUST allow users to expand an assignment card to view its full Description and `assignmentAttachments`.
- **FR-006**: System MUST open an attachment in a new tab when clicked, using `window.open(fileUrl, '_blank')`.
- **FR-007**: System MUST change the primary action button to "Add New Assignment" when the Assignments tab is active.
- **FR-008**: System MUST only show Add/Edit/Delete actions if the user has `Ass:addOrUpdate` or `Ass:delete` permissions respectively.
- **FR-009**: System MUST prompt for confirmation before deleting an assignment using `DELETE /api/Assignment/{id}`.
- **FR-010**: System MUST maintain UI consistency with the Content tab (Cyan `#41B3E3`, Inter/Work Sans fonts, identical padding and card styles).

### Key Entities

- **Assignment**: Represents a course task. Key attributes: ID, Title, Description, DueDate, TotalMarks.
- **AssignmentAttachment**: Represents a file attached to an assignment. Key attributes: ID, FileName, FileUrl, Type.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can toggle between Content and Assignments tabs instantly without full page reloads.
- **SC-002**: Assignment list renders correctly matching the design specifications of the Content tab.
- **SC-003**: All specified assignment data points (Title, Marks, Due Date) are visible without clicking, while the Description remains hidden.
- **SC-004**: Attachments open in new tabs successfully 100% of the time.
- **SC-005**: Only authorized users can see and interact with the Add and Delete buttons.

## Assumptions

- Lumina standing assumptions (from Constitution v1.0.0) — always applicable.
- The authentication/permission service already provides a method to check the `Ass:addOrUpdate` and `Ass:delete` permissions.
- The "Add New Assignment" button will trigger a modal or navigation.
- "Approaching deadline" is assumed to mean within 48 hours, unless otherwise configured.
