# Implementation Tasks: Assignments View

**Branch**: `009-assignments-view` | **Date**: 2026-05-13

## Strategy
- **MVP**: Phase 3 (US1) is the MVP, displaying the core assignment list and toggling tabs correctly.
- **Incremental**: Followed by expanding cards for Attachments (US2) and implementing Management Actions and Permissions (US3).

## Phase 1: Setup
- [x] T001 Create `assignment.model.ts` under `src/app/core/models/` and add interfaces `AssignmentResponseDto` and `AssignmentAttachmentDto`.
- [x] T002 Generate standalone component `AssignmentsViewComponent` under `src/app/features/assignments/assignments-view/`.
- [x] T003 Generate service `AssignmentService` under `src/app/core/services/`.

## Phase 2: Foundational
- [x] T004 Implement `AssignmentService` methods `getAssignmentsByCourseId` and `deleteAssignment` in `src/app/core/services/assignment.service.ts` using `HttpClient`.
- [x] T005 [P] Update `content-view.component.ts` in `src/app/features/content/content-view/` to include an `activeTab` property and import `AssignmentsViewComponent`.
- [x] T006 Update `content-view.component.html` in `src/app/features/content/content-view/` to bind the Content/Assignments tabs to toggle `activeTab` and conditionally render `<app-assignments-view>` passing `courseId`.

## Phase 3: User Story 1 - View Course Assignments
**Goal**: Display a list of assignments for a course when the "Assignments" tab is active.
**Independent Test**: Click the "Assignments" tab and verify the assignment cards display Title, Marks, and Due Date without expanding.

- [x] T007 [US1] Inject `AssignmentService` and implement `ngOnInit` in `src/app/features/assignments/assignments-view/assignments-view.component.ts` to fetch assignments.
- [x] T008 [US1] Create internal component state variables `isLoading`, `loadError`, and `assignmentsList` in `assignments-view.component.ts`.
- [x] T009 [US1] Implement the HTML template for `assignments-view.component.html` using the list/card structure from `content-view`, displaying `Title`, `Total Marks`, and `Due Date` (Description hidden initially).
- [x] T010 [US1] Add the logic in `assignments-view.component.html` to highlight the Due Date in Red/Danger color if the deadline is within 48 hours.
- [x] T011 [US1] [P] Copy and adapt necessary styles to `assignments-view.component.css` to match the visual blueprint and the existing content list layout.

## Phase 4: User Story 2 - View Assignment Attachments
**Goal**: Expand an assignment card to view the description and download attachments.
**Independent Test**: Click an assignment card to expand it, verify the description appears, and clicking an attachment opens a new tab.

- [x] T012 [US2] Add a `Set<number>` for `expandedIds` and a `toggleExpand(id)` method in `assignments-view.component.ts`.
- [x] T013 [US2] Update `assignments-view.component.html` to bind the chevron icon and card click to `toggleExpand(item.id)`.
- [x] T014 [US2] Update `assignments-view.component.html` to conditionally render the full Description and the `assignmentAttachments` list when `expandedIds` contains the assignment ID.
- [x] T015 [US2] Add click handler `window.open(fileUrl, '_blank')` to attachments in `assignments-view.component.html` and apply appropriate file icons (`bi-file-earmark-pdf` / `bi-file-earmark-play`).

## Phase 5: User Story 3 - Manage Assignments
**Goal**: Ensure authorized users see the Add New Assignment button and the delete icon, and can delete an assignment.
**Independent Test**: Verify buttons are hidden for unauthorized users. Verify clicking delete triggers confirmation and calls the API.

- [x] T016 [US3] Inject authorization service into `assignments-view.component.ts` and set `canAddOrUpdate` and `canDelete` based on permissions `Ass:addOrUpdate` and `Ass:delete`.
- [x] T017 [US3] Update `content-view.component.html` CTA button to dynamically say "Add New Content" or "Add New Assignment" depending on the `activeTab` value.
- [x] T018 [US3] Implement `deleteAssignment(id)` logic in `assignments-view.component.ts` with a browser `confirm()` prompt, calling the service upon confirmation.
- [x] T019 [US3] Conditionally display the "Delete" icon in `assignments-view.component.html` based on `canDelete`.

## Phase 6: Polish
- [x] T020 Review and standardize empty states and loading spinners in `assignments-view.component.html`.
- [x] T021 Validate UI alignment against `content-view` side-by-side to ensure seamless transition between tabs.

## Dependencies
- Phase 1 & 2 must complete before Phase 3.
- US1 (Phase 3) must complete before US2 and US3.
