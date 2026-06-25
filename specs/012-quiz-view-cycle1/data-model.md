# Data Model: Quiz View – Cycle 1

**Feature**: 012-quiz-view-cycle1  
**Date**: 2026-06-19  
**Source**: `backend APIs/quiz_question_api.md` + Clarification Session 2026-06-19

---

## Entities

### QuizListItemDto  
*Returned by `GET /api/Quiz/course/{courseId}` (list endpoint)*

| Field           | Type     | Required | Notes                                                   |
|----------------|----------|----------|---------------------------------------------------------|
| `id`           | `number` | ✅       | Quiz ID                                                 |
| `title`        | `string` | ✅       | Quiz title — displayed as card heading                  |
| `description`  | `string` | ✅       | Short description — displayed beneath title             |
| `scheduledDate`| `string` | ✅       | ISO 8601 datetime string — formatted for display        |
| `duration`     | `string` | ✅       | `HH:mm:ss` format — converted to `"X min"` for display |
| `quizCode`     | `string` | ✅       | 8-character unique code — displayed in monospace style  |

> **Note**: `isActive` and `totalMarks` are NOT in this response. They are Cycle 2 / detail-only fields.

---

### QuizCreateUpdateDto  
*Sent as body to `POST /api/Quiz/course/{courseId}`*

| Field           | Type      | Required | Notes                                          |
|----------------|-----------|----------|------------------------------------------------|
| `id`           | `number \| null` | ❌ | `null` = create, numeric value = update   |
| `title`        | `string`  | ✅       | Must not be blank                              |
| `description`  | `string`  | ✅       | Must not be blank                              |
| `scheduledDate`| `string`  | ✅       | ISO 8601 datetime string                       |
| `duration`     | `string`  | ✅       | `HH:mm:ss` format, must not be `"00:00:00"`   |
| `totalMarks`   | `number`  | ✅       | Must be > 0                                    |
| `isActive`     | `boolean` | ✅       | Active state — not displayed on list card but required by API |

---

## File Location

```
src/app/models/quiz.model.ts
```

Following the project model convention (all existing models live in `src/app/models/`, not `src/app/core/models/`).

---

## TypeScript Interface Definitions

```typescript
// src/app/models/quiz.model.ts

/** Returned by GET /api/Quiz/course/{courseId} */
export interface QuizListItemDto {
  id: number;
  title: string;
  description: string;
  scheduledDate: string;   // ISO 8601 datetime string
  duration: string;        // "HH:mm:ss"
  quizCode: string;        // 8-character unique code
}

/** Sent to POST /api/Quiz/course/{courseId} */
export interface QuizCreateUpdateDto {
  id: number | null;       // null = create; number = update
  title: string;
  description: string;
  scheduledDate: string;   // ISO 8601 datetime string
  duration: string;        // "HH:mm:ss"
  totalMarks: number;
  isActive: boolean;
}
```

---

## Duration Conversion Logic

```typescript
/**
 * Converts "HH:mm:ss" to total minutes as a display string.
 * e.g. "01:30:00" → "90 min", "00:00:00" → "0 min"
 */
function parseDurationToMinutes(duration: string): string {
  const parts = duration.split(':');
  if (parts.length !== 3) return duration;
  const hours   = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2], 10) || 0;
  const total   = hours * 60 + minutes + Math.round(seconds / 60);
  return `${total} min`;
}
```

---

## State Transitions (relevant to Cycle 1)

| Action          | API Call                                   | Local List Change             |
|-----------------|--------------------------------------------|-------------------------------|
| Load quizzes    | `GET /api/Quiz/course/{courseId}`          | Replace `quizzesList`         |
| Create quiz     | `POST /api/Quiz/course/{courseId}` (id=null) | `unshift()` new item        |
| Update quiz     | `POST /api/Quiz/course/{courseId}` (id=N)  | Replace item at index         |
| Delete quiz     | `DELETE /api/Quiz/{id}`                    | `filter()` out deleted item   |

> **Toggle-active** (`PATCH /api/Quiz/{id}/toggle-active`) is **Cycle 2 only** — not in Cycle 1 scope.
