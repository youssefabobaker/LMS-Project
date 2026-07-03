# Get Quizzes By Course — API Documentation

Returns all quizzes for a specific course.  
**The response shape differs depending on the caller's role:**

- **Instructor / Admin** → receives the standard quiz list (all quizzes, including inactive ones).  
- **Student** → receives only **active** quizzes, each enriched with the student's own submission status, score, and submission timestamp (when applicable).

---

## Endpoint

```
GET /api/quiz/course/{courseId}
```

| Property      | Value                          |
|---------------|--------------------------------|
| Method        | `GET`                          |
| URL           | `/api/quiz/course/{courseId}`  |
| Auth Required | ✅ Yes — Bearer Token          |
| Permission    | `Quiz:read`                    |
| Allowed Roles | `Student`, `Instructor`, `Admin`, `SuperAdmin` |

---

## URL Parameters

| Parameter  | Type      | Required | Description                      |
|------------|-----------|----------|----------------------------------|
| `courseId` | `integer` | ✅ Yes   | The ID of the course to query    |

---

## Request

No request body is needed — all parameters are passed in the URL.

### Headers

```
Authorization: Bearer <your_jwt_token>
```

---

## Response

### ✅ `200 OK`

The structure of each item in the array depends on the caller's role.

---

### 🎓 Student Response — `QuizForStudentResponseDto`

Returns an array of **active quizzes** for the course.  
Each item includes the standard quiz fields **plus** three additional fields that reflect the student's submission status for that quiz.

```json
[
  {
    "id": 3,
    "title": "Midterm Quiz — Chapter 3",
    "scheduledDate": "2026-06-15T09:00:00Z",
    "duration": "00:45:00",
    "description": "Covers topics from chapters 1–3.",
    "quizCode": "A1B2C3D4",
    "isActive": true,
    "totalMarks": 10.0,
    "isSubmitted": true,
    "score": 8,
    "submittedAt": "2026-06-15T10:30:00Z"
  },
  {
    "id": 5,
    "title": "Final Quiz — Chapter 6",
    "scheduledDate": "2026-07-01T09:00:00Z",
    "duration": "01:00:00",
    "description": "Covers all topics from the semester.",
    "quizCode": "E5F6G7H8",
    "isActive": true,
    "totalMarks": 15.0,
    "isSubmitted": false,
    "score": null,
    "submittedAt": null
  }
]
```

#### Student Response Fields

| Field           | Type              | Description                                                                 |
|-----------------|-------------------|-----------------------------------------------------------------------------|
| `id`            | `integer`         | Unique quiz ID                                                              |
| `title`         | `string`          | Display title of the quiz                                                   |
| `scheduledDate` | `string`          | ISO 8601 UTC date/time when the quiz is scheduled                           |
| `duration`      | `string`          | Duration of the quiz in `HH:mm:ss` format                                   |
| `description`   | `string`          | Quiz description                                                            |
| `quizCode`      | `string`          | Unique 8-character code used to start the quiz                              |
| `isActive`      | `boolean`         | Always `true` for students (only active quizzes are returned)               |
| `totalMarks`    | `number`          | Maximum possible marks for this quiz                                        |
| `isSubmitted`   | `boolean`         | `true` if the student has already submitted this quiz, `false` otherwise    |
| `score`         | `integer \| null` | The student's score. `null` if the quiz has **not** been submitted yet      |
| `submittedAt`   | `string \| null`  | ISO 8601 UTC timestamp of submission. `null` if not yet submitted           |

> **Key rule:** Check `isSubmitted` before reading `score` and `submittedAt` — both will be `null` for quizzes the student hasn't attempted.

---

### 🏫 Instructor / Admin Response — `QuizResponseDto`

Returns **all quizzes** for the course (active and inactive).  
The three student-specific fields (`isSubmitted`, `score`, `submittedAt`) are **not present** in this response.

```json
[
  {
    "id": 3,
    "title": "Midterm Quiz — Chapter 3",
    "scheduledDate": "2026-06-15T09:00:00Z",
    "duration": "00:45:00",
    "description": "Covers topics from chapters 1–3.",
    "quizCode": "A1B2C3D4",
    "isActive": true,
    "totalMarks": 10.0
  },
  {
    "id": 7,
    "title": "Draft Quiz (inactive)",
    "scheduledDate": "2026-08-01T09:00:00Z",
    "duration": "00:30:00",
    "description": "Not yet published.",
    "quizCode": "X9Y8Z7W6",
    "isActive": false,
    "totalMarks": 5.0
  }
]
```

#### Instructor / Admin Response Fields

| Field           | Type      | Description                                                    |
|-----------------|-----------|----------------------------------------------------------------|
| `id`            | `integer` | Unique quiz ID                                                 |
| `title`         | `string`  | Display title of the quiz                                      |
| `scheduledDate` | `string`  | ISO 8601 UTC date/time when the quiz is scheduled              |
| `duration`      | `string`  | Duration of the quiz in `HH:mm:ss` format                      |
| `description`   | `string`  | Quiz description                                               |
| `quizCode`      | `string`  | Unique 8-character code used to start the quiz                 |
| `isActive`      | `boolean` | Whether the quiz is currently active/published                 |
| `totalMarks`    | `number`  | Maximum possible marks for this quiz                          |

---

## Error Responses

### ❌ `401 Unauthorized` — Missing or invalid token

```json
{
  "message": "Unauthorized"
}
```

### ❌ `403 Forbidden` — Token is valid but role lacks the required permission

```json
{
  "message": "Forbidden"
}
```

### ❌ `404 Not Found` — No quizzes found for the given course

```json
{
  "message": "No quizzes found for course with id 99."
}
```

---

## Usage Examples

### JavaScript — `fetch` (Student)

```js
const courseId = 5;
const token    = localStorage.getItem('token');

const response = await fetch(`/api/quiz/course/${courseId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (response.ok) {
  const quizzes = await response.json();

  quizzes.forEach(quiz => {
    if (quiz.isSubmitted) {
      console.log(`${quiz.title}: scored ${quiz.score} / ${quiz.totalMarks} on ${new Date(quiz.submittedAt).toLocaleString()}`);
    } else {
      console.log(`${quiz.title}: not yet submitted`);
    }
  });
} else {
  console.error('Failed to fetch quizzes', response.status);
}
```

### Angular — `HttpClient` (Student)

```ts
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuizForStudent {
  id:            number;
  title:         string;
  scheduledDate: string;
  duration:      string;
  description:   string;
  quizCode:      string;
  isActive:      boolean;
  totalMarks:    number;
  // student-specific fields
  isSubmitted:   boolean;
  score:         number | null;
  submittedAt:   string | null;
}

export interface QuizResponse {
  id:            number;
  title:         string;
  scheduledDate: string;
  duration:      string;
  description:   string;
  quizCode:      string;
  isActive:      boolean;
  totalMarks:    number;
}

// ── Student usage ─────────────────────────────────────────────
getCourseQuizzesForStudent(courseId: number): Observable<QuizForStudent[]> {
  return this.http.get<QuizForStudent[]>(`/api/quiz/course/${courseId}`);
}

// ── Instructor / Admin usage ──────────────────────────────────
getCourseQuizzes(courseId: number): Observable<QuizResponse[]> {
  return this.http.get<QuizResponse[]>(`/api/quiz/course/${courseId}`);
}
```

---

## Notes

- The **same endpoint URL** is used by all roles. The backend automatically detects the caller's role from the JWT and returns the appropriate response shape.
- For **students**, only `isActive: true` quizzes are included. Inactive/draft quizzes are hidden.
- For **instructors and admins**, all quizzes (active and inactive) are returned so they can manage quiz visibility.
- `duration` is returned as a `string` in `HH:mm:ss` format — parse it as needed (e.g. `"00:45:00"` = 45 minutes).
- `totalMarks` is a `number` (can be a decimal). Treat it as `float`/`double` on the frontend.
- `submittedAt` is a UTC ISO 8601 string — use `new Date(quiz.submittedAt)` in JS/TS to convert to local time.
- This endpoint is cached for **5 minutes (300 s)**. Cache is invalidated automatically when a quiz is created, updated, deleted, or toggled.
