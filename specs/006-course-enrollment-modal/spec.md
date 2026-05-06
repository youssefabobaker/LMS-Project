# Feature Specification: Course Enrollment Modal

**Feature Branch**: `006-course-enrollment-modal`
**Created**: 2026-05-05
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Enrolled Instructors (Priority: P1)

An administrator opens the Enrollment modal for a specific course and immediately sees the full list of instructors currently assigned to that course — their names, email addresses, and available actions. If no instructors are enrolled yet, a clear empty-state message is shown.

**Why this priority**: Viewing the current state of enrollments is the foundational read action from which all other enrollment decisions are made.

**Independent Test**: Can be fully tested by opening the modal for any course and verifying the displayed list matches the back-end data. Delivers standalone value as a read-only view.

**Acceptance Scenarios**:

1. **Given** an admin has Course:read or Course:readAll permission, **When** they open the Enrollment modal for a course, **Then** the modal displays all currently enrolled instructors for that course.
2. **Given** no instructors have been enrolled in a course, **When** the modal is opened, **Then** an "empty state" message is displayed instead of an empty table.
3. **Given** the data fetch fails, **When** the modal is opened, **Then** an error message is shown and the list is not left blank or broken.

---

### User Story 2 - Enroll an Instructor (Priority: P2)

An authorised administrator selects an instructor from a dropdown that lists only users holding the instructor role, then clicks "Enroll". The selected instructor is immediately added to the course's enrollment list without a page reload.

**Why this priority**: This is the primary write action — adding an instructor to a course — and is the core purpose of the modal.

**Independent Test**: Can be fully tested by selecting any instructor from the dropdown and verifying they appear in the enrolled list after clicking Enroll.

**Acceptance Scenarios**:

1. **Given** an admin has Course:enrollInstructor permission, **When** they select an instructor from the dropdown and click "Enroll", **Then** the instructor is immediately added to the displayed list and the back-end is updated.
2. **Given** the Enroll action succeeds, **When** the modal updates, **Then** a success toast notification is shown to confirm the enrollment.
3. **Given** the Enroll action fails (e.g., server error), **When** the response is received, **Then** an inline error message is shown and the list is unchanged.
4. **Given** an admin does **not** have Course:enrollInstructor permission, **When** they open the modal, **Then** the "Enroll" button and selection dropdown are hidden.

---

### User Story 3 - Unenroll an Instructor (Priority: P3)

An authorised administrator clicks the delete/unenroll icon next to an enrolled instructor. An inline confirmation prompt ("Confirm" / "Cancel") appears within the same row. If the administrator confirms, the instructor is immediately removed from the course's enrollment list without a page reload. If they cancel, the row returns to its normal state.

**Why this priority**: Removing instructors is a necessary management action, but less common than initial enrollment.

**Independent Test**: Can be fully tested by clicking the delete icon for any enrolled instructor and verifying they are removed from the list.

**Acceptance Scenarios**:

1. **Given** an admin has Course:unenrollInstructor permission, **When** they click the delete icon for an instructor, **Then** an inline "Confirm / Cancel" prompt appears in that row without removing the instructor yet.
2. **Given** the inline confirmation is visible, **When** the admin clicks "Confirm", **Then** the instructor is removed from the displayed list and the back-end is updated.
2. **Given** the Unenroll action succeeds, **When** the modal updates, **Then** a success toast notification is shown to confirm the removal.
3. **Given** the Unenroll action fails (e.g., server error), **When** the response is received, **Then** an inline error message is shown and the instructor remains in the list.
4. **Given** an admin does **not** have Course:unenrollInstructor permission, **When** they view the enrolled list, **Then** the delete icon is hidden for all rows.

---

### Edge Cases

- When the dropdown has no selectable instructors (none with the instructor role exist, or all are already enrolled), the Enroll button is disabled and a short informational message is shown near the dropdown (e.g., "All available instructors are already enrolled.").
- What happens when only one instructor is available for selection — is the dropdown pre-populated?
- How does the modal handle a very large list of enrolled instructors (scroll vs. pagination)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The modal MUST display a list of all instructors currently enrolled in the selected course upon opening, showing each instructor's name and email address per row.
- **FR-002**: The modal MUST show an empty-state message when no instructors are enrolled in the course.
- **FR-003**: The modal MUST show an error message when the initial data load fails, preventing a broken or blank state.
- **FR-004**: The modal MUST provide a dropdown populated exclusively with users who hold the "instructor" role AND who are not already enrolled in the course (already-enrolled instructors are excluded from the selection list to prevent duplicates).
- **FR-005**: The modal MUST send an enrollment request for the selected instructor when the "Enroll" button is clicked.
- **FR-006**: The enrolled instructors list MUST update in place (without a full page reload) immediately after a successful enrollment.
- **FR-007**: The enrolled instructors list MUST update in place immediately after a confirmed unenrollment.
- **FR-014**: When the unenroll icon is clicked, the modal MUST display an inline "Confirm / Cancel" prompt within the affected row before performing any removal. Clicking "Cancel" restores the row to its normal state.
- **FR-008**: A success toast notification MUST be shown upon a successful enrollment action.
- **FR-009**: A success toast notification MUST be shown upon a successful unenrollment action.
- **FR-010**: The "Enroll" button and selection dropdown MUST only be visible to users with the Course:enrollInstructor permission.
- **FR-011**: The delete/unenroll icon for each row MUST only be visible to users with the Course:unenrollInstructor permission.
- **FR-012**: The button that opens the Enrollment modal from the course card MUST only be visible to users with Course:read or Course:readAll permission.
- **FR-013**: The modal MUST receive the course's unique identifier and display name as context to correctly scope all operations.
- **FR-015**: When no instructor candidates are available for selection (all are already enrolled or none hold the instructor role), the modal MUST disable the Enroll button and display a short informational message adjacent to the selection dropdown explaining why no options are available.

### Key Entities

- **Enrolled Instructor**: A user with the instructor role who has been assigned to a course. Identified by a unique user ID (GUID) and displayed by name and email address.
- **Instructor Candidate**: A user from the system-wide user list whose role includes "instructor". Displayed in the selection dropdown.
- **Course Context**: The course to which enrollments apply, identified by a unique course ID and represented by its name in the modal header.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An administrator can complete the full enrollment of an instructor (open modal → select → confirm) in under 30 seconds.
- **SC-002**: The enrolled instructors list reflects changes within 1 second of a successful enrollment or unenrollment action, without requiring a page reload.
- **SC-003**: 100% of users without the required permissions are prevented from seeing or accessing restricted actions (Enroll button, Unenroll icon, modal opener button).
- **SC-004**: The modal correctly displays an empty state for 100% of courses that have no enrolled instructors.
- **SC-005**: All error states (load failure, enroll failure, unenroll failure) produce a visible, descriptive message for the administrator.

## Assumptions

- Lumina standing assumptions from Constitution v1.0.0 apply (Bootstrap 5, design.md, Angular Standalone Components, Core services, Scope-Lock).
- A Stitch design subfolder exists at `stitch-designs/course-enrollment/` and is used as the visual reference.
- The system-wide user list endpoint returns enough information (including role data) to filter for instructors on the client side.
- User identity values are GUIDs (strings) as required by the enrollment and unenrollment APIs.
- The toast notification system already exists in the project and can be called from this feature's component.
- The permission strings (`Course:enrollInstructor`, `Course:unenrollInstructor`, `Course:read`, `Course:readAll`) are already registered in the system's permission model.
- The modal is opened from the CourseViewComponent which is responsible for passing the correct courseId and courseName.
- Duplicate enrollment prevention (enrolling an already-enrolled instructor) is handled proactively on the front-end by excluding already-enrolled instructors from the selection dropdown; they will never appear as selectable options.

## Clarifications

### Session 2026-05-05

- Q: Should already-enrolled instructors be excluded from the selection dropdown or remain visible with back-end error surfacing? → A: Exclude already-enrolled instructors from the dropdown (proactive prevention, Option A).
- Q: What fields should be displayed per enrolled instructor row in the table? → A: Name + Email address (Option B).
- Q: Should the unenroll action be immediate or require a confirmation step? → A: Inline confirmation — a "Confirm / Cancel" prompt appears within the row before removal (Option B).
- Q: When no instructor candidates are available in the dropdown, what should the modal do? → A: Disable the Enroll button and show an inline informational message near the dropdown (Option A).
