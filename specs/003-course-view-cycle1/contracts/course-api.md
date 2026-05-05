# API Contracts: Course View — Cycle 1

**Service**: `CourseService` (`src/app/core/services/course.service.ts`)
**Base URL**: `https://localhost:7289/api/Course`
**Auth**: All endpoints require a valid Bearer token via the `TokenInterceptor`.

---

## Endpoint 1 — Get Department-Scoped Courses

**Method**: `GET`
**URL**: `/api/Course`
**Permission Required**: `Course:read`
**Used By**: Users WITHOUT `Course:readAll`

### Response

```json
[
  {
    "id": 1,
    "title": "Introduction to Algorithms",
    "description": "A foundational course on algorithm design.",
    "imageUrl": "https://example.com/images/algo.jpg",
    "semster": 1,
    "credit_Hour": 3,
    "isPublished": true,
    "academicLevel": 2
  }
]
```

### Service Method

```typescript
getCourses(): Observable<Course[]>
```

---

## Endpoint 2 — Get All Courses (Admin)

**Method**: `GET`
**URL**: `/api/Course/GetAll`
**Permission Required**: `Course:readAll`
**Used By**: Users WITH `Course:readAll`

### Response

Same shape as Endpoint 1 but returns courses across all departments.

### Service Method

```typescript
getAllCourses(): Observable<Course[]>
```

---

## Endpoint 3 — Toggle Course Status

**Method**: `PUT`
**URL**: `/api/Course/{id}/Toggle_Status`
**Permission Required**: `Course:update`
**Body**: Empty (`{}`)

### Response

`200 OK` (no body content expected by the frontend)

### Error Cases

| Status | Handling |
|--------|----------|
| 404 | Show error notification; revert optimistic update |
| 401/403 | Token interceptor handles refresh or redirect |
| 500 | Show generic error notification; revert optimistic update |

### Service Method

```typescript
toggleCourseStatus(id: number): Observable<void>
```

---

## Endpoint 4 — Delete Course (Soft Delete)

**Method**: `DELETE`
**URL**: `/api/Course/{id}`
**Permission Required**: `Course:delete`

### Response

`200 OK` or `204 No Content`

### Error Cases

| Status | Handling |
|--------|----------|
| 404 | Show error; course may already be deleted — remove from list anyway |
| 401/403 | Token interceptor handles |
| 500 | Show generic error; do NOT remove from list |

### Service Method

```typescript
deleteCourse(id: number): Observable<void>
```

---

## Component-Level API Selection Logic

```
ngOnInit():
  if hasPermission('Course:readAll')
    → call getAllCourses()
  else
    → call getCourses()
```

This logic lives in the component (`CourseViewComponent`), not in the service.

---

## Future Cycle Endpoint Stubs (NOT implemented in Cycle 1)

| Cycle | Endpoint | Description |
|-------|----------|-------------|
| Cycle 2 | `POST /api/Course` | Create course (multipart/form-data) |
| Cycle 2 | `PUT /api/Course/{id}` | Update course (multipart/form-data) |
| Cycle 3 | `GET /api/Course/{id}/assessments` | List assessments |
| Cycle 4 | `POST /api/Course/{id}/users` | Enroll instructor |
| Cycle 4 | `DELETE /api/Course/{id}/users/{userId}` | Unenroll instructor |
