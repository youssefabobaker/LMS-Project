# Feature Specification: Quiz Detail Page & Question Management

**Feature Branch**: `013-quiz-detail-questions`
**Created**: 2026-06-20
**Status**: Draft
**Input**: User description: "I need to implement the Quiz Detail Page and its complete Question Management System, fully integrating the remaining 5 endpoints from the API documentation while matching the modern Lumina LMS aesthetic."

## Clarifications

### Session 2026-06-20

- Q: Should per-question `marks` be displayed on each question card? → A: Yes — show a "X pts" badge on each question card alongside other meta-data.
- Q: What is the minimum number of choices required for a MultipleChoice question before the form allows submission? → A: Minimum 2 choices — the form blocks submission if fewer than 2 choice inputs are filled.
- Q: How should an inactive question card be visually represented? → A: Card stays visible but dimmed (reduced opacity + "Inactive" badge); all content remains readable.
- Q: Should instructors be able to reorder questions on the detail page? → A: No — questions display in API-returned order only; drag-and-drop reordering is out of scope for Cycle 1.
- Q: How should the "Back to Quizzes" link navigate? → A: Fixed route — always navigates to `/dashboard/courses/:courseId/quizzes` regardless of browser history.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Quiz Details & Questions (Priority: P1)

An instructor navigates from the Quizzes tab into a specific quiz to see the full quiz details and all its questions. The page shows a clean header with Back navigation, the quiz title, meta-data (description, scheduled date, total marks, duration, quiz code), and a full scrollable list of question cards below it.

**Why this priority**: This is the entry point and the foundation for all other interactions on the page. Without this view, nothing else can function.

**Independent Test**: Can be fully tested by navigating to a quiz from the list, verifying the header data matches the quiz details, and verifying each question card appears with its choices rendered. Delivers immediate read-only value to instructors reviewing quiz content.

**Acceptance Scenarios**:

1. **Given** an instructor with `questions:read` permission, **When** they click on a quiz from the Quizzes tab, **Then** they are navigated to the Quiz Detail Page showing the quiz header meta-data and all its questions in order.
2. **Given** a quiz with no questions, **When** the detail page loads, **Then** an appropriate empty-state message is displayed.
3. **Given** a user without `questions:read` permission, **When** they attempt to access the detail page, **Then** they are shown an access-denied message or redirected away.
4. **Given** a quiz has both MultipleChoice and TrueFalse questions, **When** the page loads, **Then** both question types are rendered correctly with their respective choices.

---

### User Story 2 - Review Correct Answers (Priority: P2)

An instructor reviews the correct answers on the quiz detail page. Each question card displays all its choices, and the correct choice is visually highlighted with a green/teal tint and a checkmark icon so the instructor can quickly audit the quiz answer key at a glance.

**Why this priority**: Reading and auditing answer keys is the primary use case for instructors opening the detail page, making this essential to the read experience.

**Independent Test**: Can be tested independently by checking that correct choices have distinct visual styling (tint + checkmark icon) while incorrect choices are styled neutrally.

**Acceptance Scenarios**:

1. **Given** a loaded question card with MultipleChoice answers, **When** the instructor views the choices, **Then** the correct choice (where `isCorrect == true`) has a green/teal background tint and a checkmark icon.
2. **Given** a TrueFalse question, **When** the instructor views the choices, **Then** only the correct choice is highlighted; the other is neutral.
3. **Given** a question where no choice is marked correct (edge case), **When** the card is rendered, **Then** all choices are styled neutrally without errors.

---

### User Story 3 - Add a New Question (Priority: P3)

An instructor with `questions:add` permission clicks the "+ Add Question" primary action button on the quiz detail page. A modal dialog opens with a reactive form. They fill in the question text, select the type (MultipleChoice or TrueFalse), set marks, toggle "Allow Looking Down", and define choices. Upon submit, the new question is appended to the list without a full page reload.

**Why this priority**: Adding questions is the primary write action on the page. It directly builds quiz content and is needed before other management features (edit, toggle) are meaningful.

**Independent Test**: Can be tested by clicking "Add Question", completing the form for a MultipleChoice question, submitting, and verifying the new question card appears at the bottom of the list with its correct answer highlighted.

**Acceptance Scenarios**:

1. **Given** a MultipleChoice type is selected in the modal, **When** the form renders, **Then** dynamic text inputs for choices appear, and the instructor can add multiple choices with one radio button to mark the correct answer.
2. **Given** a TrueFalse type is selected in the modal, **When** the type dropdown changes, **Then** the choices are automatically locked to "True" and "False" and the input fields are disabled.
3. **Given** all required fields are filled, **When** the instructor submits the form, **Then** the new question is added to the quiz and appears at the bottom of the question list.
4. **Given** the form has validation errors (e.g., empty question text), **When** the instructor clicks submit, **Then** inline error messages appear and the form is not submitted.
5. **Given** a user without `questions:add` permission, **When** they view the quiz detail page, **Then** the "+ Add Question" button is hidden.

---

### User Story 4 - Edit an Existing Question (Priority: P4)

An instructor clicks the "Edit" button on an existing question card. The same modal dialog opens pre-populated with the question's existing values (text, type, marks, allow-looking-down flag, and all its current choices with the correct answer pre-selected). After making changes and submitting, the question card in the list updates to reflect the new values.

**Why this priority**: Edit is a natural lifecycle action for questions after they are added. It is lower priority than creating because at least some questions must exist first.

**Independent Test**: Can be tested independently by clicking edit on an existing question, verifying all fields are pre-populated correctly, making a change, submitting, and verifying the question card reflects the updated values.

**Acceptance Scenarios**:

1. **Given** an instructor clicks "Edit" on a MultipleChoice question, **When** the modal opens, **Then** all existing choices are pre-populated in the dynamic inputs and the correct answer radio is pre-selected.
2. **Given** an instructor clicks "Edit" on a TrueFalse question, **When** the modal opens, **Then** the type is set to TrueFalse, choices are locked to "True"/"False", and the correct answer radio reflects the existing state.
3. **Given** the instructor edits and saves, **When** the form is submitted, **Then** the question card updates in place showing the new values.

---

### User Story 5 - Toggle Quiz Active Status (Priority: P5)

An instructor with `Quiz:addOrUpdate` permission can flip the quiz's active/inactive state directly from the detail page header using an elegant toggle switch. The toggle reflects the current `isActive` state and changes immediately upon interaction.

**Why this priority**: Quiz-level activation control is a secondary management action. It belongs on the detail page as it relates to the full quiz context.

**Independent Test**: Can be tested by toggling the switch and verifying the visual state changes and the new status persists on page refresh.

**Acceptance Scenarios**:

1. **Given** a quiz that is active, **When** an instructor with `Quiz:addOrUpdate` permission clicks the toggle, **Then** the quiz becomes inactive and the toggle reflects the new state immediately.
2. **Given** a quiz that is inactive, **When** the toggle is clicked, **Then** the quiz becomes active.
3. **Given** a user without `Quiz:addOrUpdate` permission, **When** they view the detail page, **Then** the toggle is hidden or read-only.

---

### User Story 6 - Toggle Individual Question Active Status (Priority: P6)

An instructor with `questions:update` permission can toggle an individual question's active status from within its question card on the detail page. This allows enabling or disabling specific questions without deleting them, giving fine-grained control over quiz content.

**Why this priority**: Individual question activation is a management refinement, important but less critical than basic CRUD operations.

**Independent Test**: Can be tested by clicking a question's toggle button, verifying the visual state of the card changes (e.g., dimmed/muted styling for inactive), and confirming the change persists on refresh.

**Acceptance Scenarios**:

1. **Given** an active question card, **When** an instructor with `questions:update` permission clicks its toggle, **Then** the question becomes inactive and its card is visually dimmed (reduced opacity) with an "Inactive" badge appended; all question content remains readable.
2. **Given** an inactive question, **When** the toggle is clicked, **Then** it becomes active again.
3. **Given** a user without `questions:update` permission, **When** viewing question cards, **Then** the toggle button is hidden.

---

### Edge Cases

- What happens when the quiz detail API returns an empty `quizQuestions` array? → An empty state card should be displayed.
- What happens if the toggle quiz/question API call fails? → A toast error notification should appear and the UI state should revert.
- What happens if the user submits the add/edit question form with fewer than 2 choices for a MultipleChoice question? → Inline validation prevents submission; a minimum of 2 filled choices is required.
- What happens if `correctAnswerIndex` is out of bounds of the choices array? → Should be prevented by form validation before submission.
- What happens when a user tries to navigate to the quiz detail page for a quiz that does not exist? → A 404-friendly error state is shown.
- What happens when TrueFalse is selected and then switched back to MultipleChoice? → The dynamic choices inputs should be unlocked and reset to a clean state.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load full quiz details including all questions and choices from the backend upon navigating to the Quiz Detail Page.
- **FR-002**: System MUST gate the entire Quiz Detail Page behind the `questions:read` permission, redirecting or showing an access-denied state for unauthorized users.
- **FR-003**: System MUST render each question in its own card, displaying the question text, type badge, marks as a points badge (e.g., "5 pts"), allow-looking-down indicator, and all choices.
- **FR-004**: System MUST visually distinguish correct choices (green/teal tint + checkmark icon) from incorrect choices on each question card.
- **FR-005**: System MUST provide a "+ Add Question" primary action button, visible only to users with `questions:add` permission.
- **FR-006**: System MUST provide a unified Question Form Modal used for both adding new questions and editing existing ones.
- **FR-007**: The Question Form Modal MUST contain fields for: question text (textarea), question type (dropdown: MultipleChoice / TrueFalse), marks (numeric), and allow-looking-down (checkbox).
- **FR-008**: When question type is "MultipleChoice", the modal MUST render dynamic, user-editable choice inputs and a radio-button selector for the correct answer index.
- **FR-009**: When question type is "TrueFalse", the modal MUST automatically pre-populate choices with ["True", "False"], lock those inputs from editing, and still allow the correct answer radio to be selected.
- **FR-010**: The modal MUST pre-populate all fields with existing values when opened in Edit mode.
- **FR-011**: System MUST validate all required fields before allowing form submission and display inline validation errors. For MultipleChoice questions, a minimum of 2 filled choice inputs is required; submission is blocked otherwise.
- **FR-012**: On successful add, the new question MUST be appended to the bottom of the question list without a full page reload.
- **FR-013**: On successful edit, the question card in the list MUST update in place to reflect the new values.
- **FR-014**: System MUST display an "Edit" button on each question card, visible only to users with `questions:update` permission.
- **FR-015**: System MUST display a toggle button on each question card to flip its active state, visible only to users with `questions:update` permission.
- **FR-016**: System MUST display an active/inactive toggle switch in the quiz header to flip the quiz's `isActive` state, visible only to users with `Quiz:addOrUpdate` permission.
- **FR-017**: System MUST show toast-style success and error notifications for all mutating operations (add question, edit question, toggle quiz, toggle question).
- **FR-018**: The Quiz Detail Page header MUST display the quiz title, description, scheduled date, total marks, duration, and quiz code as summary meta-data.
- **FR-019**: System MUST provide a "Back to Quizzes" navigation link in the page header.
- **FR-020**: When a question's `isActive` is false, its card MUST be rendered with reduced opacity and an "Inactive" badge displayed; all question content (text, choices, actions) MUST remain visible and readable.

### Key Entities

- **Quiz**: Full detail object containing title, description, scheduledDate, totalMarks, duration, isActive, quizCode, courseId, and a list of QuizQuestions.
- **QuizQuestion**: A question belonging to a quiz, with id, isActive, questionText, questionType (MultipleChoice | TrueFalse), isAllowableToLookDown, marks, and a list of QuestionChoices.
- **QuestionChoice**: A single choice option for a question, with id, choiceText, and isCorrect flag.
- **QuestionFormPayload**: The data sent to create or update a question, including questionText, questionType (int), marks, correctAnswerIndex, isAllowableToLookDown, and an array of choice text strings.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Instructors can navigate from the quiz list to the quiz detail page and see all questions fully rendered in under 3 seconds on a standard connection.
- **SC-002**: Instructors can add a complete MultipleChoice question (with 4 choices and a correct answer selected) in under 2 minutes using the modal form.
- **SC-003**: 100% of operations (add, edit, toggle quiz, toggle question) provide immediate visual feedback (success toast or error toast) so the user always knows the outcome.
- **SC-004**: Correct answers are identifiable at a glance — any instructor should be able to spot the correct choice on a question card within 3 seconds without searching.
- **SC-005**: All action buttons (Add, Edit, Toggle) are hidden for users without the corresponding permission, verified across all 3 relevant permissions (`questions:add`, `questions:update`, `Quiz:addOrUpdate`).
- **SC-006**: The modal form gracefully handles switching between MultipleChoice and TrueFalse types, with the choice inputs automatically adjusting without any page reload.

---

## Assumptions

- Lumina standing assumptions (from Constitution v1.0.0) are in effect: Bootstrap 5, Angular Standalone Components, Core services for HTTP, Scope-Lock on feature files.
- The quiz detail page is navigated to from the existing quiz list view (quiz-view component) by clicking on a quiz card.
- The routing for the quiz detail page will follow the existing pattern: `/dashboard/courses/:courseId/quizzes/:quizId`.
- The `questions:read`, `questions:add`, and `questions:update` permission strings are already recognized by the existing `PermissionService`.
- The `Quiz:addOrUpdate` permission already exists and is used for the quiz-level toggle (consistent with the existing quiz list permissions).
- For MultipleChoice questions, the minimum number of choices is 2; there is no hard upper limit enforced by the UI in Cycle 1.
- The `marks` field on each question is stored on the question itself; the detail page header shows `totalMarks` as the sum defined at the quiz level, not recalculated from individual question marks.
- Navigating back uses a fixed Angular Router route to `/dashboard/courses/:courseId/quizzes`, not browser history, ensuring predictable navigation regardless of how the user arrived at the detail page.
- The absolute-path API routes for the Question Controller (`/Quiz/{quizId}`, `/ToggleStatus/QuizId/{quizId}/QuestionId{questionId}`, `/Update/QuizId/{quizId}`) will be called from a dedicated `QuestionService` that uses the environment base URL without the `/api` prefix for these specific endpoints.
- **Out of scope (Cycle 1)**: Drag-and-drop question reordering. Questions are rendered in the order returned by the API and no reorder endpoint will be called.
