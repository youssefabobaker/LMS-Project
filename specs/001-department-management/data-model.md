# Data Model: Department Management

**Feature**: `001-department-management`
**Date**: 2026-04-30
**Source**: `spec.md` Key Entities + `research.md` Decision 6

---

## Entity: Department

Represents an organizational unit within the Lumina LMS.
All records returned by `GET /api/Department` are considered active/visible.

### TypeScript Interface

```typescript
// src/app/models/department.ts
export interface Department {
  id: number;      // Server-generated unique identifier
  title: string;   // Department name — required, unique (server-enforced)
}
```

### Constraints

| Field | Type | Required | Unique | Notes |
|-------|------|----------|--------|-------|
| `id` | `number` | Server-assigned | Yes | Auto-incremented integer |
| `title` | `string` | Yes | Yes (server) | Non-null, non-blank (trimmed client-side) |

### Excluded Fields (Phase 1)

| Field | Reason Excluded |
|-------|----------------|
| `isActive` / `status` | Not returned by GET; all records treated as active |
| `managerId` / `headOfDepartment` | Deferred to Phase 2 |

---

## Request DTOs

### DepartmentCreateRequest

```typescript
interface DepartmentCreateRequest {
  title: string;   // Required. Validated: trimmed, non-empty.
}
```

### DepartmentUpdateRequest

```typescript
interface DepartmentUpdateRequest {
  title: string;   // Required. Validated: trimmed, non-empty.
}
```

---

## State Transitions

```
[Not Exists]
     │
     │  POST /api/Department  (dept:add)
     ▼
  [Active / Visible in list]
     │
     │  PUT /api/Department/{id}  (dept:update)
     ▼
  [Active / title updated]
     │
     │  DELETE /api/Department/{id}  (dept:delete) + Swal confirm
     ▼
  [Soft-Deleted / Absent from GET response]
     │
     │  (No restore/enable endpoint in Phase 1)
     ▼
  [Invisible to UI — permanently removed for Phase 1]
```

---

## Component State Properties

| Property | Type | Purpose |
|----------|------|---------|
| `departments` | `Department[]` | Loaded list from API |
| `isLoading` | `boolean` | Controls spinner visibility |
| `loadFailed` | `boolean` | Controls empty-state + retry button |
| `showForm` | `boolean` | Controls form card visibility |
| `editingDeptId` | `number \| null` | `null` = Add mode; non-null = Edit mode |
| `deptForm` | `FormGroup` | Reactive form with `title` control |

---

## Form Validation Rules

| Field | Validators | Error Message |
|-------|-----------|---------------|
| `title` | `Validators.required` + custom trim check | "Department title is required" |

> Trim check: `title.trim().length === 0` → treat as invalid even if `Validators.required` passes.
