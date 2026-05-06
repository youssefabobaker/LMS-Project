# Data Model: Course Enrollment Modal

**Feature**: 006-course-enrollment-modal
**Date**: 2026-05-05

---

## Entities

### 1. `EnrolledUser`

Represents an instructor currently assigned to a specific course. Displayed in the enrolled instructors table.

```typescript
// src/app/models/enrolled-user.ts

export interface EnrolledUser {
  id: string;          // GUID — unique user identifier, used for unenroll DELETE call
  firstName: string;
  lastName: string;
  email: string;       // Displayed in the table per clarification Q2
}
```

**Derived display field** (computed in template): `fullName = firstName + ' ' + lastName`

**Validation rules**:
- `id` must be a non-empty GUID string
- `email` must be present

---

### 2. `User` (existing — `src/app/models/user.ts`)

Represents a system user as returned by `UserService.getUsers()`. Used as the source for the instructor dropdown population.

```typescript
// Existing — no change needed
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isDisabled: boolean;
  academicYear?: string;
  departmentId: number;
  roles: string[];     // ← Used to filter for role === 'Instructor' (case-insensitive)
}
```

---

### 3. `EnrollRequest` (API payload — not a stored model)

```typescript
// Inline in service call, not a separate interface
{ userId: string }   // GUID — body of POST /api/Course/{courseId}/users
```

---

## State Transitions

### Enrollment Flow

```
[Modal opens with courseId]
  → forkJoin(getEnrolledUsers, getUsers)
  → enrolledUsers[] populated
  → allInstructors[] = users filtered by role 'Instructor'
  → availableInstructors (getter) = allInstructors minus enrolledUsers
  → [table renders enrolled list; dropdown renders availableInstructors]
  → [user selects from dropdown, clicks Enroll]
  → POST /api/Course/{courseId}/users { userId }
       SUCCESS → push new EnrolledUser to enrolledUsers[] in-place
                → getter recomputes, removing them from dropdown
                → success toast shown
       FAILURE → inline error message shown; state unchanged
```

### Unenroll Flow

```
[User clicks delete icon on a row]
  → confirmingUnenrollId = user.id   (shows inline Confirm / Cancel)
  → [user clicks Confirm]
  → DELETE /api/Course/{courseId}/users/{userId}
       SUCCESS → filter enrolledUsers[] to remove the entry in-place
                → getter recomputes, adding them back to dropdown
                → success toast shown
                → confirmingUnenrollId = null
       FAILURE → inline error message shown
                → confirmingUnenrollId = null
  → [user clicks Cancel]
  → confirmingUnenrollId = null   (row returns to normal)
```

---

## API Endpoints

### `GET /api/Course/{courseId}/users` — Enrolled Users Response

```json
[
  { "id": "guid-1", "firstName": "Ahmed", "lastName": "Hassan", "email": "ahmed@lumina.edu" },
  { "id": "guid-2", "firstName": "Sara",  "lastName": "Ali",    "email": "sara@lumina.edu" }
]
```

### `POST /api/Course/{courseId}/users` — Enroll Request Body

```json
{ "userId": "guid-string" }
```

Expected success response: `201 Created` (body may be empty or text — use `responseType: 'text'`).

### `DELETE /api/Course/{courseId}/users/{userId}` — Unenroll

No request body. Expected success response: `204 No Content`.

---

## Component State Map

| Property | Type | Purpose |
|---|---|---|
| `courseId` | `number` | Course context, passed via `open()` |
| `courseName` | `string` | Displayed in modal header |
| `enrolledUsers` | `EnrolledUser[]` | Live list; mutated in-place |
| `allInstructors` | `User[]` | Full instructor-filtered user list; set once on load |
| `availableInstructors` | getter → `User[]` | Excludes already-enrolled; recomputes automatically |
| `selectedUserId` | `string \| null` | Bound to dropdown; reset after enroll |
| `confirmingUnenrollId` | `string \| null` | Drives inline confirm row state |
| `isLoading` | `boolean` | Spinner on initial data load |
| `loadError` | `string` | Error banner on failed load |
| `enrollError` | `string` | Inline error near Enroll button |
| `unenrollError` | `string` | Inline error near affected row |
| `canEnroll` | `boolean` | `Course:enrollInstructor` permission |
| `canUnenroll` | `boolean` | `Course:unenrollInstructor` permission |
