# Research: Add Assignment Modal
**Feature**: `010-assignment-add`
**Date**: 2026-05-14

---

## Decision 1: Component Pattern — "Add" Modal Component

**Decision**: Create a standalone `AssignmentAddComponent` mirroring `ContentAddComponent` exactly in structure, lifecycle, and event interface.

**Rationale**: The user explicitly requested the same design and logic pattern. `ContentAddComponent` is a clean, already-proven implementation of the sequential two-step API pattern. Reusing it as a template eliminates design drift and reduces risk.

**Alternatives considered**:
- Inline form inside `AssignmentsViewComponent` — rejected because the content feature already established the modal-child pattern; consistency is higher value than co-location.
- Shared/generic "AddItemModal" abstraction — rejected as premature generalization; no third consumer exists yet.

---

## Decision 2: Sequential API Orchestration Pattern

**Decision**: Use nested `.subscribe()` callbacks (Step 1 → on success → Step 2), identical to `ContentAddComponent.submit()` and `addAttachmentsStep()`.

**Rationale**: Already proven, readable, and directly supported by existing `AssignmentService`. RxJS `concatMap` would be more idiomatic but adds unnecessary complexity for a two-step sequence.

**Alternatives considered**:
- `switchMap` / `concatMap` pipeline — more idiomatic RxJS but introduces complexity with no benefit here.
- `Promise.then()` chain — inconsistent with the rest of the Angular codebase which uses `subscribe`.

---

## Decision 3: Partial-Success Handling

**Decision**: If Step 1 (create) succeeds but Step 2 (upload) fails, set `retryMode = true`, show an inline error alert inside the modal, close the modal, and emit the created assignment (without attachments) to the parent list.

**Rationale**: Matches FR-013 and the user's explicit instruction: "notify the user that the assignment was created but files weren't uploaded." This mirrors the existing retry pattern in `ContentAddComponent`.

---

## Decision 4: New Service Method — `addAttachments`

**Decision**: Add `addAttachments(assignmentId: number, files: File[]): Observable<AssignmentResponseDto>` to `AssignmentService`.

**Rationale**: The endpoint `POST /api/Assignment/{assignmentId}/attachments` with `multipart/form-data` is already documented in `Assignment.md`. The service already has `createOrUpdateAssignment`; this adds the missing upload step. The response is normalized via the existing `normalizeAssignment` method.

---

## Decision 5: Modal Wiring Location

**Decision**: The Bootstrap modal host `<div class="modal fade" id="assignmentAddModal">` is placed inside `AssignmentsViewComponent` (not `ContentViewComponent`), and the `+Add New Assignment` button in `ContentViewComponent` uses `@ViewChild` or a direct DOM call to open it.

**Rationale**: Keeps `AssignmentsViewComponent` self-contained (own modal, own list management), which mirrors how `ContentAddModal` is hosted inside `content-view.component.html`. The `onAddContent()` pattern (Bootstrap JS `Modal.getOrCreateInstance`) is reused unchanged.

**Implication**: `ContentViewComponent`'s `onAddContent()` already handles the tab-based CTA button. The `Add New Assignment` path needs to call a method on `AssignmentsViewComponent`. The cleanest approach: expose a public `openAddModal()` method on `AssignmentsViewComponent` and call it from a `@ViewChild` reference in `ContentViewComponent`.

---

## Decision 6: Model Location

**Decision**: The `AssignmentResponseDto` and `AssignmentAttachmentDto` interfaces stay in `src/app/models/assignment.model.ts` (the existing location), consistent with how `Content` and `StagedFile` live in `src/app/models/content.ts`. A new `StagedFile`-equivalent interface is NOT needed — the existing `StagedFile` from `content.ts` can be reused by importing it.

**Rationale**: The project has both `src/app/models/` (feature models) and `src/app/core/models/` (currently empty). The assignment and content models already live in `src/app/models/`. Staying consistent avoids unnecessary churn.

---

## Decision 7: Due Date Input Type

**Decision**: Use `<input type="datetime-local">` for the Due Date field.

**Rationale**: Provides a native browser date+time picker, requires no additional library, and produces an ISO 8601-compatible string that can be directly passed to `new Date(value).toISOString()` before sending to the API. Matches FR-010.

---

## Decision 8: File Validation

**Decision**: Validate file extension (`.pdf` / `.mp4`) using `file.type` checks (`application/pdf`, `video/mp4`) identical to `ContentAddComponent.onFilesSelected()`. Per-file size ≤ 500 MB checked individually (same pattern).

**Rationale**: Directly reuses the proven pattern. No combined-total check is implemented because the backend enforces the 500 MB request limit at the server level; per-file checks on the frontend provide sufficient UX feedback without the complexity of a running total.
