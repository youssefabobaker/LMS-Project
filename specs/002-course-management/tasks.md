---
description: "Task list template for feature implementation"
---

# Tasks: Course Management

**Input**: Design documents from `/specs/002-course-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are excluded as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions (Lumina Angular Standalone)

- **Feature components**: `src/app/features/<feature-name>/`
- **Core services (API/business logic)**: `src/app/core/services/`
- **Model interfaces (TypeScript types)**: `src/app/models/`
- **Global styles / tokens**: `src/styles.css`
- **Component-scoped styles**: `src/app/features/<feature-name>/<component>.component.css`
- **Stitch design reference**: `stitch-designs/<feature-name>/`
- Do NOT create NgModule files; all components MUST be standalone

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize feature directory `src/app/features/course-management/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Create Course model and Enums (`Semester`, `AcademicLevel`, `AssessmentType`, `EnrolledUser`, `Assessment`) in `src/app/models/course.ts`
- [X] T003 [P] Initialize `CourseService` in `src/app/core/services/course.service.ts` with base URL and constructor injection

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Course List (Priority: P1) 🎯 MVP

**Goal**: Display courses in a Card-Based Layout following the Lumina design system, restricted by `Course:readAll`.

**Independent Test**: Can be fully tested by navigating to the Course Management page and verifying the courses are displayed in cards using Lumina branding.

### Implementation for User Story 1

- [X] T004 [US1] Implement `getCourses()` method in `src/app/core/services/course.service.ts`
- [X] T005 [P] [US1] Scaffold `CourseManagementComponent` (`.ts`, `.html`, `.spec.ts`) in `src/app/features/course-management/`
- [X] T006 [P] [US1] Apply CSS grid and card styles in `src/app/features/course-management/course-management.component.css` following `stitch-designs/course-management/`
- [X] T007 [US1] Implement initialization logic and `PermissionService` checks in `src/app/features/course-management/course-management.component.ts`
- [X] T008 [US1] Build the HTML template for the course cards and placeholders in `src/app/features/course-management/course-management.component.html`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Create New Course (Priority: P2)

**Goal**: Create a new course using a collapsible form with image upload.

**Independent Test**: Can be fully tested by clicking "Create Course", filling out the form including a file upload, and verifying the new course card appears.

### Implementation for User Story 2

- [X] T009 [P] [US2] Implement `addCourse(formData: FormData)` method in `src/app/core/services/course.service.ts`
- [X] T010 [US2] Build the Reactive Form structure and validation in `src/app/features/course-management/course-management.component.ts`
- [X] T011 [US2] Implement the `multipart/form-data` logic to append file inputs in `course-management.component.ts`
- [X] T012 [US2] Add the HTML form inside a collapsible top section in `src/app/features/course-management/course-management.component.html`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Edit Existing Course (Priority: P3)

**Goal**: Edit an existing course's details and image, sending existing URL if no image is updated.

**Independent Test**: Can be fully tested by selecting an existing course, updating its description and image, and confirming the changes persist.

### Implementation for User Story 3

- [X] T013 [P] [US3] Implement `updateCourse(id: number, formData: FormData)` method in `src/app/core/services/course.service.ts`
- [X] T014 [US3] Add the 'Edit' button and form-population logic to `src/app/features/course-management/course-management.component.ts`
- [X] T015 [US3] Implement payload logic to omit `ImageFile` and pass `imageUrl` if no new image is provided in `course-management.component.ts`
- [X] T016 [US3] Bind 'Edit' actions in `src/app/features/course-management/course-management.component.html`

**Checkpoint**: All user stories up to P3 should now be independently functional

---

## Phase 6: User Story 4 - Toggle Course Status (Priority: P4)

**Goal**: Toggle a course's published status with a single click on a badge.

**Independent Test**: Can be fully tested by clicking the status badge/button on a course card and verifying its state changes.

### Implementation for User Story 4

- [X] T017 [P] [US4] Implement `toggleStatus(id: number)` method in `src/app/core/services/course.service.ts`
- [X] T018 [US4] Implement the click handler and state update logic in `src/app/features/course-management/course-management.component.ts`
- [X] T019 [US4] Update the badge HTML to trigger toggle on click in `src/app/features/course-management/course-management.component.html`

---

## Phase 7: User Story 5 - Delete Course (Priority: P5)

**Goal**: Delete a course with SweetAlert2 confirmation.

**Independent Test**: Can be fully tested by deleting a course and confirming it is removed from the view.

### Implementation for User Story 5

- [X] T020 [P] [US5] Implement `deleteCourse(id: number)` method in `src/app/core/services/course.service.ts`
- [X] T021 [US5] Implement the `removeCourse` logic using `SweetAlert2` in `src/app/features/course-management/course-management.component.ts`
- [X] T022 [US5] Add the 'Delete' button to the card in `src/app/features/course-management/course-management.component.html`

---

## Phase 8: User Story 6 - Manage Course Instructors (Priority: P6)

**Goal**: Assign or unassign instructors directly from a course card without editing the entire course.

**Independent Test**: Can be tested by clicking an assign/unassign button on a course card and verifying the instructor list updates.

### Implementation for User Story 6

- [X] T023 [P] [US6] Implement `enrollInstructor`, `unenrollInstructor`, and `getEnrolledUsers` methods in `src/app/core/services/course.service.ts`
- [X] T024 [US6] Implement instructor enrollment logic and list state in `src/app/features/course-management/course-management.component.ts`
- [X] T025 [US6] Add instructor UI elements to the course card in `src/app/features/course-management/course-management.component.html`

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and system integration

- [X] T026 Add the Course Management route to `src/app/app.routes.ts` protected by `PermissionGuard`
- [X] T027 Add sidebar navigation link in `src/app/features/dashboard/dashboard.component.html`
- [X] T028 Validate strict isolation: no unintended modifications outside `course-management`
- [X] T029 Run the Quickstart Validation guide

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P6)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - integrates with US1's list view
- **User Story 3 (P3)**: Can start after US2
- **User Story 4 (P4)**: Can start after US1
- **User Story 5 (P5)**: Can start after US1
- **User Story 6 (P6)**: Can start after US1

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel
- Adding methods to the service marked [P] can run in parallel before component integration
- CSS styling marked [P] can be developed alongside TS logic

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. Complete Route Registration in Phase 9
5. **STOP and VALIDATE**: Verify courses list renders

### Incremental Delivery

1. Foundation ready.
2. Add US1 → Test List → MVP!
3. Add US2/US3 → Test Forms.
4. Add US4/US5 → Test Actions.
5. Add US6 → Test Assignment.
