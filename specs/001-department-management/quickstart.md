# Quickstart: Department Management

**Feature**: `001-department-management`
**Date**: 2026-04-30

---

## Prerequisites

- Angular dev server running: `npm run dev` (or `ng serve`)
- Backend running at `https://localhost:7289`
- Authenticated user with a JWT containing `dept:read` permission

---

## Validation Steps (in order)

### Step 1 — Route resolves

1. Log in and navigate to `/dashboard/departments`
2. ✅ Expect: Department Management page loads (no 404, no blank screen)
3. ✅ Expect: Loading spinner appears then disappears
4. ✅ Expect: Table displays rows from `GET /api/Department`

### Step 2 — Create a department

1. Click "Create New Department" (visible only if `dept:add` granted)
2. Leave the Title field empty → click "Save Department"
3. ✅ Expect: Validation error shown; no API call made
4. Type a unique title → click "Save Department"
5. ✅ Expect: Success toast; form closes; new row appears in table

### Step 3 — Edit a department

1. Hover over any row → click the Edit (pencil) icon
2. ✅ Expect: Form opens pre-filled with the department's title
3. Change the title → click "Save Department"
4. ✅ Expect: Success toast; form closes; updated title in table

### Step 4 — Switch edit context mid-form

1. Open the form in edit mode for Department A
2. Click Edit on Department B (without closing form)
3. ✅ Expect: Form stays open; fields immediately show Department B's title

### Step 5 — Create while in edit mode

1. Open edit form for any department
2. Click "Create New Department" in the page header
3. ✅ Expect: Form stays open; fields are cleared; header reads "Add Department"

### Step 6 — Remove a department

1. Hover over any row → click the Remove (block) icon
2. ✅ Expect: SweetAlert2 confirmation dialog appears
3. Click Cancel → ✅ Expect: No API call; row remains
4. Click Remove again → Confirm
5. ✅ Expect: Success toast; row disappears immediately from table

### Step 7 — Permission enforcement

1. Log in as a user WITHOUT `dept:add` permission
2. ✅ Expect: "Create New Department" button is not rendered
3. Log in as a user WITHOUT `dept:update` permission
4. ✅ Expect: Edit icon button is not rendered in any row
5. Log in as a user WITHOUT `dept:delete` permission
6. ✅ Expect: Remove icon button is not rendered in any row

### Step 8 — Retry on load failure

1. Stop the backend server
2. Navigate to `/dashboard/departments`
3. ✅ Expect: Error toast appears; empty-state message and Retry button are shown
4. Restart the backend → click Retry
5. ✅ Expect: Spinner re-appears; table populates on success

### Step 9 — Courses isolation check

1. Inspect `department-management.component.ts` source
2. ✅ Expect: No import, injection, or method call referencing Course or CourseService
3. Inspect `department.service.ts`
4. ✅ Expect: No Course-related method exists
