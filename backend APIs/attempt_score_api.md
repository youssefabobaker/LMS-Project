# Quiz Attempt Score — API Documentation

> **Base URL:** `https://<your-domain>/api/QuizAttempts`
> **Auth:** Bearer JWT token required on all endpoints.

---

## Overview

Two endpoints allow authorized users to **manually update the score** of a submitted quiz attempt by its ID.

| Endpoint | Permission | Update limit |
|----------|----------------|--------------|
| `PATCH /attempts/{attemptId}/score/finalize` | `AttemptScore:finalize` permission | **One time only** — locked after first successful call |
| `PATCH /attempts/{attemptId}/score` | `AttemptScore:update` permission | **Unlimited** times |

---

## 1. Finalize Attempt Score *(one-time)*

Allows an **Instructor** to review and set the score of a specific quiz attempt **exactly once**.
After a successful update the attempt is permanently locked — calling this endpoint again for the same attempt returns `409 Conflict`.

### Request

```
PATCH /api/QuizAttempts/attempts/{attemptId}/score/finalize
```

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| `attemptId` | URL path | `int` | ✅ | ID of the quiz attempt to update |
| `Score` | Request body (JSON) | `int` | ✅ | New score — must be ≥ 0 |

**Headers**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**
```json
{
  "score": 8
}
```

### Responses

#### ✅ `200 OK` — Score finalized successfully
```json
{
  "attemptId": 42,
  "studentFullName": "Ahmed Hassan",
  "studentId": "abc-123",
  "score": 8,
  "quizTotalMarks": 10.0,
  "submittedAt": "2026-06-24T10:30:00Z",
  "studentAnswers": [
    {
      "questionText": "What is polymorphism?",
      "studentChoice": "The ability of an object to take many forms",
      "correctChoice": "The ability of an object to take many forms",
      "isCorrect": true
    },
    {
      "questionText": "What does OOP stand for?",
      "studentChoice": "Object Oriented Procedure",
      "correctChoice": "Object Oriented Programming",
      "isCorrect": false
    }
  ]
}
```

#### ❌ `409 Conflict` — Score already finalized (second call for the same attempt)
```json
{
  "statusCode": 409,
  "message": "The score for attempt with ID 42 has already been finalized and cannot be updated again."
}
```

#### ❌ `404 Not Found` — Attempt does not exist
```json
{
  "statusCode": 404,
  "message": "Quiz Attempt with this Id : 42 is Not Found."
}
```

#### ❌ `403 Forbidden` — Caller does not have the `AttemptScore:finalize` permission (e.g. a student or admin calling this endpoint)

#### ❌ `400 Bad Request` — Score is negative
```json
{
  "statusCode": 400,
  "message": "Score must be a non-negative value."
}
```

---

## 2. Update Attempt Score *(unlimited)*

Allows an **Admin** or **SuperAdmin** to override the score of a specific quiz attempt **as many times as needed**. No lock is applied.

### Request

```
PATCH /api/QuizAttempts/attempts/{attemptId}/score
```

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| `attemptId` | URL path | `int` | ✅ | ID of the quiz attempt to update |
| `Score` | Request body (JSON) | `int` | ✅ | New score — must be ≥ 0 |

**Headers**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**
```json
{
  "score": 9
}
```

### Responses

#### ✅ `200 OK` — Score updated successfully
```json
{
  "attemptId": 42,
  "studentFullName": "Ahmed Hassan",
  "studentId": "abc-123",
  "score": 9,
  "quizTotalMarks": 10.0,
  "submittedAt": "2026-06-24T10:30:00Z",
  "studentAnswers": [
    {
      "questionText": "What is polymorphism?",
      "studentChoice": "The ability of an object to take many forms",
      "correctChoice": "The ability of an object to take many forms",
      "isCorrect": true
    }
  ]
}
```

#### ❌ `404 Not Found` — Attempt does not exist
```json
{
  "statusCode": 404,
  "message": "Quiz Attempt with this Id : 42 is Not Found."
}
```

#### ❌ `403 Forbidden` — Caller does not have the `AttemptScore:update` permission (e.g. an instructor or student calling this endpoint)

#### ❌ `400 Bad Request` — Score is negative

---

## Response Fields Reference

| Field | Type | Description |
|-------|------|-------------|
| `attemptId` | `int` | ID of the quiz attempt |
| `studentFullName` | `string` | Student's display name (falls back to email if name not set) |
| `studentId` | `string` | Student's identity ID |
| `score` | `int` | The updated score |
| `quizTotalMarks` | `double` | Maximum possible marks for this quiz |
| `submittedAt` | `DateTime` | When the student submitted the quiz (UTC) |
| `studentAnswers` | `array` | Per-question breakdown — see below |
| `studentAnswers[].questionText` | `string` | The question that was asked |
| `studentAnswers[].studentChoice` | `string` | The answer the student selected |
| `studentAnswers[].correctChoice` | `string` | The correct answer |
| `studentAnswers[].isCorrect` | `bool` | Whether the student's choice was correct |

---

## Permission Reference

| Permission claim | Granted to |
|-----------------|-----------|
| `AttemptScore:finalize` | Instructor, SuperAdmin |
| `AttemptScore:update` | Admin, SuperAdmin |

> **Note:** A user without the required permission receives `403 Forbidden`. The JWT token must be obtained from the `/api/Auth/login` endpoint and passed as `Authorization: Bearer <token>`.

---

## Frontend Integration Notes

- Always check the HTTP status code **before** reading the response body.
- For endpoint `finalize`: after a `200 OK` response, **disable or hide the finalize button** in the UI for that attempt — any subsequent call will return `409`.
- The `isScoreFinalized` flag is **not** exposed in the response DTO intentionally; the `409` status code is the signal to lock the UI.
- Use endpoint `score` (unlimited) only in admin panels where repeated corrections are expected.
