# Data Model: Course Content View (007)

**Date**: 2026-05-07
**Source**: `backend APIs/Content.md`, `specs/007-content-view/spec.md`

---

## TypeScript Interfaces

File: `src/app/models/content.ts`

```typescript
export interface ContentAttachment {
  id: string;          // UUID / Guid — unique attachment identifier
  fileName: string;    // Original file name (e.g. "lecture1.pdf")
  fileUrl: string;     // Public URL to open the file
  contentType: string; // MIME type — drives icon logic (e.g. "application/pdf", "video/mp4")
}

export interface Content {
  id: number;                           // Integer — content item identifier
  title: string;                        // Card heading
  body: string;                         // Card body / description text
  contentAttachments: ContentAttachment[]; // May be empty array
}
```

---

## API Response DTOs (from `Content.md`)

### `ContentResponseDto`

| Field                | Type                       | Notes |
|----------------------|----------------------------|-------|
| `id`                 | `int`                      | Content ID |
| `title`              | `string`                   | Title of the content item |
| `body`               | `string`                   | Body / description text |
| `contentAttachments` | `ContentAttachmentDto[]?`  | Nullable — normalised to `[]` if null |

### `ContentAttachmentDto`

| Field         | Type     | Notes |
|---------------|----------|-------|
| `id`          | `Guid`   | Attachment GUID |
| `fileName`    | `string` | Human-readable file name |
| `fileUrl`     | `string` | Public URL |
| `contentType` | `string` | MIME type — `application/pdf`, `video/mp4`, etc. |

---

## Component State Model (`ContentViewComponent`)

| Property | Type | Purpose |
|---|---|---|
| `courseId` | `number` | Extracted from route param on init |
| `contentList` | `Content[]` | Master list from API |
| `isLoading` | `boolean` | Controls spinner visibility |
| `loadError` | `string` | Distinct from empty state — shown on API failure |
| `expandedIds` | `Set<number>` | IDs of currently expanded cards |
| `editingIds` | `Set<number>` | IDs of cards in edit mode |
| `editFormData` | `Map<number, {title: string, body: string}>` | In-progress form values keyed by content ID |
| `canRead` | `boolean` | `Content:read` permission flag |
| `canUpdate` | `boolean` | `Content:update` permission flag |
| `canDelete` | `boolean` | `Content:delete` permission flag |

---

## Normalisation Map

Because the backend may return camelCase or PascalCase field names:

```
Content:
  id          ← u.id        ?? u.Id
  title       ← u.title     ?? u.Title     ?? ''
  body        ← u.body      ?? u.Body      ?? ''
  contentAttachments ← (u.contentAttachments ?? u.ContentAttachments ?? []).map(normalizeAttachment)

ContentAttachment:
  id          ← a.id          ?? a.Id
  fileName    ← a.fileName    ?? a.FileName    ?? ''
  fileUrl     ← a.fileUrl     ?? a.FileUrl     ?? ''
  contentType ← a.contentType ?? a.ContentType ?? ''
```

---

## File-Type Icon Map

| `contentType` pattern | Bootstrap Icon class | Visual meaning |
|---|---|---|
| starts with `video/` | `bi bi-play-circle-fill` | Video file |
| `application/pdf` | `bi bi-file-earmark-pdf-fill` | PDF document |
| anything else | `bi bi-file-earmark-fill` | Generic file |
