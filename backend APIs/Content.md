# Content API

Base URL: `/api/Content`

> Responses are cached for **300 seconds** on GET endpoints. Mutating operations automatically invalidate the cache.
>
> File upload endpoints accept a maximum request size of **500 MB**.

---

## Endpoints

### 1. Get All Content by Course

**GET** `/api/Content/course/{courseId}`

**Permission** `Content:read` — Roles: SuperAdmin, Admin, Instructor, Student

Retrieves all content items belonging to a specific course.

**Path Parameters**

| Parameter  | Type  | Description      |
|------------|-------|------------------|
| `courseId` | `int` | ID of the course |

**Response `200 OK`**

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

### 2. Get Content by ID

**GET** `/api/Content/{contentId}`

**Permission** `Content:read` — Roles: SuperAdmin, Admin, Instructor, Student

Retrieves a single content item by its ID.

**Path Parameters**

| Parameter   | Type  | Description       |
|-------------|-------|-------------------|
| `contentId` | `int` | ID of the content |

**Response `200 OK`** — Returns `ContentResponseDto`.

---

### 3. Create Content for Course

**POST** `/api/Content/course/{courseId}`

**Permission** `Content:add` — Roles: SuperAdmin, Admin, Instructor

Creates a new content item for the specified course.

**Path Parameters**

| Parameter  | Type  | Description      |
|------------|-------|------------------|
| `courseId` | `int` | ID of the course |

**Request Body** (`application/json`)

```json
{
  "title": "Week 1 - Introduction",
  "body": "This week we cover the fundamentals..."
}
```

| Field   | Type     | Required | Description              |
|---------|----------|----------|--------------------------|
| `title` | `string` | Yes      | Title of the content     |
| `body`  | `string` | Yes      | Main text/body content   |

**Response `200 OK`** — Returns the created `ContentResponseDto`.

---

### 4. Update Content

**PUT** `/api/Content/{contentId}`

**Permission** `Content:update` — Roles: SuperAdmin, Admin, Instructor

Updates the title and body of an existing content item.

**Path Parameters**

| Parameter   | Type  | Description       |
|-------------|-------|-------------------|
| `contentId` | `int` | ID of the content |

**Request Body** (`application/json`)

```json
{
  "title": "Updated Title",
  "body": "Updated body text..."
}
```

| Field   | Type     | Required | Description            |
|---------|----------|----------|------------------------|
| `title` | `string` | Yes      | New title              |
| `body`  | `string` | Yes      | New body text          |

**Response `200 OK`** — Empty body.

---

### 5. Delete Content

**DELETE** `/api/Content/{contentId}`

**Permission** `Content:delete` — Roles: SuperAdmin, Admin, Instructor

Deletes a content item by its ID.

**Path Parameters**

| Parameter   | Type  | Description       |
|-------------|-------|-------------------|
| `contentId` | `int` | ID of the content |

**Response `200 OK`** — Empty body.

---

### 6. Add Attachments to Content

**POST** `/api/Content/{contentId}/attachments`

**Permission** `Content:add` — Roles: SuperAdmin, Admin, Instructor

Uploads one or more files and attaches them to an existing content item.

**Path Parameters**

| Parameter   | Type  | Description       |
|-------------|-------|-------------------|
| `contentId` | `int` | ID of the content |

**Request Body** (`multipart/form-data`)

| Field             | Type     | Description                 |
|-------------------|----------|-----------------------------|
| `attachmentFiles` | `File[]` | One or more files to upload |

**Response `200 OK`** — Returns the updated `ContentResponseDto` including the new attachments.

---

### 7. Remove Attachment from Content

**DELETE** `/api/Content/attachments/{attachmentId}`

**Permission** `Content:delete` — Roles: SuperAdmin, Admin, Instructor

Removes a specific attachment from a content item.

**Path Parameters**

| Parameter      | Type   | Description                    |
|----------------|--------|--------------------------------|
| `attachmentId` | `Guid` | ID of the attachment to remove |

**Response `200 OK`** — Empty body.

---

## Response Models

### `ContentResponseDto`

| Field                | Type                      | Description                   |
|----------------------|---------------------------|-------------------------------|
| `id`                 | `int`                     | Content ID                    |
| `title`              | `string`                  | Content title                 |
| `body`               | `string`                  | Main text/body                |
| `contentAttachments` | `ContentAttachmentDto[]?` | List of attached files        |

### `ContentAttachmentDto`

| Field         | Type     | Description                                   |
|---------------|----------|-----------------------------------------------|
| `id`          | `Guid`   | Attachment ID                                 |
| `fileName`    | `string` | Original file name                            |
| `fileUrl`     | `string` | Public URL to download/view the file          |
| `contentType` | `string` | MIME type (e.g. `video/mp4`, `application/pdf`) |
