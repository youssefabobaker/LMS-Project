# Research: Department Management

**Feature**: `001-department-management`
**Branch**: `001-department-management`
**Date**: 2026-04-30

---

## Decision 1: Base API URL

- **Decision**: `https://localhost:7289/api/Department`
- **Rationale**: Confirmed directly from `auth.service.ts` line 28 which already
  calls this URL for `getDepartments()`. Matches the backend API docs
  (`/api/Department` base route).
- **Alternatives considered**: None — URL is documented and already in use.

---

## Decision 2: Existing `getDepartments()` in `AuthService`

- **Decision**: `AuthService.getDepartments()` MUST be preserved (not deleted) because
  `UserManagementComponent` still calls it. However, `DepartmentService` will define
  its own `getDepartments()` independently, pointing to the same URL. No refactoring
  of `AuthService` is in scope (Scope-Lock, Constitution Principle V).
- **Rationale**: Deleting `AuthService.getDepartments()` would break `UserManagementComponent`
  — an unrelated file. The Consultation Rule prohibits touching it without approval.
- **Alternatives considered**: Migrate `UserManagementComponent` to use `DepartmentService` —
  rejected (out of scope for this feature).

---

## Decision 3: Angular HTTP Pattern

- **Decision**: Use `HttpClient` injected into `DepartmentService` via constructor,
  returning `Observable<T>` for all methods. Match the exact pattern in `user.service.ts`.
- **Rationale**: Consistent with every other service in the project. No `signal`-based
  or promise-based patterns are used anywhere in the codebase.
- **Alternatives considered**: `HttpClient` with `toSignal()` — not used in project.

---

## Decision 4: Route Guard Pattern

- **Decision**: Use `permissionGuard` with `data: { permission: 'dept:read' }` on the
  new route, consistent with the `roles` and `users` routes in `app.routes.ts`.
- **Rationale**: The `permissionGuard` already exists at
  `src/app/core/guards/permission.guard.ts` and is the established project pattern.
- **Alternatives considered**: `canActivate` with a custom guard — unnecessary duplication.

---

## Decision 5: Remove Confirmation Pattern

- **Decision**: Use `Swal.fire({ icon: 'warning', showCancelButton: true })` before
  DELETE, matching the `sweetalert2` usage in `user-management.component.ts`.
- **Rationale**: `SweetAlert2` is already in `package.json`. The `.then(result => { if
  (result.isConfirmed) { ... } })` pattern is the established project standard.
- **Alternatives considered**: Native `window.confirm()` — rejected; not consistent
  with the existing premium Lumina UX.

---

## Decision 6: No `isActive` / Status field

- **Decision**: `Department` model contains only `id: number` and `title: string`.
  No status badge, no `isActive` property, no Enable/Disable toggle button.
  All records returned by `GET /api/Department` are displayed; removed records
  simply disappear after `DELETE`.
- **Rationale**: Clarification session Q1 (2026-04-30) resolved this explicitly.
  The backend GET response only returns `{ id, title }`.
- **Alternatives considered**: Client-side `isActive` flag — rejected in clarification.

---

## Decision 7: Retry Button Implementation

- **Decision**: A `loadFailed: boolean` flag on the component controls rendering of
  the empty-state + retry button. The retry button calls `loadDepartments()` directly
  (same method used on `ngOnInit`), which re-shows the spinner.
- **Rationale**: Clarification Q2 (2026-04-30) confirmed background re-call with
  spinner, no page navigation.
- **Alternatives considered**: Router navigation reload — rejected.

---

## Decision 8: Form State Machine

- **Decision**: Component maintains two flags:
  - `showForm: boolean` — controls form card visibility
  - `editingDeptId: number | null` — `null` = Add mode, non-null = Edit mode
  - Clicking "Create New Department" always calls `resetForm()` which sets
    `editingDeptId = null` and clears form fields (switches to Add mode).
  - Clicking Edit on any row calls `editDept(dept)` which sets `editingDeptId`,
    patches the form, and sets `showForm = true` — regardless of current form state.
- **Rationale**: Matches the `editingUserId` pattern in `UserManagementComponent`.
  Clarification Q4 and Q5 (2026-04-30) confirmed this switching behaviour.
- **Alternatives considered**: Router-based modal — over-engineered for this feature.
