# API Contracts: Quiz View – Cycle 1

**Source**: `backend APIs/quiz_question_api.md`  
**Date**: 2026-06-19

---

## Endpoints Consumed in Cycle 1

### GET /api/Quiz/course/{courseId}
**Permission**: `Quiz:read`  
**Purpose**: Load quiz list when Quiz tab is first activated.

**Request**: No body. Path param `courseId: int`.

**Response `200 OK`**:
```json
[
  {
    "id": 1,
    "title": "Midterm Exam",
    "scheduledDate": "2026-06-25T10:00:00",
    "duration": "01:30:00",
    "description": "Covers chapters 1-5",
    "quizCode": "A3F9BC12"
  }
]
```
**Front-end handling**:
- `404` → treat as empty list (no error state)
- Other errors → SweetAlert2 error with Retry

---

### POST /api/Quiz/course/{courseId}
**Permission**: `Quiz:addOrUpdate`  
**Purpose**: Create (id=null) or update (id=number) a quiz.  
⚠️ **A new `quizCode` is generated on every update.**

**Request body**:
```json
{
  "id": null,
  "title": "Final Exam",
  "description": "Full semester coverage",
  "scheduledDate": "2026-07-10T09:00:00",
  "duration": "02:00:00",
  "totalMarks": 100.0,
  "isActive": true
}
```

**Response `200 OK`**: Returns the created/updated quiz object.

**Front-end handling**:
- Pre-save (edit mode only): SweetAlert2 warning that Quiz Code will be regenerated
- On success: update local list; emit event; close modal; success toast
- On error: keep modal open; SweetAlert2 error alert

---

### DELETE /api/Quiz/{id}
**Permission**: `Quiz:delete`  
**Purpose**: Permanently remove a quiz.

**Request**: No body. Path param `id: int`.

**Response `200 OK` or `204 No Content`**: No body.

**Front-end handling**:
- Before call: SweetAlert2 confirmation dialog
- On success: `filter()` local array; success toast
- On error: no change to local state; SweetAlert2 error alert

---

## Endpoints Deferred to Cycle 2

| Endpoint | Purpose |
|----------|---------|
| `GET /api/Quiz/{id}` | Quiz detail — full data incl. `isActive`, `totalMarks`, questions |
| `PATCH /api/Quiz/{id}/toggle-active` | Toggle active status |
| All `POST /api/Question/*` endpoints | Question management |
