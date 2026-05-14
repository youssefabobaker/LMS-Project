# Implementation Plan: Add Assignment Modal

**Branch**: `010-assignment-add` | **Date**: 2026-05-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/010-assignment-add/spec.md`

---

## Summary

Implement a Bootstrap modal-based **Add Assignment** form for authorized instructors, following the exact sequential two-step API pattern established by `ContentAddComponent`:

1. **Step 1** — `POST /api/Assignment/course/{courseId}` with title, description, dueDate (ISO 8601), totalMarks.
2. **Step 2** — `POST /api/Assignment/{assignmentId}/attachments` with `multipart/form-data` (PDF/MP4 only, ≤ 500 MB each).

If Step 1 fails → modal stays open with inline error. If Step 2 fails → partial-success alert, modal closes, assignment (without attachments) is still added to the bottom of the list. Design is pixel-identical to the existing `content-add` modal.

---

## Technical Context

**Language/Version**: TypeScript (Angular 17+)
**Primary Dependencies**: Angular HttpClient, Bootstrap 5, SweetAlert2, Bootstrap Icons
**Storage**: N/A (no local persistence)
**Testing**: Manual browser testing (ng serve)
**Target Platform**: Web browser (same as rest of Lumina LMS)
**Project Type**: Web application (Angular SPA)
**Performance Goals**: Form submission completes in < 5 seconds under normal network conditions
**Constraints**: Sequential API calls; no parallel file + form submission
**Scale/Scope**: Single feature; ~4 files created, ~3 files modified

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Bootstrap-First Styling** — Styles copied verbatim from `content-add.component.css`; Lumina color tokens (`#41B3E3`, `#001A33`, `#002D5B`) used throughout; custom classes follow `.btn-lumina-*` / `.btn-*-modal` naming.
- [x] **II. Stitch Design Blueprint** — `ContentAddComponent` (`stitch-designs/content-add/`) serves as the authoritative visual and structural reference; confirmed by user instruction.
- [x] **III. Angular Standalone Architecture** — New `AssignmentAddComponent` created as a standalone component under `src/app/features/assignments/assignment-add/`; no NgModule introduced.
- [x] **IV. Separation of Concerns** — All API calls (`createOrUpdateAssignment`, `addAttachments`) delegated to `AssignmentService`; component contains only UI state and event wiring.
- [x] **V. Scope-Lock** — Only files in `assignments/` feature folder modified, plus minimal wiring additions to `AssignmentService` and `ContentViewComponent`'s `onAddContent()` tab branch.

---

## Project Structure

### Documentation (this feature)

```text
specs/010-assignment-add/
├── plan.md              ← This file
├── spec.md              ← Feature specification
├── research.md          ← Phase 0 decisions
├── data-model.md        ← Entity and state model
├── quickstart.md        ← Implementation reference
├── checklists/
│   └── requirements.md
└── tasks.md             ← Phase 2 output (created by /speckit-tasks)
```

### Source Code Layout

```text
src/app/features/assignments/
├── assignment-add/                    ← NEW
│   ├── assignment-add.component.ts
│   ├── assignment-add.component.html
│   └── assignment-add.component.css
└── assignments-view/                  ← MODIFIED
    ├── assignments-view.component.ts  (openAddModal, onAssignmentCreated, closeAddModal)
    ├── assignments-view.component.html (modal host div + import AssignmentAddComponent)
    └── assignments-view.component.css (no changes required)

src/app/core/services/
└── assignment.service.ts              ← MODIFIED (addAttachments method)

src/app/features/content/content-view/
└── content-view.component.ts          ← MODIFIED (@ViewChild + tab-aware onAddContent)
```

---

## Implementation Phases

### Phase A — Service Update
1. Add `addAttachments(assignmentId, files)` to `AssignmentService`.
   - Build `FormData`, append all files under key `attachmentFiles`.
   - POST to `/api/Assignment/{assignmentId}/attachments`.
   - Normalize response through `normalizeAssignment()`.

### Phase B — Create AssignmentAddComponent
1. Generate component files under `src/app/features/assignments/assignment-add/`.
2. **TypeScript**: Mirror `ContentAddComponent` — same inputs/outputs, same state properties, same two-step submit flow. Adapt for assignment-specific fields: `dueDate` (datetime-local), `totalMarks` (number). Convert `dueDate` to ISO 8601 before API call.
3. **HTML**: Mirror `content-add.component.html` exactly. Replace Content-specific field (body/textarea) with three new fields: Due Date (`datetime-local`) and Total Marks (`number`). Keep upload zone, file list, progress bar, and footer unchanged.
4. **CSS**: Copy `content-add.component.css` verbatim; rename `.content-add-header` → `.assignment-add-header`.

### Phase C — Wire Modal into AssignmentsViewComponent
1. Import `AssignmentAddComponent` into `AssignmentsViewComponent` imports array.
2. Add `openAddModal()`, `onAssignmentCreated()`, `closeAddModal()` methods.
3. Add Bootstrap modal host `<div id="assignmentAddModal">` to the component template.
4. When `onAssignmentCreated()` fires: `this.assignmentsList = [...this.assignmentsList, newItem]` (append to end per Clarification A).

### Phase D — Wire ContentViewComponent Tab CTA
1. Add `@ViewChild(AssignmentsViewComponent) assignmentsView?: AssignmentsViewComponent`.
2. Update `onAddContent()` to branch on `activeTab`:
   - `'content'` → existing content modal logic (unchanged).
   - `'assignments'` → `this.assignmentsView?.openAddModal()`.

---

## Error Handling Matrix

| Scenario | Behavior |
|---|---|
| Validation fails (empty/invalid field) | Mark fields touched; show inline required messages; block submit |
| Invalid file type selected | Reject silently; SweetAlert2 warning toast |
| File > 500 MB selected | Reject; SweetAlert2 warning toast |
| Step 1 (create) fails | Show error in modal alert; modal stays open; isSubmitting = false |
| Step 2 (upload) fails | retryMode = true; partial-success error shown; modal closes; Step 1 item added to list |
| Double-click Save | isSubmitting flag disables button after first click; second click ignored |

---

## Complexity Tracking

No Constitution violations. No complexity overrides required.
