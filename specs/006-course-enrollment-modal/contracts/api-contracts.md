# API Contracts: Course Enrollment Modal

**Feature**: 006-course-enrollment-modal
**Date**: 2026-05-05

---

## Endpoint 1 — Get Enrolled Users

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `/api/Course/{courseId}/users` |
| Permission | `Course:read` or `Course:readAll` |
| Response (200) | `EnrolledUser[]` (see Data Model) |
| Response (empty) | `[]` — triggers empty-state UI |
| Error | 4xx/5xx → show `loadError` banner |

---

## Endpoint 2 — Enroll User

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `/api/Course/{courseId}/users` |
| Permission | `Course:enrollInstructor` |
| Request Body | `{ "userId": "GUID-string" }` — JSON |
| Response (201) | Empty body or text — treat as success |
| Error (409 / 4xx) | Instructor already enrolled or invalid — show `enrollError` inline |
| Error (5xx) | Server failure — show `enrollError` inline |

---

## Endpoint 3 — Unenroll User

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `/api/Course/{courseId}/users/{userId}` |
| Permission | `Course:unenrollInstructor` |
| Request Body | None |
| Response (204) | No Content — treat as success |
| Error (4xx/5xx) | Show `unenrollError` inline |

---

## Service Method Signatures

```typescript
// To be added to CourseService

getEnrolledUsers(courseId: number): Observable<EnrolledUser[]>

enrollUser(courseId: number, userId: string): Observable<any>

unenrollUser(courseId: number, userId: string): Observable<any>
```
