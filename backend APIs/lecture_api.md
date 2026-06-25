# Lecture API Documentation

> **Base URL:** `/api/lecture`
> **Authentication:** All endpoints require a valid **JWT Bearer Token** in the `Authorization` header.

---

## Table of Contents

1. [Get All Lectures by Course](#1-get-all-lectures-by-course)
2. [Get Lecture by ID](#2-get-lecture-by-id)
3. [Create Lecture](#3-create-lecture)
4. [Update Lecture](#4-update-lecture)
5. [Delete Lecture](#5-delete-lecture)
6. [Toggle Lecture Active Status](#6-toggle-lecture-active-status)
7. [Join Live Lecture](#7-join-live-lecture)

---

## 1. Get All Lectures by Course

Retrieves a list of all lectures belonging to a specific course.

- **Method:** `GET`
- **Route:** `/api/lecture/course/{courseId}`
- **Permission Required:** `Course:read`
- **Cache:** Response is cached for **300 seconds**

### Path Parameters

| Parameter  | Type  | Required | Description              |
|------------|-------|----------|--------------------------|
| `courseId` | `int` | ✅ Yes   | The ID of the course     |

### Request

No request body needed.

### Success Response

- **Status:** `200 OK`
- **Body:** Array of `LectureResponse`

```json
[
  {
    "id": 1,
    "title": "Introduction to Algorithms",
    "description": "Overview of basic algorithm concepts.",
    "scheduledAt": "2026-06-25T10:00:00",
    "isActive": true,
    "createdByName": "Dr. Ahmed Ali",
    "courseId": 5
  }
]
```

### Response Fields

| Field           | Type       | Description                                   |
|-----------------|------------|-----------------------------------------------|
| `id`            | `int`      | Unique identifier of the lecture              |
| `title`         | `string`   | Title of the lecture                          |
| `description`   | `string`   | Short description of the lecture              |
| `scheduledAt`   | `DateTime` | Scheduled date and time (ISO 8601 format)     |
| `isActive`      | `bool`     | Whether the lecture is currently active       |
| `createdByName` | `string`   | Full name of the instructor who created it    |
| `courseId`      | `int`      | ID of the parent course                       |

---

## 2. Get Lecture by ID

Retrieves the details of a single lecture by its ID within a specific course.

- **Method:** `GET`
- **Route:** `/api/lecture/{lectureId}/course/{courseId}`
- **Permission Required:** `Course:read`
- **Cache:** Response is cached for **300 seconds**

### Path Parameters

| Parameter   | Type  | Required | Description               |
|-------------|-------|----------|---------------------------|
| `courseId`  | `int` | ✅ Yes   | The ID of the course      |
| `lectureId` | `int` | ✅ Yes   | The ID of the lecture     |

### Request

No request body needed.

### Success Response

- **Status:** `200 OK`
- **Body:** Single `LectureResponse` object

```json
{
  "id": 1,
  "title": "Introduction to Algorithms",
  "description": "Overview of basic algorithm concepts.",
  "scheduledAt": "2026-06-25T10:00:00",
  "isActive": true,
  "createdByName": "Dr. Ahmed Ali",
  "courseId": 5
}
```

> See [Response Fields](#response-fields) in endpoint #1 for field descriptions.

---

## 3. Create Lecture

Creates a new lecture under a specific course. The authenticated user is automatically recorded as the creator.

- **Method:** `POST`
- **Route:** `/api/lecture/course/{courseId}`
- **Permission Required:** `Lecture:create`
- **Cache Invalidation:** Clears all `/api/lecture*` cached responses on success

### Path Parameters

| Parameter  | Type  | Required | Description              |
|------------|-------|----------|--------------------------|
| `courseId` | `int` | ✅ Yes   | The ID of the course     |

### Request Body

`Content-Type: application/json`

```json
{
  "title": "Introduction to Algorithms",
  "description": "Overview of basic algorithm concepts.",
  "scheduledAt": "2026-06-25T10:00:00"
}
```

| Field         | Type       | Required | Description                                |
|---------------|------------|----------|--------------------------------------------|
| `title`       | `string`   | ✅ Yes   | Title of the lecture                       |
| `description` | `string`   | ✅ Yes   | Description of the lecture content         |
| `scheduledAt` | `DateTime` | ✅ Yes   | Scheduled date/time in ISO 8601 format     |

### Success Response

- **Status:** `201 Created`
- **Header:** `Location: /api/lecture/{lectureId}/course/{courseId}`
- **Body:** The newly created `LectureResponse` object

```json
{
  "id": 10,
  "title": "Introduction to Algorithms",
  "description": "Overview of basic algorithm concepts.",
  "scheduledAt": "2026-06-25T10:00:00",
  "isActive": false,
  "createdByName": "Dr. Ahmed Ali",
  "courseId": 5
}
```

---

## 4. Update Lecture

Updates the details of an existing lecture. Replaces title, description, and scheduled time.

- **Method:** `PUT`
- **Route:** `/api/lecture/{lectureId}/course/{courseId}`
- **Permission Required:** `Lecture:update`
- **Cache Invalidation:** Clears all `/api/lecture*` cached responses on success

### Path Parameters

| Parameter   | Type  | Required | Description               |
|-------------|-------|----------|---------------------------|
| `courseId`  | `int` | ✅ Yes   | The ID of the course      |
| `lectureId` | `int` | ✅ Yes   | The ID of the lecture     |

### Request Body

`Content-Type: application/json`

```json
{
  "title": "Advanced Algorithms",
  "description": "Covers graph algorithms and dynamic programming.",
  "scheduledAt": "2026-06-28T14:00:00"
}
```

| Field         | Type       | Required | Description                            |
|---------------|------------|----------|----------------------------------------|
| `title`       | `string`   | ✅ Yes   | Updated title of the lecture           |
| `description` | `string`   | ✅ Yes   | Updated description                    |
| `scheduledAt` | `DateTime` | ✅ Yes   | Updated scheduled date/time (ISO 8601) |

### Success Response

- **Status:** `204 No Content`
- No response body.

---

## 5. Delete Lecture

Permanently deletes a lecture from the system.

- **Method:** `DELETE`
- **Route:** `/api/lecture/{lectureId}/course/{courseId}`
- **Permission Required:** `Lecture:delete`
- **Cache Invalidation:** Clears all `/api/lecture*` cached responses on success

### Path Parameters

| Parameter   | Type  | Required | Description               |
|-------------|-------|----------|---------------------------|
| `courseId`  | `int` | ✅ Yes   | The ID of the course      |
| `lectureId` | `int` | ✅ Yes   | The ID of the lecture     |

### Request

No request body needed.

### Success Response

- **Status:** `204 No Content`
- No response body.

---

## 6. Toggle Lecture Active Status

Toggles the `IsActive` flag of a lecture (active ↔ inactive). Use this to publish or unpublish a lecture without deleting it.

- **Method:** `PUT`
- **Route:** `/api/lecture/{lectureId}/course/{courseId}/toggle-active`
- **Permission Required:** `Lecture:update`
- **Cache Invalidation:** Clears all `/api/lecture*` cached responses on success

### Path Parameters

| Parameter   | Type  | Required | Description               |
|-------------|-------|----------|---------------------------|
| `courseId`  | `int` | ✅ Yes   | The ID of the course      |
| `lectureId` | `int` | ✅ Yes   | The ID of the lecture     |

### Request

No request body needed.

### Success Response

- **Status:** `204 No Content`
- No response body.

> **Note:** Call this endpoint again to reverse the status. The current active state can be checked via [Get Lecture by ID](#2-get-lecture-by-id).

---

## 7. Join Live Lecture

Allows a student to join a live lecture session. Returns all the information needed to connect to the **Jitsi Meet** video room.

- **Method:** `GET`
- **Route:** `/api/lecture/{lectureId}/join`
- **Permission Required:** `Lecture:join`
- **Cache:** Not cached

### Path Parameters

| Parameter   | Type  | Required | Description                       |
|-------------|-------|----------|-----------------------------------|
| `lectureId` | `int` | ✅ Yes   | The ID of the lecture to join     |

### Request

No request body needed.

### Success Response

- **Status:** `200 OK`
- **Body:** `LectureJoinResponse`

```json
{
  "lectureId": 1,
  "roomName": "course-5-lecture-1-abc123",
  "jitsiDomain": "meet.jit.si",
  "displayName": "Mohamed Walid",
  "jitsiUrl": "https://meet.jit.si/course-5-lecture-1-abc123",
  "moderatorEmail": "instructor@example.com"
}
```

### Response Fields

| Field            | Type     | Description                                                     |
|------------------|----------|-----------------------------------------------------------------|
| `lectureId`      | `int`    | ID of the lecture being joined                                  |
| `roomName`       | `string` | The unique Jitsi meeting room name                              |
| `jitsiDomain`    | `string` | The Jitsi server domain (e.g. `meet.jit.si`)                    |
| `displayName`    | `string` | The display name for the current user in the meeting            |
| `jitsiUrl`       | `string` | Full URL to open the Jitsi room (`https://{domain}/{roomName}`) |
| `moderatorEmail` | `string` | Email of the instructor/moderator for the meeting               |

#### How to Embed Jitsi

Use the `jitsiUrl` to embed or redirect students directly into the live session:

```javascript
// Option 1 — Redirect
window.location.href = response.jitsiUrl;

// Option 2 — Embed via Jitsi External API
const api = new JitsiMeetExternalAPI(response.jitsiDomain, {
  roomName: response.roomName,
  userInfo: {
    displayName: response.displayName,
  },
  parentNode: document.getElementById("jitsi-container"),
});
```

---

## Permissions Summary

| Endpoint                    | Required Permission  |
|-----------------------------|----------------------|
| Get All Lectures by Course  | `Course:read`        |
| Get Lecture by ID           | `Course:read`        |
| Create Lecture              | `Lecture:create`     |
| Update Lecture              | `Lecture:update`     |
| Delete Lecture              | `Lecture:delete`     |
| Toggle Active Status        | `Lecture:update`     |
| Join Live Lecture           | `Lecture:join`       |

---

## Error Responses

All endpoints follow a standard error response format:

| Status Code | Meaning                                      |
|-------------|----------------------------------------------|
| `400`       | Bad Request — invalid or missing input data  |
| `401`       | Unauthorized — missing or invalid JWT token  |
| `403`       | Forbidden — insufficient permissions         |
| `404`       | Not Found — lecture or course doesn't exist  |
| `500`       | Internal Server Error                        |

```json
{
  "statusCode": 404,
  "message": "Lecture with id 99 was not found."
}
```
