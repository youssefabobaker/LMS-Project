# Get Student Course Grades — API Documentation

Returns a list of a student's grades across **all submitted quizzes** within a specific course.  
Intended for use on a student's course progress/grades page, or by a super-admin reviewing student performance.

---

## Endpoint

```
GET /api/quiz-attempts/courses/{courseId}/students/{userId}/grades
```

| Property      | Value                                                     |
|---------------|-----------------------------------------------------------|
| Method        | `GET`                                                     |
| URL           | `/api/quiz-attempts/courses/{courseId}/students/{userId}/grades` |
| Auth Required | ✅ Yes — Bearer Token                                     |
| Permission    | `AttemptScore:readByCourse`                               |
| Allowed Roles | `Student`, `SuperAdmin`                                   |

---

## URL Parameters

| Parameter  | Type      | Required | Description                                    |
|------------|-----------|----------|------------------------------------------------|
| `courseId` | `integer` | ✅ Yes   | The ID of the course to retrieve grades for    |
| `userId`   | `string`  | ✅ Yes   | The ID (GUID) of the student                   |

> **Note:** A student should only request their **own** `userId`. SuperAdmin may query any student's ID.

---

## Request

No request body is needed — all parameters are passed in the URL.

### Headers

```
Authorization: Bearer <your_jwt_token>
```

---

## Response

### ✅ `200 OK` — Grades returned successfully

Returns a JSON **array**. Each element represents one submitted quiz attempt within the course.

```json
[
  {
    "attemptId": 14,
    "quizTitle": "Midterm Quiz — Chapter 3",
    "quizCode": "CS301-MID",
    "score": 8,
    "totalMarks": 10.0,
    "submittedAt": "2026-06-15T10:30:00Z"
  },
  {
    "attemptId": 27,
    "quizTitle": "Final Quiz — Chapter 6",
    "quizCode": "CS301-FIN",
    "score": 6,
    "totalMarks": 10.0,
    "submittedAt": "2026-06-28T14:00:00Z"
  }
]
```

### Response Fields

| Field         | Type       | Description                                         |
|---------------|------------|-----------------------------------------------------|
| `attemptId`   | `integer`  | Unique ID of the quiz attempt                       |
| `quizTitle`   | `string`   | Display title of the quiz                           |
| `quizCode`    | `string`   | Short quiz code (e.g. `CS301-MID`)                  |
| `score`       | `integer`  | Student's score on this quiz                        |
| `totalMarks`  | `number`   | Maximum possible marks for this quiz                |
| `submittedAt` | `string`   | ISO 8601 UTC timestamp of when the quiz was submitted |

> If the student has **not submitted any quizzes** in this course, an **empty array `[]`** is returned with status `200`.

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

---

## Usage Examples

### JavaScript — `fetch`

```js
const courseId = 5;
const userId   = 'a1b2c3d4-0000-0000-0000-000000000001';
const token    = localStorage.getItem('token');

const response = await fetch(
  `/api/quiz-attempts/courses/${courseId}/students/${userId}/grades`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

if (response.ok) {
  const grades = await response.json();
  // grades is an array of { attemptId, quizTitle, quizCode, score, totalMarks, submittedAt }
  grades.forEach(g => {
    console.log(`${g.quizTitle}: ${g.score} / ${g.totalMarks}`);
  });
} else {
  console.error('Failed to fetch grades', response.status);
}
```

### Angular — `HttpClient`

```ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentCourseGrade {
  attemptId:   number;
  quizTitle:   string;
  quizCode:    string;
  score:       number;
  totalMarks:  number;
  submittedAt: string;
}

// In your service:
getStudentCourseGrades(courseId: number, userId: string): Observable<StudentCourseGrade[]> {
  return this.http.get<StudentCourseGrade[]>(
    `/api/quiz-attempts/courses/${courseId}/students/${userId}/grades`
  );
}
```

---

## Notes

- Only **submitted** quiz attempts are included. In-progress (started but not submitted) attempts are excluded.
- `totalMarks` is a `number` (can be a decimal, e.g. `10.5`). Treat it as a `float`/`double` on the frontend.
- `submittedAt` is a UTC ISO 8601 string — use `new Date(g.submittedAt)` in JS to convert to local time.
- The array order reflects the order attempts were stored; sort client-side by `submittedAt` if a specific order is needed.
