# API Contracts: Course Content View (007)

Base URL: `https://localhost:7289/api/Content`

---

## GET `/api/Content/course/{courseId}` — List Course Content

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Permission** | `Content:read` |
| **Path param** | `courseId` (int) |
| **Success** | `200 OK` — `ContentResponseDto[]` |
| **Empty** | `200 OK` — `[]` (triggers empty-state UI) |
| **Error** | `401/403` — triggers load-error banner |

**Response shape**:
```json
[
  {
    "id": 1,
    "title": "Week 1 - Introduction",
    "body": "This week we cover the fundamentals...",
    "contentAttachments": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "fileName": "lecture1.pdf",
        "fileUrl": "https://storage.example.com/lecture1.pdf",
        "contentType": "application/pdf"
      }
    ]
  }
]
```

---

## PUT `/api/Content/{contentId}` — Update Content

| Property | Value |
|----------|-------|
| **Method** | PUT |
| **Permission** | `Content:update` |
| **Path param** | `contentId` (int) |
| **Body** | `{ "title": string, "body": string }` |
| **Success** | `200 OK` — empty body |
| **On success** | Update card in-place; close edit form |
| **On error** | Show inline error; keep form open |

---

## DELETE `/api/Content/{contentId}` — Delete Content Item

| Property | Value |
|----------|-------|
| **Method** | DELETE |
| **Permission** | `Content:delete` |
| **Path param** | `contentId` (int) |
| **Success** | `200 OK` — empty body |
| **On success** | Remove card from `contentList` in-place |
| **On error** | Swal error toast |
| **Confirmation** | Swal `showCancelButton: true` dialog before API call |

---

## DELETE `/api/Content/attachments/{attachmentId}` — Remove Attachment

| Property | Value |
|----------|-------|
| **Method** | DELETE |
| **Permission** | `Content:delete` |
| **Path param** | `attachmentId` (Guid) |
| **Success** | `200 OK` — empty body |
| **On success** | Remove attachment row in-place from the parent card |
| **On error** | Swal error toast |
| **Confirmation** | Swal `showCancelButton: true` dialog before API call |

---

## GET `/api/Content/{contentId}` — Get Single Content (supporting)

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Permission** | `Content:read` |
| **Path param** | `contentId` (int) |
| **Success** | `200 OK` — single `ContentResponseDto` |
| **Usage** | Not needed in this cycle — available for future detail views |

---

## POST `/api/Content/course/{courseId}` — Create Content *(next cycle stub)*

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Permission** | `Content:add` |
| **Body** | `{ "title": string, "body": string }` |
| **Status** | Declared in `ContentService` but not called this cycle |

---

## POST `/api/Content/{contentId}/attachments` — Upload Attachments *(next cycle stub)*

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Permission** | `Content:add` |
| **Body** | `multipart/form-data` — field `attachmentFiles: File[]` |
| **Status** | Declared in `ContentService` but not called this cycle |
