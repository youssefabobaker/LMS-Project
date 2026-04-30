# ?? EduAI System — API Documentation

> **Base URL:** `/api`
> **Authentication:** Bearer Token (JWT) — include in `Authorization` header as `Bearer <token>`
> **Content-Type:** `application/json` unless stated otherwise

---

## ?? Table of Contents

- [??? Department Controller](#?-department-controller)
  - [Get All Departments](#1-get-all-departments)
  - [Get Department By ID](#2-get-department-by-id)
  - [Create Department](#3-create-department)
  - [Update Department](#4-update-department)
  - [Delete Department](#5-delete-department)
  - [Assign Course to Department](#6-assign-course-to-department)
  - [Remove Course from Department](#7-remove-course-from-department)
- [?? Course Controller](#-course-controller)
  - [Get Courses (by user department)](#1-get-courses-by-user-department)
  - [Get All Courses](#2-get-all-courses)
  - [Get Course By ID](#3-get-course-by-id)
  - [Create Course](#4-create-course)
  - [Update Course](#5-update-course)
  - [Toggle Course Status](#6-toggle-course-status)
  - [Add Assessments](#7-add-assessments)
  - [Update Assessments](#8-update-assessments)
  - [Delete Course](#9-delete-course)
  - [Enroll User in Course](#10-enroll-user-in-course)
  - [Unenroll User from Course](#11-unenroll-user-from-course)
  - [Get Enrolled Users in Course](#12-get-enrolled-users-in-course)
  - [Get User Enrolled Courses](#13-get-user-enrolled-courses)
- [?? Enums Reference](#-enums-reference)
- [? Error Responses](#-error-responses)

---

# ??? Department Controller

**Base Route:** `/api/Department`
> ?? Authorization is currently **not enforced** on this controller (commented out).

---

## 1. Get All Departments

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/Department` |
| **Auth Required** | ? No |
| **Permission** | None |
| **Cache** | ? No |

### ? Response `200 OK`
```json
[
  {
    "id": 1,
    "title": "Computer Science"
  },
  {
    "id": 2,
    "title": "Software Engineering"
  }
]
```

---

## 2. Get Department By ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/Department/{id}` |
| **Auth Required** | ? No |
| **Permission** | None |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `int` | ? | The department ID |

### ? Response `200 OK`
```json
{
  "id": 1,
  "title": "Computer Science"
}
```

---

## 3. Create Department

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/api/Department` |
| **Auth Required** | ? No |
| **Permission** | None |
| **Content-Type** | `application/json` |

### ?? Request Body
```json
{
  "title": "Computer Science"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | `string` | ? | Non-null |

### ? Response `201 Created`

Returns the created department object + `Location` header pointing to `/api/Department/{id}`.

```json
{
  "id": 3,
  "title": "Computer Science"
}
```

---

## 4. Update Department

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/api/Department/{id}` |
| **Auth Required** | ? No |
| **Permission** | None |
| **Content-Type** | `application/json` |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `int` | ? | The department ID to update |

### ?? Request Body
```json
{
  "title": "Updated Department Name"
}
```

| Field | Type | Required |
|-------|------|----------|
| `title` | `string` | ? |

### ? Response `200 OK`

```json
{}
```

---

## 5. Delete Department

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/api/Department/{id}` |
| **Auth Required** | ? No |
| **Permission** | None |
| **Note** | ??? Soft Delete — record is **not physically removed** |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `int` | ? | The department ID to delete |

### ? Response `200 OK`

```json
{}
```

---

## 6. Assign Course to Department

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/api/Department/{departmentId}/AssignCourse/{courseId}` |
| **Auth Required** | ? No |
| **Permission** | None |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | `int` | ? | The target department ID |
| `courseId` | `int` | ? | The course ID to assign |

### ? Response `200 OK`

```json
{}
```

---

## 7. Remove Course from Department

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/api/Department/{departmentId}/RemoveCourse/{courseId}` |
| **Auth Required** | ? No |
| **Permission** | None |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | `int` | ? | The target department ID |
| `courseId` | `int` | ? | The course ID to remove |

### ? Response `200 OK`

```json
{}
```

---
---

# ?? Course Controller

**Base Route:** `/api/Course`
> ?? All endpoints require a valid **Bearer Token** and a specific **Permission claim**.

---

## 1. Get Courses (by user department)

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/Course` |
| **Auth Required** | ? Yes |
| **Permission** | `Course:read` |
| **Cache** | ? 300 seconds |
| **Note** | Returns courses scoped to the **authenticated user's department** |

### ? Response `200 OK`
```json
[
  {
    "id": 1,
    "title": "Algorithms",
    "description": "Study of algorithms and complexity",
    "imageUrl": "https://cdn.example.com/algo.jpg",
    "semster": "Fall",
    "credit_Hour": 3,
    "isPublished": true,
    "learningOutcomes": "Understand sorting, searching, graph algorithms"
  }
]
```

---

## 2. Get All Courses

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/Course/All` |
| **Auth Required** | ? Yes |
| **Permission** | `Course:readAll` |
| **Cache** | ? 300 seconds |
| **Note** | Returns **all courses** across all departments (Admin/Instructor level) |

### ? Response `200 OK`

Same structure as **Get Courses** above (array of `CourseResponseDto`).

---

## 3. Get Course By ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/Course/{Courseid}/FromDepartment/{departmentId}` |
| **Auth Required** | ? Yes |
| **Permission** | `Course:read` |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Courseid` | `int` | ? | The course ID |
| `departmentId` | `int` | ? | The department the course belongs to |

### ? Response `200 OK`
```json
{
  "id": 1,
  "title": "Algorithms",
  "description": "Study of algorithms and complexity",
  "imageUrl": "https://cdn.example.com/algo.jpg",
  "semster": "Fall",
  "credit_Hour": 3,
  "isPublished": true,
  "learningOutcomes": "Understand sorting, searching, graph algorithms",
  "assesment": [
    {
      "assType": 1,
      "percentageWeight": 30.0,
      "isMandatory": true,
      "hours": 2
    }
  ]
}
```

---

## 4. Create Course

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/api/Course/{departmentId}` |
| **Auth Required** | ? Yes |
| **Permission** | `Course:add` |
| **Content-Type** | `multipart/form-data` |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | `int` | ? | The department to create the course under |

### ?? Form-Data Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | `string` | ? | Non-null |
| `description` | `string` | ? | Non-null |
| `semster` | `int` | ? | `1` = Fall, `2` = Spring, `3` = Summer |
| `credit_Hour` | `int` | ? | |
| `learningOutcomes` | `string` | ? | Non-null |
| `academicLevel` | `int` | ? | `1`–`5` (see [Enums Reference](#-enums-reference)) |
| `ImageFile` | `file` | ? | Image file (jpg, png, etc.) |

### ? Response `201 Created`

Returns the created `CourseResponseDto` + `Location` header pointing to `/api/Course/{Courseid}/FromDepartment/{departmentId}`.

```json
{
  "id": 5,
  "title": "Data Structures",
  "description": "Introduction to data structures",
  "imageUrl": "https://cdn.example.com/ds.jpg",
  "semster": "Fall",
  "credit_Hour": 3,
  "isPublished": false,
  "learningOutcomes": "Understand stacks, queues, trees"
}
```

---

## 5. Update Course

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/api/Course/{departmentId}/{id}` |
| **Auth Required** | ? Yes |
| **Permission** | `Course:update` |
| **Content-Type** | `multipart/form-data` |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | `int` | ? | The department the course belongs to |
| `id` | `int` | ? | The course ID to update |

### ?? Form-Data Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | `string` | ? | |
| `description` | `string` | ? | |
| `semster` | `int` | ? | `1`–`3` |
| `credit_Hour` | `int` | ? | |
| `learningOutcomes` | `string` | ? | |
| `academicLevel` | `int` | ? | `1`–`5` |
| `ImageFile` | `file` | ? Optional | Only provide if changing image |

### ? Response `200 OK`

```json
{}
```

---

## 6. Toggle Course Status

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/api/Course/{CourseId}/Toggle_Status` |
| **Auth Required** | ? Yes |
| **Permission** | `Course:update` |
| **Note** | Toggles `IsPublished` between `true` / `false` |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `CourseId` | `int` | ? | The course ID |

### ? Response `200 OK`

```json
{}
```

---

## 7. Add Assessments

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/api/Course/{CourseId}/AddAssesment` |
| **Auth Required** | ? Yes |
| **Permission** | `Course:add` |
| **Content-Type** | `application/json` |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `CourseId` | `int` | ? | The course ID |

### ?? Request Body
```json
[
  {
    "assType": 1,
    "percentageWeight": 30.0,
    "isMandatory": true,
    "hours": 2
  },
  {
    "assType": 5,
    "percentageWeight": 20.0,
    "isMandatory": false,
    "hours": 1
  }
]
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `assType` | `int` | ? | `0`–`5` (see [AssTypes Enum](#assessment-type-asstype)) |
| `percentageWeight` | `double` | ? | Weight percentage |
| `isMandatory` | `bool` | ? | |
| `hours` | `int` | ? | Duration in hours |

### ? Response `200 OK`

Returns the updated course with assessments.

---

## 8. Update Assessments

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Endpoint** | `/api/Course/{CourseId}/UpdateAssesment` |
| **Auth Required** | ? Yes |
| **Permission** | `Course:update` |
| **Content-Type** | `application/json` |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `CourseId` | `int` | ? | The course ID |

### ?? Request Body

Same structure as **Add Assessments** above.

### ? Response `200 OK`

```json
{}
```

---

## 9. Delete Course

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/api/Course/{id}` |
| **Auth Required** | ? Yes |
| **Permission** | `Course:delete` |
| **Note** | ??? Soft Delete — record is **not physically removed** |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `int` | ? | The course ID to delete |

### ? Response `200 OK`

```json
{}
```

---

## 10. Enroll User in Course

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/api/Course/{courseId}/users` |
| **Auth Required** | ? Yes |
| **Permission** | `Course:enrollInstructor` |
| **Content-Type** | `application/json` |
| **Note** | Enrollment is recorded with the ID of the authenticated user as `enrolledBy` |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `courseId` | `int` | ? | The course ID |

### ?? Request Body
```json
{
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `string` (GUID) | ? | The ID of the user to enroll |

### ? Response `201 Created`

Returns the enrollment record + `Location` header pointing to `/api/Course/{courseId}/users`.

```json
{
  "id": 10,
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "courseId": 5,
  "courseTitle": "Algorithms",
  "enrolledAt": "2026-04-23T10:00:00Z",
  "enrolledBy": "admin-user-guid"
}
```

---

## 11. Unenroll User from Course

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Endpoint** | `/api/Course/{courseId}/users/{userId}` |
| **Auth Required** | ? Yes |
| **Permission** | `Course:unenrollInstructor` |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `courseId` | `int` | ? | The course ID |
| `userId` | `string` (GUID) | ? | The user ID to unenroll |

### ? Response `204 No Content`

---

## 12. Get Enrolled Users in Course

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/Course/{courseId}/users` |
| **Auth Required** | ? Yes |
| **Permission** | `Course:read` |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `courseId` | `int` | ? | The course ID |

### ? Response `200 OK`
```json
[
  {
    "id": 10,
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "courseId": 5,
    "courseTitle": "Algorithms",
    "enrolledAt": "2026-04-23T10:00:00Z",
    "enrolledBy": "admin-user-guid"
  }
]
```

---

## 13. Get User Enrolled Courses

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/api/Course/users/{userId}/courses` |
| **Auth Required** | ? Yes |
| **Permission** | `Course:read` |

### ?? Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | `string` (GUID) | ? | The user ID |

### ? Response `200 OK`

Array of `CourseResponseDto`:
```json
[
  {
    "id": 1,
    "title": "Algorithms",
    "description": "Study of algorithms and complexity",
    "imageUrl": "https://cdn.example.com/algo.jpg",
    "semster": "Fall",
    "credit_Hour": 3,
    "isPublished": true,
    "learningOutcomes": "Understand sorting, searching, graph algorithms"
  }
]
```

---
---

# ?? Enums Reference

## Semester (`semster`)

| Value | Name | Description |
|-------|------|-------------|
| `1` | `Fall` | First Term |
| `2` | `Spring` | Second Term |
| `3` | `Summer` | Third Term (Makeup / GPA Improvement) |

---

## Academic Level (`academicLevel`)

| Value | Name |
|-------|------|
| `1` | First Year |
| `2` | Second Year |
| `3` | Third Year |
| `4` | Fourth Year |
| `5` | Fifth Year |

---

## Assessment Type (`assType`)

| Value | Name | Description |
|-------|------|-------------|
| `0` | `Default` | Not specified |
| `1` | `Final` | Final exam |
| `2` | `Lab` | Lab work |
| `3` | `Project` | Course project |
| `4` | `Quiz` | In-class quiz |
| `5` | `Midterm` | Midterm exam |

---

## Permissions Reference

| Permission Constant | Value | Used On |
|---------------------|-------|---------|
| `GetCourse` | `Course:read` | Get courses, get enrolled users, get user courses |
| `GetAllCourses` | `Course:readAll` | Get all courses |
| `AddCourse` | `Course:add` | Create course, add assessments |
| `UpdateCourse` | `Course:update` | Update course, toggle status, update assessments |
| `DeleteCourse` | `Course:delete` | Delete course |
| `EnrollInstructor` | `Course:enrollInstructor` | Enroll user in course |
| `UnenrollInstructor` | `Course:unenrollInstructor` | Unenroll user from course |

---

# ? Error Responses

All error responses follow the same structure:

```json
{
  "status": 404,
  "message": "Department with id 99 was not found"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| `400 Bad Request` | Validation failed or bad input |
| `401 Unauthorized` | Missing or invalid Bearer token |
| `403 Forbidden` | Valid token but insufficient permissions |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Duplicate resource (e.g., department title already exists) |
| `500 Internal Server Error` | Unexpected server error |
