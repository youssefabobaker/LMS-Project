# Quickstart: Course View — Cycle 1 Manual Test Guide

**Feature**: Course View — Cycle 1 (Card Grid Hub)
**Date**: 2026-05-01
**Prerequisites**: Backend running at `https://localhost:7289`, Angular dev server running via `ng serve`.

---

## Test Scenario 1 — View Course List as Admin

1. Log in with a user that has **`Course:readAll`** permission.
2. Navigate to `/dashboard/courses` via the sidebar link.
3. ✅ **Expect**: Course cards render in a responsive grid. Each card shows: title, description (≤3 lines), image or placeholder, Published/Draft badge, Semester chip, Academic Level chip, Credit Hours chip.
4. ✅ **Expect**: The sidebar link "Course Management" is visible.

---

## Test Scenario 2 — View Course List as Department User

1. Log in with a user that has **`Course:read`** only (no `Course:readAll`).
2. Navigate to `/dashboard/courses`.
3. ✅ **Expect**: Only courses belonging to the user's own department appear.
4. ✅ **Expect**: Admin-only courses from other departments are NOT visible.

---

## Test Scenario 3 — Toggle Published Status

1. Log in with a user that has **`Course:update`**.
2. Find a published course card.
3. Click the **Published** status badge.
4. ✅ **Expect**: Badge immediately changes to **Draft** (no page reload).
5. Reload the page.
6. ✅ **Expect**: The badge persists as **Draft** (backend state confirmed).
7. Click the badge again.
8. ✅ **Expect**: Badge returns to **Published**.

---

## Test Scenario 4 — Toggle Badge (Permission Check)

1. Log in with a user that does NOT have `Course:update`.
2. View a course card.
3. ✅ **Expect**: The status badge is displayed but NOT clickable.
4. ✅ **Expect**: Edit, Assessments icons are NOT visible on the card.

---

## Test Scenario 5 — Delete a Course

1. Log in with a user that has **`Course:delete`**.
2. Click the **Delete** (trash) icon on any course card.
3. ✅ **Expect**: A SweetAlert2 confirmation dialog appears.
4. Click **Cancel**.
5. ✅ **Expect**: No change; the course card remains.
6. Click **Delete** again and then **Confirm** in the dialog.
7. ✅ **Expect**: The course card disappears from the grid immediately (no reload).
8. ✅ **Expect**: A success toast appears.

---

## Test Scenario 6 — Navigation Icons (Placeholder Routes)

1. Log in with a user that has `Course:update`, `Course:add`, `Course:enrollInstructor`.
2. On a course card, click the **Edit** icon.
3. ✅ **Expect**: URL changes briefly to `/dashboard/courses/{id}/edit` then immediately redirects back to `/dashboard/courses`.
4. Click the **Assessments** icon.
5. ✅ **Expect**: Same redirect behaviour back to `/dashboard/courses`.
6. Click the **Enrollment** icon.
7. ✅ **Expect**: Same redirect behaviour.
8. Click the top-level **Create Course** button.
9. ✅ **Expect**: Redirects back to `/dashboard/courses`.

---

## Test Scenario 7 — Permission Gating of Icons

1. Log in with a user that has `Course:read` ONLY.
2. ✅ **Expect**: No Edit, Assessments, Enrollment, or Delete icons are visible.
3. ✅ **Expect**: No "Create Course" button is visible.
4. ✅ **Expect**: Status badge is read-only.

---

## Test Scenario 8 — Empty State

1. Use an account whose department has no courses.
2. Navigate to `/dashboard/courses`.
3. ✅ **Expect**: An empty-state message is displayed (e.g., "No courses found").
4. ✅ **Expect**: No loading spinner remains after the response arrives.

---

## Test Scenario 9 — Error State & Retry

1. Stop the backend server.
2. Navigate to `/dashboard/courses`.
3. ✅ **Expect**: An error message is shown with a **Retry** button.
4. Restart the backend.
5. Click **Retry**.
6. ✅ **Expect**: Course cards load successfully.
