# Data Model: Course View — Cycle 1

**Feature**: Course View — Cycle 1 (Card Grid Hub)
**Date**: 2026-05-01

---

## Enumerations

### `Semester`

Maps numeric values returned by the API to human-readable semester labels.

| Value | Name | Display Label |
|-------|------|---------------|
| 1 | `Fall` | Fall |
| 2 | `Spring` | Spring |
| 3 | `Summer` | Summer |

> **Note**: The backend API uses the typo `semster` (not `semester`) in its JSON payload. The TypeScript model must replicate this exact field name to match the API contract.

---

### `AcademicLevel`

Maps numeric values to academic year labels.

| Value | Name | Display Label |
|-------|------|---------------|
| 1 | `FirstYear` | 1st Year |
| 2 | `SecondYear` | 2nd Year |
| 3 | `ThirdYear` | 3rd Year |
| 4 | `FourthYear` | 4th Year |
| 5 | `FifthYear` | 5th Year |

---

## Interfaces

### `Course`

The primary entity for this cycle. Returned by `GET /api/Course` and `GET /api/Course/GetAll`.

| Field | TypeScript Type | Required | Notes |
|-------|----------------|----------|-------|
| `id` | `number` | ✅ | Unique identifier; used in all action API calls |
| `title` | `string` | ✅ | Displayed on card; truncated to 2 lines via CSS |
| `description` | `string` | ✅ | Displayed on card; truncated to 3 lines via CSS |
| `imageUrl` | `string` | ❌ | May be empty or null; placeholder shown if absent |
| `semster` | `Semester` (enum) | ✅ | Note the intentional API typo `semster` |
| `credit_Hour` | `number` | ✅ | Displayed as a meta chip on the card |
| `isPublished` | `boolean` | ✅ | Drives the Published/Draft badge; mutated optimistically on toggle |
| `academicLevel` | `AcademicLevel` (enum) | ✅ | Displayed as a meta chip on the card |

**UI-only runtime field** (not from API):

| Field | TypeScript Type | Purpose |
|-------|----------------|---------|
| *(none for Cycle 1)* | — | No UI-only fields needed; instructor/enrollment data is Cycle 3 scope |

---

## State Transitions

### `isPublished` Toggle

```
Published (true) ──[Course:update click]──► Draft (false)
Draft (false)    ──[Course:update click]──► Published (true)
```

- Optimistic: UI flips immediately.
- On API error: UI reverts and shows error notification.

### Course Lifecycle (Cycle 1 scope only)

```
[Exists in API]
      │
      ├── isPublished: false  →  Draft badge (red/muted)
      ├── isPublished: true   →  Published badge (green/cyan)
      └── [Deleted]           →  Removed from in-memory array
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `id` | Must be a positive integer; used directly in API path |
| `semster` | Must map to a known `Semester` enum value (1–3); display "Unknown" if unrecognised |
| `academicLevel` | Must map to a known `AcademicLevel` enum value (1–5); display "Unknown" if unrecognised |
| `imageUrl` | If empty string or null/undefined, show the placeholder UI block |
| `credit_Hour` | Expected to be a positive integer; no frontend validation needed (read-only display) |

---

## File Location

```text
src/app/models/course.ts
```

> Per the project convention, model interfaces live under `src/app/models/` (not `src/app/core/models/`). This is consistent with `department.ts`, `role.ts`, and `user.ts` already in that directory.
