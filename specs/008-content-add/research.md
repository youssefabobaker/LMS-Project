# Research: Add Content Modal (008-content-add)

**Date**: 2026-05-08  
**Phase**: 0 — Pre-Design Research  
**Status**: Complete — all decisions resolved

---

## Decision 1: File Type Filtering Strategy

**Decision**: Use a two-layer filter — `accept=".pdf,.mp4"` on the `<input type="file">` element as the first line of defense (OS-level picker filter), plus a JavaScript MIME-type check (`file.type === 'application/pdf' || file.type === 'video/mp4'`) when the user selects files. Files failing the MIME check are silently discarded without being added to the selected list.

**Rationale**: The `accept` attribute alone is not reliable across all browsers and can be bypassed. The secondary MIME check ensures correctness. Combined, they match the approach described in FR-003 with zero additional libraries.

**Alternatives considered**:
- Extension check only (`.pdf`, `.mp4` suffix) — rejected; MIME type is more authoritative.
- Third-party file-picker library — rejected; over-engineering for two file types.

---

## Decision 2: File Size Display Format

**Decision**: Implement a lightweight `formatFileSize(bytes: number): string` helper directly in the `ContentAddComponent`. Threshold: `< 1024` → `X B`; `< 1048576` → `X.X KB`; else `X.X MB`.

**Rationale**: No library is needed for a simple 3-tier formatter. This keeps the bundle lean and avoids a new dependency.

**Alternatives considered**:
- `filesize` npm package — rejected; unnecessary dependency for a one-liner utility.

---

## Decision 3: Bootstrap Modal API Usage

**Decision**: Use `bootstrap.Modal.getInstance(element)` or `new bootstrap.Modal(element)` called from `ContentViewComponent.onAddContent()` after getting the element via `document.getElementById('contentAddModal')`. This is identical to the `openModal()` pattern already used in `CourseViewComponent`.

**Rationale**: The project already has a working, tested modal pattern. Reusing it ensures consistency and avoids introducing `@ViewChild`-based modal controllers (which would require additional `AfterViewInit` lifecycle wiring).

**Alternatives considered**:
- `@ViewChild` reference to modal element — works but adds boilerplate; rejected in clarification Q2.
- Angular CDK Dialog — rejected; violates Bootstrap-first principle.

---

## Decision 4: Child → Parent Communication Pattern

**Decision**: `ContentAddComponent` will emit an `@Output() contentCreated = new EventEmitter<Content>()` when the full flow (Step 1 + optional Step 2) succeeds. `ContentViewComponent` listens via `(contentCreated)="onContentCreated($event)"` and prepends the received `Content` object to `this.contentList`.

**Rationale**: Matches the `(courseCreated)` / `(courseUpdated)` EventEmitter pattern already used by `CourseAddEditComponent`. Consistent, well-understood pattern in the codebase.

**Alternatives considered**:
- Shared service / BehaviorSubject — rejected; over-engineered for a single-parent relationship.

---

## Decision 5: Source of Truth for Prepend Card (Q3 Clarification)

**Decision**: When files are uploaded, emit the **Step 2 (`addAttachments`) response** as the `Content` object for prepending — it contains the complete `contentAttachments` array. When no files are selected (Step 2 is skipped), emit the **Step 1 (`createContent`) response** (which will have `contentAttachments: []`).

**Rationale**: Using the server-confirmed response guarantees the UI state exactly mirrors what was persisted. No client-side reconstruction or shape-guessing needed.

---

## Decision 6: Retry Step 2 After Partial Failure (Q1 Clarification)

**Decision**: After a Step 2 failure, store the `createdContentId` in component state. Show an inline error alert with a "Retry Upload" button that calls `addAttachments(createdContentId, selectedFiles)` directly — bypassing Step 1 entirely.

**Rationale**: Prevents duplicate content records (calling Step 1 again would create a second content item). Confirmed in clarification Q1.

---

## Decision 7: No New Service Changes Needed

**Decision**: `ContentService.createContent()` and `ContentService.addAttachments()` are already fully implemented (moved out of "Next Cycle Stubs"). No service-layer modifications are required.

**Rationale**: The stubs were written correctly in the content-view cycle. They can be used as-is.

---

## Decision 8: SweetAlert2 Toast for Success

**Decision**: Use the existing SweetAlert2 `toast: true, position: 'bottom-end'` pattern (already established in `ContentViewComponent`) for the success notification. No new notification library needed.

**Rationale**: Consistency — the whole content section already uses SweetAlert2 for all feedback messages.
