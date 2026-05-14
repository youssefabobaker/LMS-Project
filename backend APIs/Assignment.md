# Assignment API

Base URL: `/api/Assignment`

> Responses are cached for **300 seconds** on GET endpoints. Mutating operations automatically invalidate the cache.

---

## Endpoints

### 1. Get All Assignments by Course

**GET** `/api/Assignment/course/{courseId}`

**Permission** `Ass:read` — Roles: SuperAdmin, Admin, Instructor, Student

Retrieves all assignments belonging to a specific course.

**Path Parameters**

| Parameter  | Type  | Description        |
|------------|-------|--------------------|
| `courseId` | `int` | ID of the course   |

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "title": "Assignment Title",
    "description": "Assignment description text",
    "dueDate": "2026-06-01T23:59:00",
    "totalMarks": 100.0,
    "assignmentAttachments": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "fileName": "instructions.pdf",
        "fileUrl": "https://storage.example.com/instructions.pdf",
        "type": "application/pdf"
      }
    ]
  }
]
```

---

### 2. Get Assignment by ID

**GET** `/api/Assignment/{id}`

**Permission** `Ass:read` — Roles: SuperAdmin, Admin, Instructor, Student

Retrieves a single assignment by its ID.

**Path Parameters**

| Parameter | Type  | Description          |
|-----------|-------|----------------------|
| `id`      | `int` | ID of the assignment |

**Response `200 OK`**

```json
{
  "id": 1,
  "title": "Assignment Title",
  "description": "Assignment description text",
  "dueDate": "2026-06-01T23:59:00",
  "totalMarks": 100.0,
  "assignmentAttachments": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "fileName": "instructions.pdf",
      "fileUrl": "https://storage.example.com/instructions.pdf",
      "type": "application/pdf"
    }
  ]
}
```

---

### 3. Create or Update Assignment for Course

**POST** `/api/Assignment/course/{courseId}`

**Permission** `Ass:addOrUpdate` — Roles: SuperAdmin, Admin, Instructor

Creates a new assignment for the course. If `Id` is provided in the body and matches an existing assignment, it is updated instead.

**Path Parameters**

| Parameter  | Type  | Description      |
|------------|-------|------------------|
| `courseId` | `int` | ID of the course |

**Request Body** (`application/json`)

```json
{
  "id": 0,
  "title": "Assignment Title",
  "description": "Assignment description text",
  "dueDate": "2026-06-01T23:59:00",
  "totalMarks": 100.0
}
```

| Field         | Type       | Required | Description                                  |
|---------------|------------|----------|----------------------------------------------|
| `id`          | `int`      | No       | Set to `0` for create; provide ID for update |
| `title`       | `string`   | Yes      | Assignment title                             |
| `description` | `string`   | Yes      | Detailed description / instructions          |
| `dueDate`     | `datetime` | Yes      | Submission deadline (ISO 8601)               |
| `totalMarks`  | `double`   | Yes      | Maximum marks for the assignment             |

**Response `200 OK`** — Returns the created/updated `AssigmentResponseDto`.

---

### 4. Delete Assignment

**DELETE** `/api/Assignment/{id}`

**Permission** `Ass:delete` — Roles: SuperAdmin, Admin, Instructor

Deletes an assignment by its ID.

**Path Parameters**

| Parameter | Type  | Description          |
|-----------|-------|----------------------|
| `id`      | `int` | ID of the assignment |

**Response `200 OK`** — Empty body.

---

### 5. Add Attachments to Assignment

**POST** `/api/Assignment/{assignmentId}/attachments`

**Permission** `Ass:addOrUpdate` — Roles: SuperAdmin, Admin, Instructor

Uploads one or more files and attaches them to an existing assignment.

**Path Parameters**

| Parameter      | Type  | Description          |
|----------------|-------|----------------------|
| `assignmentId` | `int` | ID of the assignment |

**Request Body** (`multipart/form-data`)

| Field             | Type         | Description               |
|-------------------|--------------|---------------------------|
| `attachmentFiles` | `File[]`     | One or more files to upload |

**Response `200 OK`** — Returns the updated `AssigmentResponseDto` including the new attachments.

---

### 6. Remove Attachment from Assignment

**DELETE** `/api/Assignment/attachments/{attachmentId}`

**Permission** `Ass:delete` — Roles: SuperAdmin, Admin, Instructor

Removes a specific attachment from an assignment.

**Path Parameters**

| Parameter      | Type   | Description                    |
|----------------|--------|--------------------------------|
| `attachmentId` | `Guid` | ID of the attachment to remove |

**Response `200 OK`** — Empty body.

---

## Response Models

### `AssigmentResponseDto`

| Field                   | Type                          | Description                  |
|-------------------------|-------------------------------|------------------------------|
| `id`                    | `int`                         | Assignment ID                |
| `title`                 | `string`                      | Assignment title             |
| `description`           | `string`                      | Assignment description       |
| `dueDate`               | `datetime`                    | Submission deadline          |
| `totalMarks`            | `double`                      | Maximum marks                |
| `assignmentAttachments` | `AssignmentAttachmentDto[]?`  | List of attached files       |

### `AssignmentAttachmentDto`

| Field      | Type     | Description                              |
|------------|----------|------------------------------------------|
| `id`       | `Guid`   | Attachment ID                            |
| `fileName` | `string` | Original file name                       |
| `fileUrl`  | `string` | Public URL to download/view the file    |
| `type`     | `string` | MIME type (e.g. `application/pdf`)       |
