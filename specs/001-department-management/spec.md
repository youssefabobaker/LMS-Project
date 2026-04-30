# Feature Specification: Department Management

**Feature Branch**: `001-department-management`
**Created**: 2026-04-30
**Status**: Draft
**Input**: User description: "Generate the technical specifications and implementation logic for the
Department Management feature. Focus exclusively on Department entities, ignoring Courses data.
Reference backend APIs from `backend APIs/Departmant&CoursesController.md` (Department section only),
align logic with `stitch-designs/department-management/`, and follow the Lumina Constitution."

---

## Clarifications

### Session 2026-04-30

- Q: What should happen to a department's displayed status after the user refreshes the page, if the backend GET response contains no status field? → A: Treat all departments returned by GET as Active; removed/soft-deleted records simply disappear from the list (no Disabled state visible in Phase 1). The "Disable" action is a permanent removal from the list for Phase 1.
- Q: When the user clicks the retry button after a failed GET /api/Department call, what should happen? → A: Re-call the departments API silently in the background; show the spinner again during the retry attempt.
- Q: Should the Remove action require a confirmation dialog before executing DELETE, given there is no restore in Phase 1? → A: Yes — show a SweetAlert2 confirmation dialog ("Are you sure? This cannot be undone.") before calling DELETE.
- Q: When the user clicks Edit on a second department while the form is already open in edit mode, what should happen? → A: Switch the form directly to the new department, overwriting the current form state immediately (no blocking dialog).
- Q: What should happen when the user clicks "Create New Department" while the form is already open in Edit mode? → A: Reset the form to Add mode — clear all fields and switch the card header to "Add Department", discarding any unsaved edit state silently.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Department List (Priority: P1)

An admin navigates to the Department Management page and sees all departments in a
scrollable data table. Each row shows the department ID and title, with a hover-reveal
action column. A loading spinner is displayed while the list is being fetched. The page
header contains a "Create New Department" button (visible only when the user holds the
`dept:add` permission).

**Why this priority**: Reading the list is the entry point for all other department
operations. Nothing else is usable without it.

**Independent Test**: Navigate to `/department-management` while authenticated. The
table MUST populate with department records from `GET /api/Department`. Verify the
spinner appears and disappears, and that rows reflect real data.

**Acceptance Scenarios**:

1. **Given** a user with `dept:read` permission is on the Department Management page,
   **When** the page loads,
   **Then** a spinner is shown, then replaced by a table of departments with ID
   and Title columns.

2. **Given** the API returns an empty array,
   **When** the page loads,
   **Then** an appropriate empty-state message is displayed (no broken layout).

3. **Given** a user without `dept:read` permission,
   **When** they navigate to the page,
   **Then** the data table is not rendered (hidden via `*ngIf`).

---

### User Story 2 — Create Department (Priority: P2)

An admin with the `dept:add` permission clicks "Create New Department". A collapsible
form card slides open above the table. The form contains:

- **Department Title** (text input, required)

On form submission the system calls `POST /api/Department` and, on success, closes the
form, refreshes the list, and shows a SweetAlert2 success toast. On failure (e.g.,
`409 Conflict`), a SweetAlert2 error toast shows the server message.

**Why this priority**: Creating departments is the core write operation; without it the
feature has no practical value.

**Independent Test**: Click "Create New Department", fill in a unique title, click
"Save Department". Verify a new row appears in the table and a success toast fires.

**Acceptance Scenarios**:

1. **Given** the form is open and the title field is empty,
   **When** the user clicks "Save Department",
   **Then** the title field shows a validation error and the form is NOT submitted.

2. **Given** a valid unique department title is entered,
   **When** the user clicks "Save Department",
   **Then** `POST /api/Department` is called with `{ "title": "<value>" }`,
   the form closes, the list refreshes, and a success toast is shown.

3. **Given** the submitted title already exists on the server,
   **When** `POST /api/Department` returns `409 Conflict`,
   **Then** a SweetAlert2 error toast displays the conflict message.

4. **Given** the form is open in edit mode for an existing department and the user
   clicks "Create New Department",
   **When** the button is clicked,
   **Then** the form stays open, all fields are cleared, and the card header changes
   to "Add Department" (any unsaved edit state is silently discarded).

---

### User Story 3 — Edit Department (Priority: P3)

An admin with `dept:update` permission hovers over a table row and clicks the Edit
icon button. The same collapsible form opens pre-populated with the department's
current title. On save, the system calls `PUT /api/Department/{id}`. On success the
form closes and the list refreshes. The card header dynamically changes from
"Add Department" to "Edit Department".

**Why this priority**: Editing is important but secondary — users need to create and
read first.

**Independent Test**: Click Edit on any row, change the title, click "Save
Department". Verify the updated title appears in the table and no duplicate row
is created.

**Acceptance Scenarios**:

1. **Given** the user clicks Edit on a department row,
   **When** the form opens,
   **Then** the title field is pre-filled with the existing title.

2. **Given** a valid (and changed) title is submitted,
   **When** `PUT /api/Department/{id}` returns `200 OK`,
   **Then** the form closes, the list refreshes, and a success toast fires.

3. **Given** the user clicks "Discard" while the form is in edit mode,
   **When** the form closes,
   **Then** no API call is made and the list is unchanged.

4. **Given** the form is open in edit mode for Department A and the user clicks Edit
   on Department B,
   **When** the second Edit click is received,
   **Then** the form stays open and its fields are immediately overwritten with
   Department B's data (no confirmation required).

---

### User Story 4 — Remove Department (Priority: P4)

An admin with `dept:delete` permission hovers over a table row and clicks the Remove
(block/delete) icon button. The system calls `DELETE /api/Department/{id}` (soft
delete — record is not physically removed on the backend). On success, the department
row disappears from the list immediately. No Enable/restore action exists in Phase 1.

**Why this priority**: Removal is an operational control; it follows create/edit in
importance.

**Acceptance Scenarios**:

1. **Given** a department row is visible and the user clicks Remove,
   **When** the SweetAlert2 confirmation dialog appears and the user confirms,
   **Then** `DELETE /api/Department/{id}` is called.

2. **Given** the confirmation dialog is shown and the user clicks Cancel,
   **When** the dialog closes,
   **Then** no API call is made and the row remains in the table.

3. **Given** the user confirms removal and `DELETE /api/Department/{id}` returns `200 OK`,
   **When** the response is received,
   **Then** the row is removed from the table immediately and a success toast fires.

4. **Given** the user confirms removal and `DELETE /api/Department/{id}` returns an error,
   **When** the response is received,
   **Then** a SweetAlert2 error toast is shown and the row remains in the table.

5. **Given** a user without `dept:delete` permission,
   **When** they view a department row,
   **Then** the Remove button is not rendered.

---

### Edge Cases

- What happens when `GET /api/Department` times out or returns `500`? → Show an
  error toast and a retry button. Clicking retry re-calls `GET /api/Department`
  silently in the background, re-shows the spinner during the attempt, and
  repopulates the table on success (or shows the error toast again on failure).
- What if the department title field contains only whitespace? → Frontend validator
  MUST trim and reject with a validation error message.
- What if a user has `dept:read` but not `dept:add`? → "Create New Department"
  button is hidden; form is never accessible.
- What if a user has `dept:update` but not `dept:read`? → Page loads empty (action
  buttons are moot); treat this as a misconfiguration that does not crash the UI.
- What if the user clicks Edit on Department B while the form is already open in
  edit mode for Department A? → The form switches immediately to Department B's
  data; no confirmation is shown and any unsaved changes for Department A are silently
  discarded.
- What if the user clicks "Create New Department" while the form is open in Edit
  mode? → The form resets to Add mode (fields cleared, header reads "Add Department")
  without closing; no confirmation is shown.
- What if a department is removed while the form is open in edit mode for that
  department by another admin? → On save, the server returns `404 Not Found`; show
  an error toast and close/reset the form.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all departments from `GET /api/Department` in a
  scrollable data table on page load. The table columns are: ID and Title.
- **FR-002**: System MUST show a loading spinner while the department list is being
  fetched and hide it when loading completes.
- **FR-003**: The "Create New Department" button MUST be visible only when the
  authenticated user has the `dept:add` permission.
- **FR-004**: The Add/Edit form MUST use Angular Reactive Forms with validation:
  `title` is required and must not be blank after trimming.
- **FR-005**: System MUST call `POST /api/Department` with `{ "title": string }` on
  form submission in create mode and handle `201 Created` and error responses.
- **FR-006**: System MUST call `PUT /api/Department/{id}` with `{ "title": string }`
  on form submission in edit mode and handle `200 OK` and error responses.
- **FR-007**: Edit action button in table rows MUST be visible only when the user
  has `dept:update` permission.
- **FR-008**: The collapsible form card header MUST read "Add Department" in create
  mode and "Edit Department" in edit mode.
- **FR-009**: Before calling `DELETE /api/Department/{id}`, the system MUST display
  a SweetAlert2 confirmation dialog with a warning that the action cannot be undone.
  The DELETE call MUST only proceed if the user explicitly confirms. On success,
  the department row MUST be removed from the table immediately and a success toast
  shown. No Status badge or Enable/restore action exists in Phase 1.
- **FR-010**: The Remove action button in table rows MUST be visible only when the
  user has `dept:delete` permission.
- **FR-011**: All API errors MUST surface to the user via SweetAlert2 error toasts
  displaying the server-returned `message` field.
- **FR-012**: All successful write operations MUST display a SweetAlert2 success
  toast.
- **FR-013**: System MUST NOT render any UI or call any endpoint related to Courses.
- **FR-014**: When `GET /api/Department` fails, the table MUST display an
  empty-state message and a retry button. Clicking the retry button MUST
  re-invoke the departments API call in the background (re-showing the spinner)
  without a full page navigation reload.

### Key Entities

- **Department**: Represents an organizational unit. All records returned by the API
  are considered Active (visible). Soft-deleted records are absent from the GET
  response and are therefore not rendered.
  - `id: number` — Unique identifier (server-generated)
  - `title: string` — The department name (required, unique per server enforcement)

- **DepartmentCreateRequest**: `{ title: string }`
- **DepartmentUpdateRequest**: `{ title: string }`

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with appropriate permissions can view, create, edit, and
  remove departments without leaving the Department Management page.
- **SC-002**: All form validation errors are visible to the user before any API
  call is made.
- **SC-003**: All write operations complete and the table reflects updated data
  within a single user interaction (no manual page refresh required).
- **SC-004**: Users without a required permission (`dept:read`, `dept:add`,
  `dept:update`, `dept:delete`) never see the UI controls tied to that permission.
- **SC-005**: API errors are surfaced to the user with a human-readable message
  within 3 seconds of the failed request.
- **SC-006**: No data, UI element, or service call related to Courses appears in
  the Department Management page or its associated service/model files.
- **SC-007**: A removed department row disappears from the table immediately upon
  a successful `DELETE` response, with no Status badge or restore control present.

---

## Assumptions

<!--
  Lumina standing assumptions (from Constitution v1.0.0) — always applicable:
  • Bootstrap 5 is the CSS framework; design.md is the visual source of truth.
  • A Stitch design subfolder exists (or will be created) before implementation.
  • Angular Standalone Components; no NgModule; feature folder under src/app/features/.
  • All HTTP calls delegated to Core services; model interfaces in src/app/core/models/.
  • Scope-Lock is in effect: only files within the feature scope will be modified.

  Feature-specific assumptions:
-->

- The `GET /api/Department` response returns only `{ id, title }`. All returned
  records are treated as active (visible). No `isActive` or `status` field is needed
  in the client-side model.
- The "Head of Department" dropdown visible in the Stitch design is deferred to a
  future phase; Phase 1 only requires the `title` field in the create/edit form.
- Permission strings are exactly: `dept:read`, `dept:add`, `dept:update`, `dept:delete`
  as specified by the user. The frontend enforces these via `PermissionService` even
  though the backend docs note authorization is currently not enforced server-side.
- SweetAlert2 is already a project dependency (used in `user-management.component.ts`).
- The `DepartmentService` will be created in `src/app/core/services/department.service.ts`.
- The `Department` model interface will be created in `src/app/models/department.ts`
  (matching the pattern of `src/app/models/user.ts` and `src/app/models/role.ts`).
- The feature component will be created at
  `src/app/features/department-management/department-management.component.*`.
- No pagination logic is required in Phase 1 (the Stitch design shows pagination UI
  but the backend `GET /api/Department` does not document pagination parameters).
- The table has NO Status column and NO status badges in Phase 1. The Stitch design's
  status UI is deferred until the backend GET response exposes a status field.
