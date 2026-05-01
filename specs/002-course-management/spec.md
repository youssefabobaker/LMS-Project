# Feature Specification: Course Management

**Feature Branch**: `002-course-management`  
**Created**: 2026-05-01  
**Status**: Draft  
**Input**: User description: "I need you to generate the full technical specifications and implementation logic for the Course Management feature. Please focus strictly on the Course Controller as described in the API_DOCUMENTATION.pdf and ensure consistency with the established Lumina Architecture..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Course List (Priority: P1)

As an administrator or user with appropriate permissions, I want to view a list of all courses displayed in a Card-Based Layout, so I can see available courses at a glance.

**Why this priority**: Displaying courses is the fundamental action for any LMS course management system.
**Independent Test**: Can be fully tested by navigating to the Course Management page and verifying the courses are displayed in cards using Lumina branding.

**Acceptance Scenarios**:

1. **Given** the user has `Course:readAll` permission, **When** they navigate to the course list, **Then** they see courses displayed as cards with images, titles, and basic info.
2. **Given** a course has no image, **When** the card is rendered, **Then** a Lumina-themed placeholder image is displayed instead.
3. **Given** the user does not have `Course:readAll` permission, **When** they attempt to view the page, **Then** access is denied.

---

### User Story 2 - Create New Course (Priority: P2)

As an administrator, I want to create a new course using a form with image upload, so I can expand the LMS catalog.

**Why this priority**: Adding new content is necessary once the display framework is set up.
**Independent Test**: Can be fully tested by clicking "Create Course", filling out the form including a file upload, and verifying the new course card appears.

**Acceptance Scenarios**:

1. **Given** the user has `Course:add` permission, **When** they fill the create form with valid data and an image and submit, **Then** the course is created via `POST /api/Course` using `multipart/form-data`.
2. **Given** the user leaves a required field empty, **When** they try to submit, **Then** the Reactive Form shows validation errors and prevents submission.

---

### User Story 3 - Edit Existing Course (Priority: P3)

As an administrator, I want to edit an existing course's details and image, so I can keep course information up to date.

**Why this priority**: Maintaining content is standard CRUD, but secondary to creation.
**Independent Test**: Can be fully tested by selecting an existing course, updating its description and image, and confirming the changes persist.

**Acceptance Scenarios**:

1. **Given** the user has `Course:update` permission, **When** they submit updated details via the edit form, **Then** the course updates via `PUT /api/Course` using `multipart/form-data`.

---

### User Story 4 - Toggle Course Status (Priority: P4)

As an administrator, I want to toggle a course's published status with a single click, so I can quickly hide or show courses to students.

**Why this priority**: Quick toggling is a quality-of-life feature for administration.
**Independent Test**: Can be fully tested by clicking the status badge/button on a course card and verifying its state changes.

**Acceptance Scenarios**:

1. **Given** the user has `Course:update` permission, **When** they click the toggle status button on a course, **Then** a PUT request is sent to the toggle endpoint and the UI updates the subtle badge accordingly.

---

### User Story 5 - Delete Course (Priority: P5)

As an administrator, I want to delete a course, so I can remove obsolete courses from the system.

**Why this priority**: Destruction of data is least frequent and highest risk.
**Independent Test**: Can be fully tested by deleting a course and confirming it is removed from the view.

**Acceptance Scenarios**:

1. **Given** the user has `Course:delete` permission, **When** they confirm deletion of a course, **Then** a `DELETE /api/Course` request is sent and the course is removed from the list.

---

### User Story 6 - Manage Course Instructors (Priority: P3)

As an administrator, I want to assign or unassign instructors directly from a course card without editing the entire course, so I can easily manage teaching assignments.

**Why this priority**: Course assignment is an independent lifecycle event from course creation.
**Independent Test**: Can be tested by clicking an assign/unassign button on a course card and verifying the instructor list updates.

**Acceptance Scenarios**:

1. **Given** the user has `Course:enrollInstructor` permission, **When** they assign an instructor via the course card, **Then** the assignment API is called and the card updates.
2. **Given** the user has `Course:unenrollInstructor` permission, **When** they remove an instructor, **Then** the unassignment API is called.

---

### Edge Cases

- What happens when a very large image file is uploaded during course creation or edit?
- How does the system handle rapid successive clicks on the "Toggle Status" button?
- What happens if the API request fails during creation/updating due to server errors?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display courses in a Card-Based Layout following the `stitch-designs/course-management/` blueprint.
- **FR-002**: System MUST restrict actions based on permissions: `Course:read`, `Course:readAll`, `Course:add`, `Course:update`, `Course:delete`, `Course:enrollInstructor`, `Course:unenrollInstructor`.
- **FR-003**: System MUST provide a Reactive Form within a collapsible section at the top of the page for creating and editing courses, handling `multipart/form-data` for image uploads. If no new image is selected during an edit, the form MUST send the existing `imageUrl` string back in the payload.
- **FR-004**: System MUST display a Lumina-themed placeholder image if a course lacks an `imageUrl`.
- **FR-005**: System MUST allow toggling the `isPublished` status via a dedicated toggle endpoint, reflecting the state with a subtle badge style.
- **FR-006**: System MUST authenticate all API calls using the existing Bearer Token interceptor.
- **FR-007**: System MUST display existing assessments (Type and Weight) inside the course details or cards based on the API response (Phase 1 read-only display).
- **FR-008**: System MUST utilize Enums for `Semester` (1=Fall, 2=Spring, 3=Summer) and `AcademicLevel` (1-5).

### Key Entities

- **Course**: Represents an educational offering.
  - Attributes: `id`, `title`, `description`, `imageUrl`, `semester` (Enum), `credit_Hour`, `isPublished`, `academicLevel` (Enum).
- **Assessment**: Represents evaluations linked to a course.
  - Attributes: `type`, `weight` (Read-only display for Phase 1).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Course list renders within 2 seconds for up to 50 courses.
- **SC-002**: 100% of course image uploads process correctly via multipart/form-data without UI freezing.
- **SC-003**: Form validation provides immediate feedback, preventing invalid API submissions.
- **SC-004**: Unauthorized users are entirely blocked from viewing action buttons or making unauthorized API calls.

## Assumptions

- Lumina standing assumptions (from Constitution v1.0.0) — always applicable:
  - Bootstrap 5 is the CSS framework; design.md is the visual source of truth.
  - A Stitch design subfolder exists (or will be created) before implementation.
  - Angular Standalone Components; no NgModule; feature folder under src/app/features/.
  - All HTTP calls delegated to Core services; model interfaces in src/app/models/.
  - Scope-Lock is in effect: only files within the feature scope will be modified.

## Clarifications

### Session 2026-05-01
- Q: Instructor Enrollment Scope → A: Assigning/unassigning instructors is handled directly on the course card, independent of the create/edit form.
- Q: Form Layout → A: The Create/Edit form will be a collapsible section at the top of the page, pushing the course cards down (Option A).
- Q: Image Update Behavior → A: When editing a course without a new image, the existing `imageUrl` string must be sent back in the `FormData` payload (Option C).

- Server handles image compression/resizing; frontend simply uploads the selected file.
- The base API URL for courses is `/api/Course`.
