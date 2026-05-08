---
description: "Task list for 008-content-add: Add Content Modal"
---

# Tasks: Add Content Modal (008-content-add)

**Input**: Design documents from `specs/008-content-add/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions (Lumina Angular Standalone)

- **Feature components**: `src/app/features/content/content-add/`
- **Parent component**: `src/app/features/content/content-view/`
- **Model interfaces**: `src/app/models/content.ts`
- **Core services**: `src/app/core/services/content.service.ts` *(no changes needed this cycle)*
- **Stitch reference**: `stitch-designs/content-add/`
- Do NOT create NgModule files; all components MUST be standalone

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the new component scaffold and extend the shared data model.

- [x] T001 Generate the `ContentAddComponent` standalone scaffold — create `src/app/features/content/content-add/content-add.component.ts`, `content-add.component.html`, and `content-add.component.css` (empty files, standalone: true, selector: `app-content-add`)
- [x] T002 Add the `StagedFile` interface to `src/app/models/content.ts` — fields: `file: File`, `name: string`, `size: number`, `mimeType: string`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story implementation begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Import `ContentAddComponent` into `ContentViewComponent` — add to the `imports` array in `src/app/features/content/content-view/content-view.component.ts` and declare the Bootstrap modal host div (`id="contentAddModal"`) near the end of `src/app/features/content/content-view/content-view.component.html`, following the same `modal fade / modal-dialog / modal-content` pattern used by `courseModal`
- [x] T004 Wire the `onAddContent()` stub in `src/app/features/content/content-view/content-view.component.ts` — replace the empty stub with Bootstrap JS `Modal.getOrCreateInstance(document.getElementById('contentAddModal')).show()`; add a `private contentAddModalInstance: any = null` property and a `closeContentModal()` helper that calls `.hide()`
- [x] T005 Bind `(contentCreated)` and `(modalDismissed)` event handlers in `content-view.component.html` on `<app-content-add>`: `(contentCreated)="onContentCreated($event)"` and `(modalDismissed)="closeContentModal()"`; add the `onContentCreated(item: Content): void` method to `content-view.component.ts` — it prepends `item` to `this.contentList` then calls `this.closeContentModal()`

**Checkpoint**: Foundation ready — the modal shell is wired and `app-content-add` is importable by the parent. User story work can begin.

---

## Phase 3: User Story 1 — Create Content with Attachments (Priority: P1) 🎯 MVP

**Goal**: A user with `Content:add` permission can fill in title + body, select PDF/MP4 files, click "Save Content", and see the new card appear in the list with a success toast — without a page reload.

**Independent Test**: Navigate to any course content page → click "Add New Content" → fill title and body → select a `.pdf` file → click "Save Content" → verify progress bar appears, modal closes, success toast fires, and the new content card appears at the top of the list with the attachment row visible- [x] T006 [US1] Implement `ContentAddComponent` TypeScript class in `src/app/features/content/content-add/content-add.component.ts`:
  - Declare `@Input() courseId: number`
  - Declare `@Output() contentCreated = new EventEmitter<Content>()`
  - Declare `@Output() modalDismissed = new EventEmitter<void>()`
  - Declare state: `title = ''`, `body = ''`, `stagedFiles: StagedFile[] = []`, `isSubmitting = false`, `submitError = ''`, `retryMode = false`, `createdContentId: number | null = null`
  - Implement `submit()`: validate title/body non-empty → set `isSubmitting = true` → call `ContentService.createContent(courseId, title, body)` → on success store `createdContentId` → if `stagedFiles.length > 0` call Step 2 else emit `contentCreated(step1Response)` and call `resetForm()`
  - Implement `addAttachmentsStep(contentId)`: calls `ContentService.addAttachments(contentId, files[])` → on success emit `contentCreated(step2Response)` and call `resetForm()`; on error set `retryMode = true`, `submitError`, `isSubmitting = false`
  - Implement `resetForm()`: clears all state fields back to defaults
  - Implement `cancel()`: calls `resetForm()` then emits `modalDismissed`
  - Inject `ContentService` via constructor

- [x] T007 [US1] Build the modal HTML template in `src/app/features/content/content-add/content-add.component.html` matching `stitch-designs/content-add/screen.png` exactly

- [x] T008 [US1] Style the `ContentAddComponent` in `src/app/features/content/content-add/content-add.component.css`Import Work Sans / Inter fonts (already available globally)

**Checkpoint**: US1 is fully functional. User can add content with attachments end-to-end.

---

## Phase 4: User Story 2 — File Validation & Selection Preview (Priority: P2)

**Goal**: Files are filtered to PDF/MP4 only; each selected file is displayed with icon, name, and size; unsupported types are silently rejected; files can be removed from the list before submission.

**Independent Test**: Open the modal → attempt to select a `.docx` file → verify it does not appear → select a `.pdf` → verify red PDF icon, filename, and size are shown with an × button → click × → verify file is removed.

### Implementation for User Story 2

- [x] T009 [P] [US2] Implement file selection helpers in `src/app/features/content/content-add/content-add.component.ts`:
  - `onFilesSelected`, `removeFile`, `formatSize`, `getFileIcon` — all implemented

- [x] T010 [P] [US2] Wire the hidden file input in `content-add.component.html`:
  - `#fileInput` template ref, `(change)="onFilesSelected($event)"`, `(click)="fileInput.click()"` on upload zone — all wired

**Checkpoint**: US2 complete — file validation, preview list, and remove work independently of the submission flow.

---

## Phase 5: User Story 3 — Error Handling & Loading State (Priority: P3)

**Goal**: Progress bar visible during submission; button disabled; Step 1 failure shows inline error; Step 2 failure shows "Retry Upload" without repeating Step 1; Cancel resets all state.

**Independent Test**: Submit the form with a simulated Step 1 failure → verify error alert appears, modal stays open, no Step 2 is called. Then simulate Step 2 failure after Step 1 → verify "Retry Upload" button appears and clicking it re-calls Step 2 with the same content ID.

### Implementation for User Story 3

- [x] T011 [US3] Implement the retry pathway in `src/app/features/content/content-add/content-add.component.ts` — `retryUpload()`, Step 1 error handling, `cancel()` full reset — all implemented

- [x] T012 [US3] All loading-state bindings confirmed in `content-add.component.html` — `[disabled]`, `*ngIf="isSubmitting"`, `*ngIf="submitError"`, `*ngIf="retryMode"` all wired

**Checkpoint**: All three user stories complete. The full Add Content Modal is functional end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integration checks, accessibility, and success-path toast.

- [x] T013 SweetAlert2 success toast implemented in `content-add.component.ts` inside `emitSuccess()` — fires on both Step 1-only and Step 1+2 success paths
- [x] T014 [P] Accessibility pass complete — `aria-labelledby`, `id` on all fields, `[attr.aria-label]` on remove buttons, `role="button"` + `tabindex="0"` + `(keydown.enter)` on upload zone — all present in template
- [ ] T015 Manual smoke test — run through acceptance tests T001–T015 as defined in `specs/008-content-add/plan.md` against the running `ng serve` dev server; mark each passing test with ✅ in `plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user story phases
- **Phase 3 (US1)**: Depends on Phase 2 — core submit flow
- **Phase 4 (US2)**: Depends on Phase 2 (modal shell) — file helpers are independently testable once the upload zone exists (wired in US1 template T007)
- **Phase 5 (US3)**: Depends on Phase 3 (submit flow must exist before retry path)
- **Phase 6 (Polish)**: Depends on Phases 3–5

### User Story Dependencies

- **US1 (P1)**: Requires Phases 1 + 2 only
- **US2 (P2)**: Requires Phase 2 (upload zone HTML from T007); T009 and T010 can run in parallel with US1 implementation after T007 is done
- **US3 (P3)**: Requires Phase 3 (submit flow) — retry is an extension of the submit path

### Within Each Phase

- T001 and T002 (Phase 1): parallel — different files
- T003, T004, T005 (Phase 2): sequential — each builds on the previous
- T006 → T007 → T008 (Phase 3): sequential — TS logic → HTML template → CSS
- T009 and T010 (Phase 4): parallel — TS methods and template wiring are independent
- T011 → T012 (Phase 5): sequential — retry logic before template bindings
- T013, T014 (Phase 6): parallel — different concerns

---

## Parallel Execution Examples

### Phase 1 (can run in parallel):
```
T001 — Create content-add component scaffold (new files)
T002 — Add StagedFile interface to content.ts (different file)
```

### Phase 4 US2 (can run in parallel after T007):
```
T009 — Implement onFilesSelected, removeFile, formatSize, getFileIcon in TS
T010 — Wire file input events in HTML template
```

### Phase 6 Polish (can run in parallel):
```
T013 — Add SweetAlert2 success toast
T014 — Accessibility pass on template
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete **Phase 1**: scaffold + model extension
2. Complete **Phase 2**: parent wiring (modal host + event handlers)
3. Complete **Phase 3**: full US1 implementation (TS + HTML + CSS)
4. **STOP and VALIDATE**: run T001–T010 from the smoke test checklist manually
5. Demo end-to-end: add content with attachment, confirm card appears in list

### Incremental Delivery

1. Phase 1 + 2 → Modal shell wired (no component logic yet)
2. Phase 3 (US1) → Full create + upload flow works ✅ **(MVP)**
3. Phase 4 (US2) → File picker validation and preview work ✅
4. Phase 5 (US3) → Error states and retry path work ✅
5. Phase 6 → Toast, accessibility, smoke test ✅

---

## Notes

- `[P]` tasks touch different files and have no incomplete dependencies — safe to parallelize
- `[Story]` label maps every implementation task to a verifiable user story
- `ContentService.createContent()` and `ContentService.addAttachments()` are **already implemented** — no service file changes required
- `src/app/models/content.ts` needs only the `StagedFile` addition (T002) — no other model changes
- The only existing files modified in this cycle are: `content-view.component.ts` and `content-view.component.html`
- All new files are created inside `src/app/features/content/content-add/`
