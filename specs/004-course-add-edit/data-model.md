# Data Model: Course Add / Edit Modal

**Feature**: `specs/004-course-add-edit/`
**Date**: 2026-05-02

---

## Updated Entity: `Course`

**File**: `src/app/models/course.ts`

| Field | Type | Source | Notes |
|---|---|---|---|
| `Id` | `number` | API response | PascalCase per backend convention |
| `Title` | `string` | API response | |
| `Description` | `string` | API response | |
| `ImageUrl` | `string` | API response | CDN URL; optional on create |
| `semster` | `string` | API response | Intentional typo from backend; string value ("Fall" / "Spring" / "Summer") |
| `Credit_Hour` | `number` | API response | |
| `IsPublished` | `boolean` | API response | |
| `LearningOutcomes` | `string` | API response | **NEW** — comma-separated string |
| `academicLevel` | `number` | API response | **NEW** — integer 1–5 |
| `departmentId` | `number` | API response | **NEW** — required for Edit; user-selected on Create |

---

## Form Model: `CourseFormData` (internal — not persisted)

Used by the Reactive Form inside `CourseAddEditComponent`. All fields map to `FormControl`.

| Field | Type | Validators | Notes |
|---|---|---|---|
| `title` | `string` | `required`, `minLength(5)` | Maps to `Course.Title` |
| `description` | `string` | `required` | Maps to `Course.Description` |
| `semster` | `number` | `required` | 1 = Fall, 2 = Spring, 3 = Summer |
| `academicLevel` | `number` | `required` | 1–5 |
| `credit_Hour` | `number` | `required`, `min(1)`, `max(10)` | Integer only |
| `learningOutcomes` | `string` | `required` | Textarea; sent as plain string |
| `departmentId` | `number` | `required` | Dropdown selection (Create) or pre-set (Edit) |

---

## New Entity: `CourseAddEditComponent` (runtime state)

| Property | Type | Description |
|---|---|---|
| `courseData` | `Course \| null` | `@Input()` — null = Create mode, set = Edit mode |
| `form` | `FormGroup` | Reactive form instance |
| `isSaving` | `boolean` | Controls Save button disabled + spinner state |
| `selectedFile` | `File \| null` | Raw file for FormData construction |
| `imagePreviewUrl` | `string \| null` | Base64 data URL for thumbnail preview |
| `departments` | `any[]` | List loaded from `AuthService.getDepartments()` |

---

## State Transitions

```
Modal closed
    │
    ▼ (Open: Create mode — courseData = null)
Form empty, departments loaded
    │
    ├─► User fills fields & selects file
    │       │
    │       ▼ (Save clicked, form.valid = true)
    │   isSaving = true → API POST → success
    │       │
    │       ▼
    │   Parent: reset filters, unshift(newCourse)
    │   Modal dismissed
    │
    └─► User clicks Cancel/×
            │ form.dirty?
            ├─ YES → SweetAlert2 "Discard changes?" → confirm → dismiss
            └─ NO  → dismiss immediately

    │ (Open: Edit mode — courseData provided)
    ▼
Form patched with courseData values
    │
    ├─► User edits fields; optionally selects new image
    │       │
    │       ▼ (Save clicked, form.valid = true)
    │   isSaving = true → API PUT → success
    │       │
    │       ▼
    │   Parent: courses[index] = updatedCourse
    │   Modal dismissed
    │
    └─► User clicks Escape → dismiss immediately (no confirmation)
```

---

## Validation Rules

| Rule | Field | Error Message |
|---|---|---|
| Required | All fields | "This field is required." |
| minLength(5) | `title` | "Title must be at least 5 characters long." |
| min(1) | `credit_Hour` | "Credit hours must be at least 1." |
| max(10) | `credit_Hour` | "Credit hours cannot exceed 10." |
| File size > 5 MB | `ImageFile` | "Image must be under 5 MB." |
| File type not JPEG/PNG/WebP | `ImageFile` | "Only JPEG, PNG, and WebP images are allowed." |
