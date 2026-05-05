# Data Model: Course Assessment Modal

**Feature**: 005-course-assessment-modal  
**Date**: 2026-05-04

---

## Entities

### 1. `Assessment`

Represents one graded component of a course.

```typescript
// src/app/models/assessment.ts

export interface Assessment {
  assType: number;           // integer — unique per course; acts as identity key (clarification Q1)
  percentageWeight: number;  // decimal 0–100; sum of all per course MUST NOT exceed 100
  isMandatory: boolean;      // whether students must attempt this component
  hours: number;             // positive integer; allocated time for this component
}
```

**Validation rules**:
- `assType` MUST match one of the codes returned by `GET /api/Course/assessment-types`
- `percentageWeight` MUST be > 0 and the course total MUST NOT exceed 100
- `hours` MUST be a positive integer (≥ 1)
- Only one `Assessment` per `assType` per course (type is the unique key)

---

### 2. `AssessmentType`

A named category fetched from the server used to populate the type dropdown.

```typescript
export interface AssessmentType {
  value: number;   // integer code sent to / returned from the API (maps to assType)
  name: string;    // display label shown in UI (e.g. "Final", "Quiz", "Lab")
}
```

**Notes**:
- Types are fetched once per modal open and cached in component state for that session.
- The UI always displays `name`; `value` is used for API payloads and identity lookups.

---

### 3. `CourseAssessmentSummary` (computed, not persisted)

Aggregate view maintained in component state.

```typescript
// Not a stored interface — derived at runtime by the component
interface CourseAssessmentSummary {
  courseId: number;
  courseName: string;
  assessments: Assessment[];  // ordered as returned by API
  totalWeight: number;        // sum of all percentageWeight values (computed)
}
```

---

## State Transitions

### Add Flow

```
[Modal opens]
  → fetchAssessments(courseId) + fetchAssessmentTypes()
  → [list rendered, totalWeight displayed]
  → [user clicks "Add Assessment"]
  → [collapsible add-form revealed above list]
  → [user fills form: type (filtered), weight, mandatory, hours]
  → [guard: totalWeight + newWeight ≤ 100?]
       YES → POST → success → push to local array, recalculate total, collapse form
       NO  → block submit, show inline error "Total course weight cannot exceed 100%"
  → [POST fails] → show inline error, keep form open
```

### Edit Flow

```
[User clicks Edit on a row]
  → row expands inline into editable fields (weight, mandatory, hours)
  → assType shown as read-only label (identity key, not editable)
  → [guard: (totalWeight - oldWeight) + newWeight ≤ 100?]
       YES → PUT → success → replace in local array, recalculate total, collapse row
       NO  → block submit, show inline error
  → [PUT fails] → show inline error, keep row in edit mode
```

---

## Validation Rules Summary

| Field | Rule |
|-------|------|
| `assType` | Required; must be from the types list; must not already exist in the course (add only) |
| `percentageWeight` | Required; must be > 0; course total must not exceed 100 |
| `hours` | Required; must be a positive integer (≥ 1) |
| `isMandatory` | Required boolean; defaults to `false` |

---

## API Payload Shapes

### GET `/api/Course/{courseId}/assessments` — Response

```json
[
  { "assType": 1, "percentageWeight": 30.0, "isMandatory": true, "hours": 2 },
  { "assType": 2, "percentageWeight": 50.0, "isMandatory": true, "hours": 3 }
]
```

### GET `/api/Course/assessment-types` — Response

```json
[
  { "value": 1, "name": "Final" },
  { "value": 2, "name": "Midterm" },
  { "value": 3, "name": "Quiz" },
  { "value": 4, "name": "Lab" }
]
```

### POST `/api/Course/{courseId}/AddAssesment` — Request body (array)

```json
[
  { "assType": 3, "percentageWeight": 20.0, "isMandatory": false, "hours": 1 }
]
```

### PUT `/api/Course/{courseId}/UpdateAssesment` — Request body (array)

```json
[
  { "assType": 3, "percentageWeight": 15.0, "isMandatory": true, "hours": 1 }
]
```

> ⚠️ Although the API accepts arrays, the UI sends exactly one object per call (research decision 8).
