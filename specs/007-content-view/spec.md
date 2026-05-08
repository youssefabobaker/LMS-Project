# Feature Specification: Course Content View

**Feature Branch**: `007-content-view`
**Created**: 2026-05-07
**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Course Content List (Priority: P1)

Any authorised user (student, instructor, admin) navigates to a specific course and sees the full list of content items for that course. Each content card shows the title, body text, and the number of attachments. The user can expand a card to reveal the individual attachment files. They can also click any attachment to open it directly in a new browser tab. A "Back" button is always visible to return to the Courses Dashboard.

**Why this priority**: Reading content is the entire purpose of the page. All other stories depend on having this foundational read-view working first.

**Independent Test**: Can be fully tested by navigating to the page for any course with existing content — the list of cards appears, cards expand to reveal attachment links, clicking a link opens the file in a new tab, and the Back button returns to the dashboard.

**Acceptance Scenarios**:

1. **Given** a user with `Content:read` permission is on the Course Content page, **When** the page loads, **Then** all content items for that course are displayed as expandable cards showing title and body.
2. **Given** a content card with attachments, **When** the user clicks the expand toggle on that card, **Then** the attachment list is revealed showing the file name and appropriate icon (PDF or video).
3. **Given** an expanded attachment list, **When** the user clicks an attachment, **Then** the file opens in a new browser tab without navigating away from the current page.
4. **Given** a course with no content items, **When** the page loads, **Then** a clear empty-state message is displayed instead of a blank list.
5. **Given** any user on the Content page, **When** the user clicks the "Back" button, **Then** they are taken back to the Courses Dashboard.
6. **Given** a user **without** `Content:read` permission, **When** they access the page, **Then** the content list is not shown.
7. **Given** the page has just loaded, **When** the user views the content list, **Then** all cards are in their collapsed state by default — no attachment lists are pre-expanded.

---

### User Story 2 — Edit a Content Item (Priority: P2)

A user with editorial authority (instructor, admin) edits the title and/or body text of an existing content item. After saving, the updated text is reflected in the card immediately without a full page reload.

**Why this priority**: Correcting mistakes or updating course material is a frequent instructor task. It does not block reading but is the most commonly needed management action.

**Independent Test**: Log in as an admin/instructor, click Edit on a content card, change the title and/or body, save — the card immediately reflects the new text.

**Acceptance Scenarios**:

1. **Given** a user with `Content:update` permission, **When** they are viewing the content list, **Then** an Edit button is visible on each content card.
2. **Given** the Edit button is clicked, **When** the edit form opens (inline or modal), **Then** the existing title and body are pre-populated in the form fields.
3. **Given** valid updated title and body, **When** the user submits the form, **Then** the card updates in-place with the new text and a success notification is shown.
4. **Given** a user **without** `Content:update` permission, **When** viewing the content list, **Then** no Edit button is visible.
5. **Given** the inline edit form is open, **When** the user clicks Cancel, **Then** all unsaved changes are silently discarded and the card returns to its normal read-only state with no confirmation dialog.

---

### User Story 3 — Delete a Content Item or Attachment (Priority: P3)

A user with deletion authority removes either an entire content item or a single attachment from a card. The deletion is reflected immediately in the UI without a page reload.

**Why this priority**: Removing outdated or incorrect material keeps the course clean. It is less frequent than reading or editing but important for content governance.

**Independent Test**: Log in as an admin/instructor, click Delete on a content card — the card disappears immediately. Click Delete on an individual attachment — the attachment row disappears immediately.

**Acceptance Scenarios**:

1. **Given** a user with `Content:delete` permission, **When** viewing the content list, **Then** a Delete action is visible on each content card and on each attachment row inside expanded cards.
2. **Given** the Delete action on a content card is triggered, **When** the user confirms the deletion, **Then** the entire card is removed from the list in-place and a success notification is shown.
3. **Given** the Delete action on an individual attachment is triggered, **When** the user confirms, **Then** only that attachment row is removed from the expanded card; the card itself remains.
4. **Given** a user **without** `Content:delete` permission, **When** viewing the content list, **Then** no Delete actions are visible anywhere on the page.

---

### Edge Cases

- What happens when the API call to fetch content fails? → An inline error banner is displayed with a retry option; the empty-state message is not shown.
- What happens when a content item has zero attachments? → The card still renders correctly; expanding it shows an "no attachments" note rather than an empty list.
- What happens when a file URL is broken or unreachable? → The browser's native error page in the new tab handles it; no special in-app handling required.
- What if two attachments have the same file name? → They are distinguished by their unique IDs; both are displayed.
- What happens if a content item has only a title with an empty body? → The card renders correctly with an empty body area; no placeholder text is injected.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display all content items for a given course when the user has `Content:read` permission.
- **FR-002**: Each content card MUST show the title and body of the content item.
- **FR-003**: Each content card MUST have an expandable toggle to show or hide its list of attachments. All cards MUST start in the **collapsed** state when the page first loads; the user manually expands each card.
- **FR-004**: Each attachment row MUST display an appropriate file-type icon — a PDF icon for `application/pdf` and a video icon for `video/mp4` (and similar video types) — derived from the `contentType` field.
- **FR-005**: Clicking an attachment MUST open the file URL in a new browser tab using the attachment's `fileUrl` value.
- **FR-006**: The page MUST display an empty-state message when a course has no content items.
- **FR-007**: The page MUST include a "Back" button that returns the user to the Courses Dashboard.
- **FR-008**: Edit controls MUST only be visible to users with `Content:update` permission.
- **FR-009**: When a content item is edited, the form MUST be pre-populated with the existing title and body; on successful save the card MUST update in-place. If the user cancels the edit, all unsaved changes MUST be silently discarded and the form MUST collapse back to the card's read-only state — no confirmation dialog is required.
- **FR-010**: Delete controls MUST only be visible to users with `Content:delete` permission.
- **FR-011**: Deleting a content item MUST remove its card from the list in-place without a page reload.
- **FR-012**: Deleting an individual attachment MUST remove only that attachment row from the expanded card, leaving the card and other attachments intact.
- **FR-013**: A load-error state MUST be shown (distinct from the empty state) when the API request fails.

### Key Entities

- **Content Item**: A unit of learning material belonging to a course. Has an integer `id`, a `title`, a `body`, and a list of zero or more attachments.
- **Content Attachment**: A file linked to a content item. Has a GUID `id`, a human-readable `fileName`, a public `fileUrl`, and a MIME `contentType` string that determines which file-type icon is shown.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with `Content:read` permission can open the content page and see the full list of course content within 2 seconds under normal network conditions.
- **SC-002**: A user can expand and collapse any content card and click any attachment to open it in a new tab — all without a page reload.
- **SC-003**: An authorised editor can update a content item's title or body and see the change reflected in the card within 1 second of the save action completing.
- **SC-004**: An authorised editor can delete a content item or a single attachment and see the item disappear from the UI within 1 second of the deletion completing.
- **SC-005**: All permission-gated actions (Edit, Delete) are completely invisible to users who lack the required permission, with no visual placeholders or disabled buttons left on screen.
- **SC-006**: The empty state and load-error state are visually distinct from each other and from a populated list, so a user can immediately understand what happened.

---

## Assumptions

- Bootstrap 5 is the CSS framework; `design.md` is the visual source of truth. The stitch design in `stitch-designs/content-view/` is the authoritative visual blueprint and MUST be consulted before any HTML/CSS work.
- Angular Standalone Components are used exclusively; no NgModule.
- The component lives at `src/app/features/content/content-view/`.
- The content service will live at `src/app/core/services/content.service.ts`; model interfaces will live in `src/app/models/`.
- The `courseId` is available via the Angular `ActivatedRoute` URL parameter when the content page is opened.
- Confirmation before delete uses the existing SweetAlert2 pattern already established by other modals in the project.
- The "Back" button navigates to `/dashboard/courses` (the existing Courses Dashboard route).
- File-type icon logic covers at minimum `application/pdf` (PDF icon) and `video/*` types (video icon); any unrecognised MIME type falls back to a generic file icon.
- No file upload or attachment creation is in scope for this cycle (that is handled by a separate `content-add` feature).
- The Edit form is inline (in-card) rather than a separate modal, following the pattern established by the stitch design.
- The API responses may use camelCase or PascalCase field names; the service normalisation layer must handle both.

---

## Clarifications

### Session 2026-05-07

- Q: What is the initial expansion state of content cards when the page first loads? → A: All cards start **collapsed** by default; users expand each one manually.
- Q: What happens when the user clicks Cancel on the inline edit form? → A: Changes are **silently discarded** and the form collapses back to the card's read-only state — no confirmation dialog shown.
