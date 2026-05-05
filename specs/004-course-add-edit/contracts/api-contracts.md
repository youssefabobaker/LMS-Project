# API Contracts: Course Add / Edit Modal

**Feature**: `specs/004-course-add-edit/`
**Date**: 2026-05-02
**Base URL**: `https://localhost:7289/api/Course`

---

## POST /api/Course/{departmentId}

**Operation**: Create a new course under the specified department.
**Permission**: `Course:add`
**Content-Type**: `multipart/form-data` (set automatically by browser — do NOT set manually)

### Path Parameter
| Parameter | Type | Required | Description |
|---|---|---|---|
| `departmentId` | `integer` | Yes | ID of the department selected by the user in the form |

### Request Body (FormData fields)
| Field | Type | Required | Validation |
|---|---|---|---|
| `title` | `string` | Yes | min 5 chars |
| `description` | `string` | Yes | |
| `semster` | `integer` | Yes | 1=Fall, 2=Spring, 3=Summer |
| `academicLevel` | `integer` | Yes | 1–5 |
| `credit_Hour` | `integer` | Yes | 1–10 |
| `learningOutcomes` | `string` | Yes | |
| `ImageFile` | `File` | Optional | JPEG/PNG/WebP, max 5 MB |

### Success Response
- **Status**: `200 OK` or `201 Created`
- **Body**: The newly created `Course` object (same shape as GET response)

### Error Responses
| Status | Meaning |
|---|---|
| `400 Bad Request` | Validation failure (missing required field, file too large) |
| `401 Unauthorized` | Token missing or expired |
| `403 Forbidden` | User lacks `Course:add` permission |

---

## PUT /api/Course/{departmentId}/{id}

**Operation**: Update an existing course.
**Permission**: `Course:update`
**Content-Type**: `multipart/form-data` (set automatically by browser)

### Path Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `departmentId` | `integer` | Yes | Department the course belongs to (from existing course object) |
| `id` | `integer` | Yes | ID of the course being edited |

### Request Body (FormData fields)
Same as POST above. `ImageFile` is **optional** — omit entirely if the user did not select a new image.

### Success Response
- **Status**: `200 OK`
- **Body**: The updated `Course` object

### Error Responses
| Status | Meaning |
|---|---|
| `400 Bad Request` | Validation failure |
| `401 Unauthorized` | Token missing or expired |
| `403 Forbidden` | User lacks `Course:update` permission |
| `404 Not Found` | Course with given `id` does not exist |
