# Research: Course Content View (007)

**Date**: 2026-05-07
**Feature**: Course Content View — `specs/007-content-view/spec.md`

---

## 1. Permission Pattern

**Decision**: Use the established `PermissionService.hasPermission()` wrapper pattern (not a structural directive).

**Rationale**: Every existing feature (course-view, course-assessment, course-enrollment, department-management, user-management) stores boolean flags (`canRead`, `canUpdate`, `canDelete`) in `ngOnInit` via `this.permissionService.hasPermission('X')`. Templates use `*ngIf="canUpdate"` to show/hide controls. No `PermissionDirective` exists in the codebase — the wrapper method is the canonical pattern.

**Alternatives considered**: A structural `*appPermission` directive was mentioned in the user request. Not implemented anywhere; adding it would violate Scope-Lock. Using the established pattern is the correct choice.

**Permissions for this feature**:
- `Content:read` — load and display the content list
- `Content:update` — show Edit button and inline edit form
- `Content:delete` — show Delete button on card and on each attachment row

---

## 2. Route Structure

**Decision**: New child route `dashboard/courses/:courseId/content` renders `ContentViewComponent` inside the `DashboardComponent` router-outlet.

**Rationale**: The existing `app.routes.ts` has stub redirects at `courses/:id/assessments` and `courses/:id/enrollment`. The content view is the same level of nesting. The `courseId` is a numeric route parameter read via `ActivatedRoute.snapshot.paramMap.get('courseId')`.

**Back button target**: `this.router.navigate(['/dashboard/courses'])` — the existing `CourseViewComponent` route.

**Route registration**: `app.routes.ts` must be updated to replace the `courses/:id/content` stub with the real component and a `permissionGuard` for `Content:read`. This is an **in-scope** change because the component cannot function without it.

---

## 3. ContentService — Endpoint Map

**Decision**: Create `src/app/core/services/content.service.ts` with the following methods.

| Method | HTTP | Endpoint | Scope |
|--------|------|----------|-------|
| `getContentByCourse(courseId)` | GET | `/api/Content/course/{courseId}` | This cycle |
| `getContentById(contentId)` | GET | `/api/Content/{contentId}` | This cycle |
| `updateContent(contentId, body)` | PUT | `/api/Content/{contentId}` | This cycle |
| `deleteContent(contentId)` | DELETE | `/api/Content/{contentId}` | This cycle |
| `deleteAttachment(attachmentId)` | DELETE | `/api/Content/attachments/{attachmentId}` | This cycle |
| `createContent(courseId, body)` | POST | `/api/Content/course/{courseId}` | **Next cycle** (stub only) |
| `addAttachments(contentId, files)` | POST | `/api/Content/{contentId}/attachments` | **Next cycle** (stub only) |

The two "next cycle" methods will be declared with the correct signatures but not called from this cycle's component — they are stubs for the `content-add` cycle.

**Response normalisation**: The API may return camelCase or PascalCase. A `normalizeContent()` helper will map both variants for `id`, `title`, `body`, and `contentAttachments`; a `normalizeAttachment()` helper will map `id`, `fileName`, `fileUrl`, `contentType`.

---

## 4. Data Models

**Decision**: Create `src/app/models/content.ts` with two interfaces.

```typescript
interface ContentAttachment {
  id: string;          // Guid
  fileName: string;
  fileUrl: string;
  contentType: string; // MIME type
}

interface Content {
  id: number;
  title: string;
  body: string;
  contentAttachments: ContentAttachment[];
}
```

Model location follows the project convention (`src/app/models/`).

---

## 5. Inline Edit State Machine

**Decision**: A simple per-card boolean flag stored in a `Map<number, boolean>` (`editingIds`) plus a `Map<number, {title, body}>` (`editFormData`) for the in-progress values.

**Rationale**: No shared edit state across cards is needed. The map approach avoids storing edit state on the model objects themselves (keeping the model pure), and mirrors how the assessment component handles per-row state.

**Cancel behaviour** (confirmed in `/speckit-clarify`): Silently discard and close the form — just delete the entry from both maps.

---

## 6. Card Expansion State

**Decision**: A `Set<number>` (`expandedIds`) tracks which card IDs are expanded. Toggle adds/removes the ID.

**Initial state** (confirmed in `/speckit-clarify`): All cards start collapsed — `expandedIds` is empty on init.

---

## 7. File-Type Icon Logic

**Decision**: A pure helper method `getAttachmentIcon(contentType: string): string`.

```
contentType starts with 'video/' → 'bi bi-play-circle-fill'  (video)
contentType === 'application/pdf' → 'bi bi-file-earmark-pdf-fill'  (PDF)
default → 'bi bi-file-earmark-fill'  (generic)
```

Bootstrap Icons are the project's icon library (confirmed in constitution and DESIGN.md). The stitch design uses Material Symbols (`play_circle`, `description`) — but since the rest of the project uses Bootstrap Icons and the constitution mandates them, **Bootstrap Icons are used**, maintaining consistency over the stitch literal.

---

## 8. Delete Confirmation Pattern

**Decision**: Use `Swal.fire({ title, text, icon: 'warning', showCancelButton: true, ... })` for delete confirmation — both content delete and attachment delete.

**Rationale**: `await Swal.fire(...)` with `result.isConfirmed` check is the established pattern in department-management, user-management, and course-view. No exceptions.

---

## 9. Stitch Design Adaptation Notes

The `stitch-designs/content-view/code.html` uses Tailwind CSS utility classes for spacing and Flexbox (`flex`, `gap-3`, `px-12`, etc.). Since the constitution mandates Bootstrap 5 as the framework, the component implementation will:
- Reproduce the **visual design** (card layout, attachment rows, expand icon, action buttons) using Bootstrap 5 grid/flex utilities and Lumina CSS classes.
- Use `bi bi-*` icons instead of Material Symbols.
- Use the Lumina gradient button classes for the "Add New Content" CTA (rendered only for `canAdd`, future stub).
- Inline-edit form uses Bootstrap form controls with `border-color: #41B3E3` focus style.
