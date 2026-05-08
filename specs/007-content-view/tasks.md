---
description: "Task list for Course Content View (007)"
---

# Tasks: Course Content View

**Input**: Design documents from `specs/007-content-view/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/api-contracts.md ✅ · quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task description

## Path Conventions (Lumina Angular Standalone)

- **Feature components**: `src/app/features/content/content-view/`
- **Core services**: `src/app/core/services/`
- **Model interfaces**: `src/app/models/`
- **Global styles / tokens**: `src/styles.css`
- **Component-scoped styles**: `src/app/features/content/content-view/content-view.component.css`
- **Stitch design reference**: `stitch-designs/content-view/`
- Do NOT create NgModule files; all components MUST be standalone

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create all new files and wire the route so subsequent phases have a stable base to build on.

- [x] T001 Create the feature folder `src/app/features/content/content-view/` and scaffold three empty files: `content-view.component.ts`, `content-view.component.html`, `content-view.component.css`
- [x] T002 [P] Create `src/app/models/content.ts` — export `ContentAttachment` interface (`id: string`, `fileName: string`, `fileUrl: string`, `contentType: string`) and `Content` interface (`id: number`, `title: string`, `body: string`, `contentAttachments: ContentAttachment[]`)
- [x] T003 [P] Create `src/app/core/services/content.service.ts` — `@Injectable({ providedIn: 'root' })` with `baseUrl = 'https://localhost:7289/api/Content'`; import `HttpClient`, `Observable`, `map`, `Content`, `ContentAttachment`; declare but do not implement any methods yet
- [x] T004 Update `src/app/app.routes.ts` — add `import { ContentViewComponent }` at the top; inside the `dashboard` children array replace the stub `{ path: 'courses/:id/content', redirectTo: 'courses', pathMatch: 'full' }` with `{ path: 'courses/:courseId/content', component: ContentViewComponent, canActivate: [permissionGuard], data: { permission: 'Content:read' } }` (note: param name changes from `:id` to `:courseId`)

**Checkpoint**: Angular compiles with zero new errors — route exists, files exist, no logic yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the `ContentService` normalisers and all 7 API methods (5 for this cycle + 2 next-cycle stubs). This service is required by every subsequent user-story phase.

- [x] T005 In `src/app/core/services/content.service.ts` — implement private `normalizeAttachment(a: any): ContentAttachment` mapping `id`, `fileName`/`FileName`, `fileUrl`/`FileUrl`, `contentType`/`ContentType` with `?? ''` fallbacks
- [x] T006 [P] In `src/app/core/services/content.service.ts` — implement private `normalizeContent(u: any): Content` mapping `id`/`Id`, `title`/`Title ?? ''`, `body`/`Body ?? ''`, and `contentAttachments`/`ContentAttachments ?? []` piped through `normalizeAttachment`
- [x] T007 [P] In `src/app/core/services/content.service.ts` — implement `getContentByCourse(courseId: number): Observable<Content[]>` — `GET ${baseUrl}/course/${courseId}`, pipe through `map(list => list.map(u => this.normalizeContent(u)))`
- [x] T008 [P] In `src/app/core/services/content.service.ts` — implement `getContentById(contentId: number): Observable<Content>` — `GET ${baseUrl}/${contentId}`, pipe through `map(u => this.normalizeContent(u))`
- [x] T009 [P] In `src/app/core/services/content.service.ts` — implement `updateContent(contentId: number, title: string, body: string): Observable<any>` — `PUT ${baseUrl}/${contentId}` with body `{ title, body }` and `{ responseType: 'text' }`
- [x] T010 [P] In `src/app/core/services/content.service.ts` — implement `deleteContent(contentId: number): Observable<any>` — `DELETE ${baseUrl}/${contentId}` with `{ responseType: 'text' }`
- [x] T011 [P] In `src/app/core/services/content.service.ts` — implement `deleteAttachment(attachmentId: string): Observable<any>` — `DELETE ${baseUrl}/attachments/${attachmentId}` with `{ responseType: 'text' }`
- [x] T012 [P] In `src/app/core/services/content.service.ts` — add next-cycle stubs: `createContent(courseId: number, title: string, body: string): Observable<Content>` (POST `/api/Content/course/{courseId}` with `{ title, body }`) and `addAttachments(contentId: number, files: File[]): Observable<Content>` (POST `/api/Content/{contentId}/attachments` with `FormData` `attachmentFiles`)

**Checkpoint**: `npx tsc --noEmit` passes. Service has all 7 methods. No compilation errors.

---

## Phase 3: User Story 1 — View Course Content List (Priority: P1) 🎯 MVP

**Goal**: Any user with `Content:read` can open the course content page, see expandable content cards, click attachments to open them in a new tab, see a clear empty state or error state, and navigate back to the Courses Dashboard.

**Independent Test**: Navigate to `/dashboard/courses/1/content` as a student — the page loads the content list, cards are collapsed by default, clicking a card's toggle expands its attachment list, clicking an attachment opens a new tab, and the Back button returns to `/dashboard/courses`.

### Implementation for User Story 1

- [x] T013 [US1] In `src/app/features/content/content-view/content-view.component.ts` — declare `@Component({ selector: 'app-content-view', standalone: true, imports: [CommonModule, FormsModule], templateUrl: '...', styleUrls: ['...'] })`; declare all class properties: `courseId: number`, `contentList: Content[]`, `isLoading: boolean`, `loadError: string`, `expandedIds: Set<number>`, `editingIds: Set<number>`, `editFormData: Map<number, {title: string; body: string}>`, `canRead: boolean`, `canUpdate: boolean`, `canDelete: boolean`; inject `ActivatedRoute`, `Router`, `ContentService`, `PermissionService`
- [x] T014 [US1] In `content-view.component.ts` — implement `ngOnInit()`: read `courseId = Number(this.route.snapshot.paramMap.get('courseId'))`, set `canRead/canUpdate/canDelete` via `permissionService.hasPermission()`, call `this.loadContent()` if `canRead`
- [x] T015 [US1] In `content-view.component.ts` — implement `loadContent()`: set `isLoading = true; loadError = ''`, subscribe to `contentService.getContentByCourse(courseId)`, on success set `contentList` and `isLoading = false`, on error set `loadError = 'Failed to load content. Please try again.'` and `isLoading = false`
- [x] T016 [P] [US1] In `content-view.component.ts` — implement `goBack()`: `this.router.navigate(['/dashboard/courses'])`
- [x] T017 [P] [US1] In `content-view.component.ts` — implement `toggleExpand(id: number)`: if `expandedIds.has(id)` call `expandedIds.delete(id)` else `expandedIds.add(id)`; implement `isExpanded(id: number): boolean` returning `this.expandedIds.has(id)`
- [x] T018 [P] [US1] In `content-view.component.ts` — implement `openAttachment(fileUrl: string): void` executing `window.open(fileUrl, '_blank')`; implement `getAttachmentIcon(contentType: string): string` returning `'bi bi-play-circle-fill'` for `contentType?.startsWith('video/')`, `'bi bi-file-earmark-pdf-fill'` for `contentType === 'application/pdf'`, `'bi bi-file-earmark-fill'` for any other value
- [x] T019 [US1] Create `src/app/features/content/content-view/content-view.component.html` — implement the complete read-only template: page header row with "Back" button (`.btn-lumina-outline` + `bi bi-arrow-left`) on the left and "Published Contents" heading; loading spinner (`spinner-border text-lms-primary`) shown via `*ngIf="isLoading"`; error banner (`alert alert-danger`) shown via `*ngIf="loadError"`; empty-state card with `bi bi-inbox` icon and message shown via `*ngIf="!isLoading && !loadError && contentList.length === 0"`; content list via `*ngFor="let item of contentList; let i = index"` with each card showing: zero-padded index (`i+1`), title, body, attachment count summary, expand toggle icon (`bi-chevron-up`/`bi-chevron-down`), and collapsed attachment section `*ngIf="isExpanded(item.id)"` listing each attachment with its icon and `(click)="openAttachment(att.fileUrl)"`
- [x] T020 [P] [US1] Create `src/app/features/content/content-view/content-view.component.css` — implement all component-scoped styles: `.content-number-badge` (40×40px, `border-radius: 8px`, `background: #f0f4f8`, `color: #41B3E3`); `.content-card` hover border `rgba(65,179,227,0.4)`; `.attachment-row` hover `background: #ffffff`; attachment icon `color: #41B3E3`; `.btn-lumina-outline` and `.btn-lumina-main` matching `design.md` spec; custom scrollbar for card body; `transition: all 0.3s ease` on interactive elements

**Checkpoint**: US1 fully functional. Load the page — all three states (loading, empty, populated) render correctly; expand/collapse works; attachment opens in new tab; Back button navigates to courses dashboard.

---

## Phase 4: User Story 2 — Edit a Content Item (Priority: P2)

**Goal**: A user with `Content:update` sees an Edit button on each card; clicking it opens an inline form pre-populated with the existing title and body; Save calls `PUT /api/Content/{contentId}` and updates the card in-place; Cancel silently discards changes and collapses the form.

**Independent Test**: Log in as admin/instructor, open the content page, click Edit on any card — the inline form appears with the current title and body pre-filled; change the text and click Save — the card immediately shows the updated text and a success toast appears; click Edit again and then Cancel — the form closes with no changes.

### Implementation for User Story 2

- [x] T021 [US2] In `content-view.component.ts` — implement `startEdit(item: Content): void`: add `item.id` to `editingIds`; set `editFormData.set(item.id, { title: item.title, body: item.body })`; also call `expandedIds.delete(item.id)` to collapse attachments while editing for a cleaner UX
- [x] T022 [US2] In `content-view.component.ts` — implement `cancelEdit(id: number): void`: `editingIds.delete(id); editFormData.delete(id)` — silently discards, no dialog (confirmed in clarification Q2)
- [x] T023 [US2] In `content-view.component.ts` — implement `saveEdit(id: number): void`: read `{title, body}` from `editFormData.get(id)!`; subscribe to `contentService.updateContent(id, title, body)`; on success: find item in `contentList` by id and update its `title` and `body` in-place, call `cancelEdit(id)` to close form, show `Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Content updated.', showConfirmButton: false, timer: 3000 })`; on error: show `Swal.fire({ icon: 'error', title: 'Update Failed', confirmButtonColor: '#41B3E3' })`
- [x] T024 [US2] In `content-view.component.html` — add the inline edit form block inside each card: shown via `*ngIf="editingIds.has(item.id)"` (replaces normal card body when active); contains a `border-top p-4 bg-light` section with two `.form-control` fields bound via `[(ngModel)]="editFormData.get(item.id)!.title"` and `[(ngModel)]="editFormData.get(item.id)!.body"`; Save button (`.btn-save-action`) calling `(click)="saveEdit(item.id)"`; Cancel button (`.btn-lumina-outline btn-sm`) calling `(click)="cancelEdit(item.id)"`; also add Edit button (`*ngIf="canUpdate && !editingIds.has(item.id)"`) with class `.btn-edit-action` and `bi bi-pencil-square` icon to the card header action row

**Checkpoint**: US2 fully functional. Edit button visible only for `canUpdate` users; form opens pre-populated; Save updates card in-place; Cancel discards with no dialog. Users without `Content:update` see no Edit button.

---

## Phase 5: User Story 3 — Delete Content Item or Attachment (Priority: P3)

**Goal**: A user with `Content:delete` sees a Delete button on each card header and on each attachment row. Clicking either triggers a SweetAlert2 confirmation; on confirm the card (or attachment row) is removed in-place without a page reload.

**Independent Test**: Log in as admin/instructor, open the content page — a trash icon is visible on each card header and on each attachment row inside expanded cards. Click a card's trash icon → confirm in the Swal dialog → the entire card disappears. Click an attachment's trash icon → confirm → only that attachment row disappears while the card remains. Users without `Content:delete` see no trash icons anywhere.

### Implementation for User Story 3

- [x] T025 [US3] In `content-view.component.ts` — implement `deleteContent(id: number): void`: call `Swal.fire({ title: 'Delete Content?', text: 'This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#E63946', cancelButtonColor: '#41B3E3', confirmButtonText: 'Yes, delete it' })`; if `result.isConfirmed` subscribe to `contentService.deleteContent(id)`; on success splice the card from `contentList` by id and show success toast; on error show `Swal.fire({ icon: 'error', title: 'Delete Failed', confirmButtonColor: '#41B3E3' })`
- [x] T026 [US3] In `content-view.component.ts` — implement `deleteAttachment(contentId: number, attachmentId: string): void`: same Swal confirm pattern (title: 'Remove Attachment?'); on success find the parent content item in `contentList` by `contentId` and splice the attachment with matching `attachmentId` from its `contentAttachments` array; show success toast; on error show error Swal
- [x] T027 [US3] In `content-view.component.html` — add Delete button to card header action row: `*ngIf="canDelete && !editingIds.has(item.id)"`, class `btn btn-link p-2 text-danger`, icon `bi bi-trash3`, `(click)="deleteContent(item.id)"`; add Delete button to each attachment row inside the expanded section: `*ngIf="canDelete"`, class `btn btn-link btn-sm text-danger`, icon `bi bi-trash3`, `(click)="deleteAttachment(item.id, att.id)"`

**Checkpoint**: US3 fully functional. Trash icons visible only for `canDelete` users. Content delete removes card in-place. Attachment delete removes only that row. Both require confirmation via Swal dialog. Users without `Content:delete` see a clean UI with no delete controls.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final UX refinements applying to all three user stories.

- [x] T028 In `content-view.component.html` — add the "Add New Content" CTA button at the top-right of the page header: visible only via `*ngIf="canAdd"` (declare `canAdd = false` in the component and set via `permissionService.hasPermission('Content:add')` in `ngOnInit`) — button uses `.btn-lumina-main` class with `bi bi-plus-lg` icon; clicking it does nothing this cycle (next-cycle stub: `(click)="onAddContent()"` where `onAddContent()` is an empty method)
- [x] T029 In `content-view.component.ts` — add `canAdd = false` property; set `this.canAdd = this.permissionService.hasPermission('Content:add')` in `ngOnInit()`; add empty stub method `onAddContent(): void {}` (no-op for this cycle)
- [x] T030 In `content-view.component.html` — add attachment count summary line to each card header (below title and body): `*ngIf="item.contentAttachments.length > 0"` showing e.g. `"3 file(s)"` using `item.contentAttachments.length`; when count is 0 and card is not in edit mode, show muted text `"No attachments"` so students see feedback without expanding
- [x] T031 In `content-view.component.css` — add `:host` scoped `ngModel` focus styling for inline edit form inputs: `border-color: #41B3E3; box-shadow: 0 0 0 0.25rem rgba(65,179,227,0.2)` matching the design system's focus convention from `DESIGN.md` section 5.8
- [ ] T032 Manual smoke test — start `ng serve`, navigate to `/dashboard/courses`, click the content view link for any course; verify: (a) loading spinner appears briefly, (b) cards render collapsed by default, (c) expanding a card shows attachments with correct icons, (d) clicking an attachment opens the URL in a new tab, (e) Back button returns to courses list, (f) Edit button appears only for admin/instructor and inline form works end-to-end, (g) Delete (card) and Delete (attachment) both require confirmation and update UI in-place, (h) student user sees no Edit or Delete controls anywhere

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — **blocks all user stories**
- **Phase 3 (US1)**: Depends on Phase 2 — builds reading / viewing layer
- **Phase 4 (US2)**: Depends on Phase 2 — can start in parallel with US1 after Phase 2
- **Phase 5 (US3)**: Depends on Phase 2 — can start in parallel with US1/US2 after Phase 2
- **Phase 6 (Polish)**: Depends on Phase 3, 4, 5 completion

### User Story Dependencies

- **US1 (P1)** — no dependency on US2 or US3. Only the `ContentService.getContentByCourse()` call is required.
- **US2 (P2)** — no dependency on US1 runtime behaviour; requires `ContentService.updateContent()`. The Edit button simply being hidden for non-update users is independent of the read display.
- **US3 (P3)** — no dependency on US1 or US2 runtime behaviour; requires `ContentService.deleteContent()` + `ContentService.deleteAttachment()`.

### Parallel Opportunities

| Parallel Group | Tasks |
|---|---|
| Phase 1 parallel | T002, T003 can run alongside T001 |
| Phase 2 parallel | T005–T012 can all run in parallel after T003 (all different methods in same file — write sequentially if solo) |
| US1 parallel | T016, T017, T018, T020 are independent of T015 logic |
| US2 + US3 parallel | T021–T024 (US2) and T025–T027 (US3) can be worked in parallel after Phase 2 |

---

## Parallel Example: User Story 1

```bash
# After Phase 2 completes, launch these together:
Task T016: goBack() navigation method
Task T017: toggleExpand() + isExpanded() methods
Task T018: openAttachment() + getAttachmentIcon() helpers
Task T020: component CSS (styles do not block logic tasks)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational service (T005–T012)
3. Complete Phase 3: US1 read-only view (T013–T020)
4. **STOP and VALIDATE** — smoke test the content list, expand/collapse, attachment open, back button
5. Demo to stakeholders

### Incremental Delivery

1. Phase 1 + Phase 2 → Service and route ready
2. Phase 3 (US1) → Read-only view works for all roles ✅
3. Phase 4 (US2) → Instructors/admins can edit content ✅
4. Phase 5 (US3) → Instructors/admins can delete content and attachments ✅
5. Phase 6 (Polish) → UX completeness + Add CTA stub for next cycle ✅

---

## Notes

- `[P]` tasks = different files or independent methods — safe to run in parallel
- `[US1/2/3]` labels map each task to the specific user story for traceability
- The `canAdd` property and `onAddContent()` stub in T028/T029 are intentional no-ops — they prevent the "Add New Content" button from being hidden entirely when the `content-add` cycle is implemented
- Models location uses `src/app/models/` (project convention) not `src/app/core/models/` (note the discrepancy from the tasks template default)
- All `Swal.fire()` calls use `confirmButtonColor: '#41B3E3'` unless it's a destructive action, where `confirmButtonColor: '#E63946'` is used
- `ngModel` in the inline edit form requires `FormsModule` in the component's `imports` array (already included in T013)
