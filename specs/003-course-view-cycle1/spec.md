# Feature Specification: Course View — Cycle 1 (Card Grid Hub)

**Feature Branch**: `003-course-view-cycle1`
**Created**: 2026-05-01
**Status**: Draft
**Scope**: Main course list view (Card Grid). Add/Edit form, Assessments management, and Enrollment management are explicitly OUT OF SCOPE for this cycle and will be addressed in later cycles. Navigation entry points to those future cycles ARE in scope.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Course Catalog (Priority: P1)

An authenticated user with the `Course:read` or `Course:readAll` permission navigates to the **Course Management** section of the dashboard and sees all courses displayed as a responsive card grid. Each card shows the course image (or a placeholder), title, description (truncated), semester, academic level, credit hours, and a Published/Draft status badge.

**Why this priority**: This is the foundational view. Every other action in this feature depends on being able to see the list of courses. Without it nothing else works.

**Independent Test**: Navigate to `/dashboard/courses`. Verify the course cards render correctly with all expected fields and that users without any `Course:*` permission cannot see the page.

**Acceptance Scenarios**:

1. **Given** an authenticated user has `Course:read` or `Course:readAll`, **When** they navigate to `/dashboard/courses`, **Then** a grid of course cards is displayed, each showing title, description, image/placeholder, semester, academic level, credit hours, and status badge.
2. **Given** no courses exist yet, **When** the page loads, **Then** an appropriate "no courses found" empty state is shown.
3. **Given** the data is still loading, **When** the page is first opened, **Then** a loading spinner is displayed until data arrives.
4. **Given** the API call fails, **When** the page loads, **Then** an error message is displayed with a "Retry" option.
5. **Given** a user has NEITHER `Course:read` NOR `Course:readAll`, **When** they attempt to access `/dashboard/courses`, **Then** they are redirected away by the permission guard.

---

### User Story 2 — Toggle Published/Draft Status (Priority: P2)

A user with the `Course:update` permission can toggle a course's published status directly from the card grid by clicking the status badge. The badge updates immediately on the card without a full page reload.

**Why this priority**: This is a high-frequency admin action that must be available directly from the list view to avoid navigating away for every status change.

**Independent Test**: Click a Published badge on any card. Verify the badge switches to Draft immediately (and vice versa) without a page reload. Confirm the badge is non-interactive for users without `Course:update`.

**Acceptance Scenarios**:

1. **Given** a user has `Course:update`, **When** they click the status badge on a course card, **Then** the badge text and color immediately change to reflect the new state (Published ↔ Draft) without reloading the list.
2. **Given** the toggle API call fails, **When** the user clicks the badge, **Then** the badge reverts to its original state and an error notification is shown.
3. **Given** a user does NOT have `Course:update`, **When** they view a course card, **Then** the status badge is read-only and non-clickable.

---

### User Story 3 — Delete a Course (Priority: P3)

A user with the `Course:delete` permission can soft-delete a course from the card grid. A confirmation dialog appears before the course is removed from the visible list.

**Why this priority**: Destructive actions require proper guarding. This is lower priority than viewing and toggling status but essential for data management.

**Independent Test**: Click the delete icon on a card, confirm in the dialog, and verify the card disappears from the grid without a full page reload. Verify the icon is hidden for users without `Course:delete`.

**Acceptance Scenarios**:

1. **Given** a user has `Course:delete`, **When** they click the delete icon on a course card, **Then** a confirmation dialog appears.
2. **Given** the confirmation dialog is shown, **When** the user confirms, **Then** the course card is removed from the grid immediately and a success notification is shown.
3. **Given** the confirmation dialog is shown, **When** the user cancels, **Then** no change occurs.
4. **Given** a user does NOT have `Course:delete`, **When** they view a course card, **Then** the delete icon is not visible.

---

### User Story 4 — Navigate to Future Feature Cycles (Priority: P4)

From a course card, a user can click icon-buttons to navigate to the **Add/Edit**, **Assessments**, and **Enrollment** pages for that course. For Cycle 1, these are placeholder navigations (router.navigate calls to routes that will be implemented in future cycles). The icons must be shown or hidden based on the user's permissions.

**Why this priority**: Routing stubs must be in place now to avoid restructuring the component in later cycles. The icons serve as the primary entry points for all future functionality.

**Independent Test**: Click each navigation icon on a card and verify the URL changes to the expected sub-route (e.g., `/dashboard/courses/123/edit`). Verify each icon is only visible to the correct permission holder.

**Acceptance Scenarios**:

1. **Given** a user has `Course:add` or `Course:update`, **When** they click the Edit/Create icon, **Then** they are navigated to `/dashboard/courses/{id}/edit`.
2. **Given** a user has `Course:update`, **When** they click the Assessments icon, **Then** they are navigated to `/dashboard/courses/{id}/assessments`.
3. **Given** a user has `Course:enrollInstructor` or `Course:unenrollInstructor`, **When** they click the Enrollment icon, **Then** they are navigated to `/dashboard/courses/{id}/enrollment`.
4. **Given** the "Create Course" button is visible, **When** the user clicks it, **Then** they are navigated to `/dashboard/courses/new/edit`.
5. **Given** a user lacks the required permission for an icon, **When** they view the card, **Then** that specific icon is not rendered.

---

### Edge Cases

- What happens when a course has no image URL? A styled placeholder (icon on a dark navy background) is displayed.
- What happens when the course title or description is very long? Title is truncated to 2 lines; description is truncated to 3 lines with CSS ellipsis.
- What happens if the toggle or delete API call is slow? A loading indicator is shown on the affected card's action area while the request is in-flight.
- What happens if the user navigates to a future-cycle route before it is implemented? A standard Angular "not found" redirect handles it gracefully.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display courses in a responsive card grid layout on the `/dashboard/courses` route.
- **FR-002**: The system MUST gate access to `/dashboard/courses` to users who possess `Course:read` OR `Course:readAll`.
- **FR-003**: Each course card MUST display: title (truncated at 2 lines), description (truncated at 3 lines), course image or placeholder, published/draft status badge, semester label, academic level label, and credit hours.
- **FR-004**: The system MUST show a loading indicator while fetching the course list.
- **FR-005**: The system MUST show an error state with a "Retry" button when the course list cannot be loaded.
- **FR-006**: The system MUST show an empty state message when no courses are returned.
- **FR-007**: Users with `Course:update` MUST be able to toggle a course's published status by clicking the status badge; the UI MUST update immediately (optimistic update) without reloading the list.
- **FR-008**: Users with `Course:delete` MUST be able to delete a course after confirming in a dialog; the card MUST be removed from the grid immediately on success.
- **FR-009**: The "Create Course" button MUST only be visible to users with `Course:add`; clicking it MUST navigate to the add-course route (`/dashboard/courses/new/edit`).
- **FR-010**: An "Edit" icon MUST be visible on each card only to users with `Course:update`; clicking it MUST navigate to `/dashboard/courses/{id}/edit`.
- **FR-011**: An "Assessments" icon MUST be visible on each card only to users with `Course:update`; clicking it MUST navigate to `/dashboard/courses/{id}/assessments`.
- **FR-012**: An "Enrollment" icon MUST be visible on each card to users with `Course:enrollInstructor` OR `Course:unenrollInstructor`; clicking it MUST navigate to `/dashboard/courses/{id}/enrollment`.
- **FR-013**: The dashboard sidebar navigation MUST show the "Course Management" link only to users with `Course:read` OR `Course:readAll`.
- **FR-014**: The service layer MUST provide `getCourses()`, `getAllCourses()`, `toggleCourseStatus(id)`, and `deleteCourse(id)` methods. `getCourses()` is scoped to the user's department; `getAllCourses()` is for admins. The component MUST automatically select the correct method: if the user possesses `Course:readAll`, call `getAllCourses()`; otherwise, call `getCourses()`. No UI toggle is provided.
- **FR-015**: All add/edit, assessment management, and enrollment logic MUST be strictly excluded from this cycle's implementation.

### Key Entities

- **Course**: Represents a course offering. Key attributes: `id`, `title`, `description`, `imageUrl`, `semster` (Semester enum), `credit_Hour`, `isPublished`, `academicLevel` (AcademicLevel enum).
- **Semester**: Enumeration — Fall (1), Spring (2), Summer (3).
- **AcademicLevel**: Enumeration — First Year (1) through Fifth Year (5).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with the appropriate permission can view the full course list within 3 seconds of navigating to the page on a standard connection.
- **SC-002**: The status badge on a course card updates visually within 500ms of a user clicking it, with no full-page reload.
- **SC-003**: After a user confirms deletion, the course card is removed from the view within 500ms, with no full-page reload.
- **SC-004**: All four permission levels (`Course:read`, `Course:update`, `Course:delete`, `Course:add`) correctly show or hide their respective UI elements, verifiable by switching between user roles.
- **SC-005**: 100% of navigation icons correctly route to the expected URL pattern (including future-cycle placeholder routes).

---

## Assumptions

- Bootstrap 5 is the primary CSS framework. Lumina design tokens (cyan `#41B3E3`, dark navy `#001A33`/`#002D5B`) are the visual source of truth per `design.md`.
- A Stitch design reference exists at `stitch-designs/course-view/` and will be consulted during implementation.
- The Angular Standalone Component architecture is used; no NgModule files will be created.
- All HTTP calls are delegated to `CourseService` in `src/app/core/services/`; model interfaces live in `src/app/models/`.
- Scope-Lock is in effect: only files within the course-view feature scope may be modified. Unrelated files (other features, shared modules) are off-limits unless explicitly approved.
- The backend API is already deployed and accessible at `https://localhost:7289/api/Course`.
- The `toggleCourseStatus` endpoint returns a success status; the UI performs an optimistic update without needing to re-fetch the full list.
- Sub-routes for edit, assessments, and enrollment (`/dashboard/courses/:id/edit`, etc.) will be registered as placeholder routes that immediately redirect back to `/dashboard/courses`. No "Coming Soon" stub component will be created.

---

## Clarifications

### Session 2026-05-01

- Q: Should the component auto-select `getAllCourses()` for `Course:readAll` users and `getCourses()` for others, or use a single endpoint / UI toggle? → A: Auto-select (Option A): component checks `Course:readAll` first and calls `getAllCourses()`; falls back to `getCourses()` for scoped users. No UI toggle.
- Q: What should a user see when clicking a Cycle 1 navigation icon that leads to a future-cycle route? → A: Redirect (Option B): all placeholder sub-routes redirect immediately back to `/dashboard/courses`. No stub component is created.
