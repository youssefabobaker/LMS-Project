# Feature Specification: Quiz View – Cycle 1

**Feature Branch**: `012-quiz-view-cycle1`  
**Created**: 2026-06-19  
**Status**: Draft  
**Input**: User description: "I need to implement the quiz/quiz-view within the existing Course Detail page structure. This view must toggle active below the main course banner when the new 'Quiz' tab is selected, replacing the other tab contents seamlessly."

---

## Clarifications

### Session 2026-06-19
- Q: Quiz list refresh strategy after add/edit/delete/toggle → A: Local update only — splice/add/remove the affected item in the in-memory list without re-fetching; revert on failure.
- Q: Alert/notification mechanism for all user-facing feedback → A: SweetAlert2 — used for all confirmations (delete, toggle), success toasts, and error alerts across the entire Quiz View feature.
- Q: Should `totalMarks` appear on the quiz list card? → A: No — `totalMarks` is not in the list API response and must not be shown on the card. The `description` field (available in the list response) MUST be displayed on the card instead.
- Q: `isActive` display on the quiz list card → A: `isActive` will **not** appear on the list card in Cycle 1. Active status display and the toggle-active feature are deferred to Cycle 2 (quiz detail page). The `isActive` field is still sent in the Add/Edit modal form body (required by the API).
- Q: How should the Add/Edit modal handle form validation errors? → A: Inline field-level validation — each field shows an error message directly beneath it on blur or submit attempt; the submit button is disabled until the form is valid.
- Q: Should the instructor be warned that editing a quiz regenerates its Quiz Code? → A: Yes — show a SweetAlert2 warning dialog when the user clicks Submit in edit mode, stating the current Quiz Code will be invalidated and a new one generated; require explicit Confirm before proceeding.

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Browse Course Quizzes (Priority: P1)

As a user with `Quiz:read` permission, I want to see all quizzes for a course when I click the **Quiz** tab so that I know what assessments are scheduled.

**Why this priority**: Core visibility. Without this, the entire feature delivers zero value.

**Independent Test**: Click the Quiz tab on any Course Detail page and verify the list renders with correct titles, codes, durations, and scheduled dates.

**Acceptance Scenarios**:

1. **Given** I am on the Course Detail page with `Quiz:read` permission, **When** I click the **Quiz** tab, **Then** the Content/Assignments area is replaced by a quiz list (or an empty-state message) without a full page reload.
2. **Given** the course has quizzes, **When** the Quiz tab view renders, **Then** each card shows: Title, Description, 8-character Quiz Code (copy-friendly), formatted duration in minutes, and formatted scheduled date.
3. **Given** the course has no quizzes, **When** the Quiz tab is active, **Then** an empty-state illustration and explanatory message are displayed.
4. **Given** I do **not** have `Quiz:read` permission, **When** I navigate to the course detail page, **Then** the Quiz tab is not visible.

---

### User Story 2 – Add or Edit a Quiz (Priority: P2)

As a user with `Quiz:addOrUpdate` permission, I want to create a new quiz or edit an existing one via a modal so that I can configure assessments for my course.

**Why this priority**: Required for instructors to populate the quiz list; without it the list stays empty.

**Independent Test**: Click "Add New Quiz" and verify the creation modal opens and submits data correctly, or click "Edit" on an existing card and verify fields are pre-populated.

**Acceptance Scenarios**:

1. **Given** I have `Quiz:addOrUpdate` permission and the Quiz tab is active, **Then** the **"+ Add New Quiz"** button is visible in the section header.
2. **Given** I click "Add New Quiz", **When** the modal opens, **Then** it presents a form with: Title, Description, Scheduled Date, Duration (`HH:mm:ss`), Total Marks, and Active toggle *(sent to the API on submit; not visible on the list card)*.
3. **Given** I submit a valid new-quiz form, **When** the request completes via `POST /api/Quiz/course/{courseId}`, **Then** the new quiz appears in the list without a full page reload.
4. **Given** I click the **Edit** icon on a quiz card (visible only with `Quiz:addOrUpdate` permission), **When** the modal opens, **Then** existing quiz data is pre-filled and submitting updates the quiz via the same endpoint with the quiz `id` included.

---

### User Story 3 – Delete a Quiz (Priority: P3)

As a user with `Quiz:delete` permission, I want to permanently remove a quiz after confirming so that outdated assessments do not clutter the course.

**Why this priority**: Useful for housekeeping but non-blocking for core reading and management flows.

**Independent Test**: Click the delete icon on a quiz card, confirm in the dialog, and verify the card disappears and `DELETE /api/Quiz/{id}` returns success.

**Acceptance Scenarios**:

1. **Given** I have `Quiz:delete` permission, **When** I view a quiz card, **Then** a delete icon is visible on that card.
2. **Given** I click the delete icon, **When** the confirmation dialog appears and I confirm, **Then** `DELETE /api/Quiz/{id}` is called and the quiz card is removed from the list.
3. **Given** I click the delete icon but **cancel** the confirmation dialog, **When** I return to the list, **Then** no change occurs.

---

### User Story 4 – Navigate to Quiz Detail (Priority: P3)

As a user with `questions:read` permission, I want to click a quiz card to navigate to the detailed quiz view (Cycle 2) so that I can inspect or manage its questions.

**Why this priority**: Preparatory navigation guard for Cycle 2; the card must be ready but the destination page is out of scope for this cycle.

**Independent Test**: Click a quiz card and verify navigation to the quiz detail route occurs when `questions:read` is present, and that the card is not clickable when this permission is absent.

**Acceptance Scenarios**:

1. **Given** I have `questions:read` permission, **When** I click a quiz card, **Then** the application navigates to the quiz detail route (Cycle 2 destination).
2. **Given** I do **not** have `questions:read` permission, **When** I hover over a quiz card, **Then** the cursor is the default arrow (not a pointer) and clicking does nothing.

---

### Edge Cases

- What happens when the API returns an error while fetching quizzes? → Display a SweetAlert2 error alert with a retry option; do not crash the tab.
- What if the delete API call fails? → Keep the card in the list and show a SweetAlert2 error alert.
- What if the quiz list is still loading? → Show a skeleton/loading state inside the tab area.
- What if duration is `"00:00:00"`? → Display "0 min" rather than crashing or showing an empty value.
- What if `scheduledDate` is in the past? → Display it without special decoration (past/overdue styling is out of scope for Cycle 1).
- What if the instructor cancels the Quiz Code regeneration warning during edit? → The modal stays open with all fields intact; no API call is made and the existing quiz is unchanged.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST add a **Quiz** tab to the existing Course Detail tab bar, positioned after the Assignments tab, visible only to users with `Quiz:read` permission.
- **FR-002**: System MUST fetch the quiz list via `GET /api/Quiz/course/{courseId}` when the Quiz tab is activated and the list has not already been loaded. After a successful mutation (create, update, or delete), the list MUST be updated locally (splice/add/remove) without re-fetching; on failure, the previous state MUST be restored.
- **FR-003**: System MUST display each quiz as a card with the following fields (all sourced from the list API response):
  - **Title** — quiz name.
  - **Description** — the quiz description text, displayed beneath the title.
  - **Quiz Code** — the full 8-character `quizCode` displayed in a monospace/copyable style.
  - **Duration** — converted from `HH:mm:ss` to total minutes (e.g., `"01:30:00"` → `"90 min"`).
  - **Scheduled Date** — formatted in a human-readable style (e.g., "Jun 25, 2026 · 10:00 AM").
  - **`isActive` and `totalMarks` are NOT shown on the list card** — these are displayed in the quiz detail view (Cycle 2).
- **FR-004**: System MUST show an empty-state message when the quiz list is empty.
- **FR-005**: System MUST display a loading state while the quiz list is being fetched.
- **FR-006**: System MUST show the **"+ Add New Quiz"** button in the section header only when the user has `Quiz:addOrUpdate` permission.
- **FR-007**: System MUST open an Add/Edit modal when the "Add New Quiz" button or an Edit icon is clicked. Modal form fields: Title, Description, Scheduled Date, Duration (`HH:mm:ss`), Total Marks, and Active toggle. The modal MUST:
  - Show an inline error message **beneath each invalid field** on blur or on submit attempt.
  - Keep the **Submit button disabled** until all required fields are valid.
  - On server-side error (non-validation), close the modal and show a SweetAlert2 error alert.
- **FR-008**: System MUST call `POST /api/Quiz/course/{courseId}` on form submission:
  - **Create mode** (no `id`): Submit directly after validation passes.
  - **Edit mode** (existing `id`): Before calling the API, System MUST display a **SweetAlert2 warning dialog** informing the instructor that saving will **invalidate the current Quiz Code and generate a new one**. The API call proceeds only if the instructor confirms; cancelling returns to the modal with no changes.
- **FR-009**: System MUST show the **Edit** icon on a quiz card only when the user has `Quiz:addOrUpdate` permission.
- **FR-010**: System MUST show the **Delete** icon on a quiz card only when the user has `Quiz:delete` permission.
- **FR-011**: System MUST present a **SweetAlert2 confirmation dialog** before calling `DELETE /api/Quiz/{id}`. On confirm → call API, remove card locally, show SweetAlert2 success toast. On cancel → no action. On API failure → revert and show SweetAlert2 error alert.
- **FR-015**: System MUST use **SweetAlert2** as the sole library for all user-facing feedback: delete confirmation dialogs, add/edit success/error alerts, and fetch-error alerts with retry prompt.
- **FR-017**: The Add/Edit modal MUST enforce the following client-side validation rules:
  - **Title**: Required; must not be blank.
  - **Description**: Required; must not be blank.
  - **Scheduled Date**: Required; must be a valid datetime.
  - **Duration**: Required; must match `HH:mm:ss` format and must not be `00:00:00`.
  - **Total Marks**: Required; must be a positive number greater than zero.
- **FR-013**: System MUST make a quiz card clickable (navigating to the Cycle 2 quiz detail route) if and only if the user has `questions:read` permission; otherwise the card is static.
- **FR-014**: System MUST maintain full visual and layout consistency with the existing Assignments tab (cyan accent `#41B3E3`, Inter/Work Sans fonts, identical card padding and spacing).

### Key Entities

- **Quiz**: Represents a scheduled assessment. List-card visible attributes (Cycle 1): `id`, `title`, `description`, `scheduledDate`, `duration`, `quizCode`. Deferred to Cycle 2 (detail page): `isActive`, `totalMarks`, `courseId`, `quizQuestions`.
- **QuizCode**: The 8-character unique code students use in the desktop application to enter a quiz. Must be prominently and clearly displayed on each card.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch to and from the Quiz tab instantly without full page reloads.
- **SC-002**: All specified quiz data points (Title, Description, Quiz Code, Duration in minutes, Scheduled Date) are visible on the card without any interaction.
- **SC-003**: Only users with the appropriate permissions (`Quiz:read`, `Quiz:addOrUpdate`, `Quiz:delete`, `questions:read`) see the corresponding UI controls.
- **SC-004**: The confirmation dialog prevents accidental deletion in 100% of test scenarios.
- **SC-005**: The quiz card's click-to-navigate behaviour is correctly gated by the `questions:read` permission — clickable for permitted users, inert for others.
- **SC-006**: The Quiz tab view is visually indistinguishable in style from the Assignments tab (fonts, colours, spacing).

---

## Assumptions

- Lumina standing assumptions (from Constitution v1.0.0) — always applicable:
  - Angular Standalone Components; no NgModule; feature folder under `src/app/features/`.
  - All HTTP calls delegated to Core services; model interfaces in `src/app/core/models/`.
  - Scope-Lock is in effect: only files within the feature scope will be modified.
- The permission service already exposes a synchronous or observable method to check named permissions (e.g., `Quiz:read`, `Quiz:addOrUpdate`, `Quiz:delete`, `questions:read`).
- The Course Detail page already has a working tab-switching mechanism used by Content and Assignments tabs; the Quiz tab will slot into the same mechanism.
- The Cycle 2 quiz detail route exists (or will exist) as a navigable Angular route; this cycle only needs to wire up the `routerLink` or navigation call.
- `GET /api/Quiz/course/{courseId}` returns: `id`, `title`, `scheduledDate`, `duration`, `description`, `quizCode`. The `isActive` field is **not** needed on the list card in Cycle 1; it will be consumed in Cycle 2 (quiz detail page).
- Duration conversion (`HH:mm:ss` → total minutes) is handled purely in the presentation layer via a utility pipe or function.
- Quiz Code copying (clipboard) is a UX enhancement handled client-side; no additional API call is required.
- SweetAlert2 (`sweetalert2` npm package) is already available or will be added to the project; no alternative dialog/toast library is used for this feature.
