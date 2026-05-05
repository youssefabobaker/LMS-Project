# Feature Specification: Course Assessment Modal

**Feature Branch**: `005-course-assessment-modal`  
**Created**: 2026-05-04  
**Status**: Draft  
**Input**: User description: "Implement the technical logic for the Course Assessment Modal based on the design in stitch-designs/course-assessment/."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Course Assessments (Priority: P1)

An administrator or instructor opens the Assessment modal for a specific course. The modal immediately loads the current list of assessments configured for that course (e.g., Midterm 30%, Final 50%) alongside the total weight already consumed. They can review all existing assessments at a glance.

**Why this priority**: Viewing is the foundation of all other actions. Without the ability to load and display assessments, no add or edit flow can be verified.

**Independent Test**: Can be fully tested by opening the Assessment modal for any course and confirming the assessment list matches the backend data. Delivers read-only visibility into course grading structure.

**Acceptance Scenarios**:

1. **Given** a course exists with assessments, **When** the Assessment modal is opened, **Then** all current assessments for that course are displayed with their type, weight, mandatory status, and hours.
2. **Given** a course has no assessments, **When** the Assessment modal is opened, **Then** an empty state message is shown and the total weight reads 0%.
3. **Given** the user does not have the `Course:read` or `Course:readAll` permission, **When** they navigate to a course, **Then** the Assessments button is not visible.

---

### User Story 2 - Add a New Assessment (Priority: P2)

An authorized user opens the Assessment modal for a course. A clearly labelled "Add Assessment" button is visible above the assessments list. Clicking it reveals a collapsible form above the list. The user selects a type (from the filtered list of unused types), sets a percentage weight, toggles whether it is mandatory, and specifies the hours allocated. The system enforces that the cumulative weight of all assessments does not exceed 100% before saving.

**Why this priority**: Adding assessments is the primary write operation and directly impacts the course grading configuration.

**Independent Test**: Can be tested independently by adding a new assessment to a course that has no existing assessments, confirming the entry appears in the list immediately after save without a page reload.

**Acceptance Scenarios**:

1. **Given** the modal is open and existing total weight is 60%, **When** the user adds an assessment with 30% weight, **Then** the new assessment appears in the list and the total weight shows 90%.
2. **Given** the modal is open and existing total weight is 80%, **When** the user tries to add an assessment with 30% weight (total would exceed 100%), **Then** the save button is disabled or an inline error is shown before submission.
3. **Given** the user submits a new assessment, **When** the save is successful, **Then** the modal list updates in-place without closing or refreshing the entire page.
4. **Given** the user does not have the `Course:add` permission, **When** the modal opens, **Then** the "Add Assessment" action is not available.

---

### User Story 3 - Edit an Existing Assessment (Priority: P3)

An authorized user clicks the Edit action on an existing assessment row inside the Assessment modal. That row expands in-place into an editable form, pre-filled with the current values (weight, mandatory toggle, hours). The assessment type is shown but is not editable (it is the identity key). The user modifies the desired fields and saves. The total weight guard still applies: the system prevents saving if the updated weight causes the total to exceed 100% (the old weight of the row being edited is excluded from the running total).

**Why this priority**: Edit is dependent on the view (P1) and follows the add flow (P2). It is a critical completeness requirement but builds on prior stories.

**Independent Test**: Can be tested independently by editing an assessment on a course that already has assessments, changing its weight, and confirming the list reflects the new value immediately.

**Acceptance Scenarios**:

1. **Given** an assessment exists with 40% weight and other assessments total 50%, **When** the user edits it to 50%, **Then** the save is allowed (total = 100%) and the list updates in-place.
2. **Given** an assessment exists with 40% weight and other assessments total 50%, **When** the user edits it to 60%, **Then** the save is blocked because total would be 110%.
3. **Given** the edit is saved successfully, **When** the modal list refreshes, **Then** the updated values are reflected immediately without a page reload.
4. **Given** the user does not have the `Course:update` permission, **When** they view an existing assessment, **Then** no edit action is available for that entry.

---

### Edge Cases

- What happens when the assessment type list cannot be loaded (network error)? → The type dropdown shows an error state and the add form is disabled.
- What happens when the user edits an assessment's weight to the same value? → A save should still succeed; the guard calculation must handle the self-replacement correctly (exclude the current item from the total before adding the new value).
- What happens when a course already has assessments summing to exactly 100%? → Adding any new assessment is blocked; the UI shows the weight cap is reached.
- What happens when the modal is closed mid-edit? → Unsaved changes are discarded; the modal resets cleanly on next open.
- What happens if the backend returns assessments whose combined weight already exceeds 100% (data inconsistency)? → The list is displayed as-is with a warning that the total exceeds 100%, and both add and edit actions are disabled until a user corrects it.
- What happens if the user tries to add an assessment of a type that already exists for the course? → The "Add Assessment" type dropdown MUST hide (or disable) types that already have an entry for this course, preventing duplicate type entries.
- What happens if the POST or PUT request fails due to a server or network error? → An inline error notification is shown; the form remains open with the user's entered data intact so they can retry without re-entering values.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Assessment modal MUST load and display all existing assessments for the selected course when opened.
- **FR-002**: The Assessment modal MUST fetch and populate the assessment type dropdown from the available type list when opened.
- **FR-003**: The system MUST calculate and display the total percentage weight of all current assessments in the modal.
- **FR-004**: The system MUST prevent saving a new or updated assessment if the resulting total weight across all assessments for the course would exceed 100%.
- **FR-005**: When an assessment is successfully added, the modal list MUST update in-place to reflect the new entry without requiring a full page reload.
- **FR-006**: When an assessment is successfully updated, the modal list MUST update in-place to reflect the changed values without requiring a full page reload.
- **FR-007**: The "Add Assessment" action MUST only be visible and accessible to users with the `Course:add` permission.
- **FR-008**: The "Edit Assessment" action MUST only be visible and accessible to users with the `Course:update` permission.
- **FR-009**: The Assessments entry point on the course card MUST only be visible to users with the `Course:read` or `Course:readAll` permission.
- **FR-010**: The modal MUST receive the course identifier and course name as inputs from the parent course list view.
- **FR-011**: The total weight guard for an edit operation MUST exclude the assessment being edited (identified by its type code) from the current total before evaluating whether the new weight fits within the 100% cap.
- **FR-012**: Although the underlying data channel accepts multiple assessments per request, the UI MUST allow adding or editing exactly one assessment at a time and wrap it in the required format for transmission.
- **FR-013**: Each course may have at most one assessment per assessment type. The Add Assessment form MUST only offer types not already present in the course's current assessment list.
- **FR-014**: When the user triggers an edit action on an assessment row, that row MUST expand inline into an editable form pre-filled with the current values. The assessment type field MUST be displayed but non-editable during an edit (it cannot be changed). Only one row may be in edit mode at a time.
- **FR-015**: If a save operation (add or edit) fails due to a server or network error, the system MUST display an inline error notification. The form MUST remain open with the user's entered data intact so they can retry without re-entering values.
- **FR-016**: When opening the Add Assessment form, if exactly one assessment type remains unused for the course, the type dropdown MUST auto-select that type. If more than one type is available, the dropdown starts with no pre-selection.
- **FR-017**: The Add Assessment form MUST be hidden by default. It MUST be revealed by clicking a dedicated "Add Assessment" button, which expands the form above the assessments list. After a successful save or a user cancellation, the form MUST collapse back to its hidden state.

### Key Entities

- **Assessment**: Represents a graded component of a course. Key attributes: assessment type code (integer, unique per course — acts as the identity key), percentage weight (decimal), mandatory flag (boolean), allocated hours (integer). No separate numeric ID field exists; the type code is the unique identifier for a given course's assessment.
- **AssessmentType**: A named category (e.g., Final Exam, Quiz, Midterm) fetched from the system and used to populate type selection. Identified by an integer code. Each type may appear at most once per course.
- **CourseAssessmentSummary**: The aggregate state of all assessments for a given course, including the list of individual assessments and the computed total weight.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The assessment list and type dropdown are both visible within 2 seconds of opening the modal under normal network conditions.
- **SC-002**: 100% of save attempts that would push the total course weight above 100% are blocked before the data is transmitted, with a clear inline message explaining why.
- **SC-003**: After a successful add or edit, the updated assessment list is visible to the user within 1 second without any page navigation or full reload.
- **SC-004**: Users without the appropriate permissions never see actions they are not allowed to perform (zero unauthorized action exposures).
- **SC-005**: The weight guard correctly handles the self-replacement case (edit): 100% of edit operations correctly subtract the old weight before evaluating the new total.

## Assumptions

- Lumina standing assumptions (from Constitution v1.0.0) always apply: Bootstrap 5, Angular Standalone Components, Core services for HTTP, Stitch design folder as visual source of truth, Scope-Lock in effect.
- The Stitch design at `stitch-designs/course-assessment/` is the visual reference and is already available.
- The `courseId` and `courseName` are already available in the parent `CourseViewComponent` at the time the Assessment modal is triggered.
- Assessment types are relatively static (change infrequently) and can be loaded once per modal open without caching concerns.
- The permission keys `Course:add`, `Course:update`, `Course:read`, and `Course:readAll` are already defined in the system's permission model and are accessible via the existing authentication context.
- Deleting an assessment is out of scope for this feature cycle.
- Bulk add (adding more than one assessment in a single modal session) is out of scope; one assessment is added or edited per action.
- Mobile-specific layout optimization is out of scope; the modal follows the existing responsive Bootstrap grid.

## Clarifications

### Session 2026-05-04

- Q: How is an individual assessment uniquely identified — does each assessment have its own backend ID, or is the assessment type itself the unique key? → A: The assessment type (integer code) is the unique key; only one assessment per type is allowed per course.
- Q: When the user clicks Edit on an assessment row, how does the edit form appear? → A: Inline row editing — the selected row expands in-place into an editable form.
- Q: If a save attempt fails due to a server or network error, what should the user see? → A: Show an inline error notification; keep the form open with the user's data intact for retry.
- Q: When the Add Assessment form opens, should the type dropdown auto-select if only one type remains unused? → A: Yes — auto-select when exactly one unused type remains; otherwise start with no pre-selection.
- Q: Where does the Add Assessment form appear within the modal? → A: Hidden by default; clicking the "Add Assessment" button reveals a collapsible form above the assessments list.
