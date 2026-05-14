# Assignment Submission API

Base URL: `/api/AssignmentSubmission`

> All endpoints require an authenticated user. The student's ID is resolved automatically from the JWT token where applicable.

---

## Endpoints

### 1. Submit Assignment

**POST** `/api/AssignmentSubmission/Assignment/Submit`

**Permission** `Ass:solve` — Roles: SuperAdmin, Student

Submits an assignment for the currently authenticated student. Optionally accepts file attachments.

**Request Body** (`multipart/form-data`)

| Field             | Type       | Required | Description                                 |
|-------------------|------------|----------|---------------------------------------------|
| `assignmentId`    | `int`      | Yes      | ID of the assignment being submitted        |
| `textSubmission`  | `string`   | No       | Text-based answer / response                |
| `attachmentFiles` | `File[]`   | No       | One or more attachment files                |

**Response `200 OK`** — Returns the created `AssignmentSubmissionResponseDto`.

```json
{
  "id": 1,
  "assignmentId": 5,
  "studentId": "user-guid-string",
  "textSubmission": "My answer here...",
  "submittedAt": "2026-05-04T10:30:00",
  "grade": null,
  "feedback": null,
  "assignmentSubmissionAttachments": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "fileName": "solution.pdf",
      "fileUrl": "https://storage.example.com/solution.pdf",
      "type": "application/pdf"
    }
  ]
}
```

---

### 2. Get Submission by ID

**GET** `/api/AssignmentSubmission/AssignmentSubmission/{submissionId}`

**Permission** `AssSubmission:read` — Roles: SuperAdmin, Admin, Instructor, Student

Retrieves a specific submission by its ID.

**Path Parameters**

| Parameter      | Type  | Description          |
|----------------|-------|----------------------|
| `submissionId` | `int` | ID of the submission |

**Response `200 OK`** — Returns `AssignmentSubmissionResponseDto`.

---

### 3. Get Current Student's Submissions

**GET** `/api/AssignmentSubmission/Student/Assignment/Submissions`

**Permission** `Ass:solve` — Roles: SuperAdmin, Student

Returns all submissions made by the currently authenticated student.

**Response `200 OK`** — Returns `AssignmentSubmissionResponseDto[]`.

---

### 4. Get All Submissions for an Assignment

**GET** `/api/AssignmentSubmission/Assignment/{assignmentId}/Students`

**Permission** `AssSubmission:readAll` — Roles: SuperAdmin, Admin, Instructor

Returns all student submissions for a given assignment. Intended for instructor use.

**Path Parameters**

| Parameter      | Type  | Description          |
|----------------|-------|----------------------|
| `assignmentId` | `int` | ID of the assignment |

**Response `200 OK`** — Returns `AssignmentSubmissionResponseDto[]`.

---

### 5. Delete Submission

**DELETE** `/api/AssignmentSubmission/Assignment/Submission/{submissionId}`

**Permission** `AssSubmission:delete` — Roles: SuperAdmin, Admin, Student

Deletes a submission by its ID.

**Path Parameters**

| Parameter      | Type  | Description          |
|----------------|-------|----------------------|
| `submissionId` | `int` | ID of the submission |

**Response `200 OK`** — Empty body.

---

### 6. Grade Submission

**PUT** `/api/AssignmentSubmission/Assignment/Submission/{submissionId}/Grade`

**Permission** `Ass:Grade` — Roles: SuperAdmin, Admin, Instructor

Assigns a grade and optional feedback to a submission. Intended for instructor use.

**Path Parameters**

| Parameter      | Type  | Description          |
|----------------|-------|----------------------|
| `submissionId` | `int` | ID of the submission |

**Request Body** (`application/json`)

```json
{
  "grade": 85,
  "feedback": "Good work, but improve your conclusion."
}
```

| Field      | Type     | Required | Description                          |
|------------|----------|----------|--------------------------------------|
| `grade`    | `int`    | Yes      | Numeric grade awarded                |
| `feedback` | `string` | No       | Written feedback for the student     |

**Response `200 OK`** — Returns the updated `AssignmentSubmissionResponseDto`.

---

## Response Models

### `AssignmentSubmissionResponseDto`

| Field                              | Type                                   | Description                              |
|------------------------------------|----------------------------------------|------------------------------------------|
| `id`                               | `int`                                  | Submission ID                            |
| `assignmentId`                     | `int`                                  | ID of the related assignment             |
| `studentId`                        | `string`                               | ID of the student who submitted          |
| `textSubmission`                   | `string?`                              | Text answer provided by the student      |
| `submittedAt`                      | `datetime`                             | Timestamp of submission (UTC)            |
| `grade`                            | `int?`                                 | Grade awarded (`null` if not graded yet) |
| `feedback`                         | `string?`                              | Instructor feedback                      |
| `assignmentSubmissionAttachments`  | `AssignmentSubmissionAttachmentDto[]`  | List of attached files                   |

### `AssignmentSubmissionAttachmentDto`

| Field      | Type     | Description                           |
|------------|----------|---------------------------------------|
| `id`       | `Guid`   | Attachment ID                         |
| `fileName` | `string` | Original file name                    |
| `fileUrl`  | `string` | Public URL to download/view the file  |
| `type`     | `string` | MIME type (e.g. `application/pdf`)    |
