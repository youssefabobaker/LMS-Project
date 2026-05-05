# Research: Course View — Cycle 1

**Feature**: Course View — Cycle 1 (Card Grid Hub)
**Date**: 2026-05-01
**Phase**: 0 — Pre-design research

---

## Decision 1: API Endpoint Selection Strategy

**Decision**: The component will select its data-fetching method based on the `Course:readAll` permission check at runtime.

- If `Course:readAll` → call `GET /api/Course/GetAll` (admin-scoped, returns all courses across all departments)
- If `Course:read` only → call `GET /api/Course` (department-scoped, returns courses belonging to the user's department)

**Rationale**: Confirmed by Clarification Q1. This approach keeps the UI seamless (no toggle required) and ensures each user type sees the appropriate data scope without any extra backend changes.

**Alternatives Considered**:
- Single endpoint for all users — rejected because the scoped endpoint is insufficient for admins who need cross-department visibility.
- UI toggle ("My Department" / "All Courses") — rejected per Clarification Q1 (increases UI complexity unnecessarily).

---

## Decision 2: Placeholder Route Behavior

**Decision**: Sub-routes for future cycles (`/dashboard/courses/:id/edit`, `/dashboard/courses/:id/assessments`, `/dashboard/courses/:id/enrollment`, and `/dashboard/courses/new/edit`) will be registered in `app.routes.ts` as Angular routes with a `redirectTo: '/dashboard/courses'` property.

**Rationale**: Confirmed by Clarification Q2. A redirect keeps the router from throwing "Cannot match any routes" errors when navigation icons are clicked, requires zero stub components, and leaves the route slots clean for future cycles to fill in.

**Alternatives Considered**:
- "Coming Soon" stub component — rejected (extra maintenance burden, orphaned files).
- Toast notification without navigation — rejected (users may be confused if clicking does nothing visual; a redirect to the list is more intuitive).

---

## Decision 3: Optimistic Toggle vs. Re-fetch

**Decision**: Toggle status uses an **optimistic update**: the `isPublished` field on the in-memory course object is flipped immediately on click. If the API call fails, it is reverted and an error notification is shown.

**Rationale**: Specified in the Assumptions section of the spec. Optimistic updates provide instant visual feedback (SC-002: badge must update within 500ms) without requiring a full list reload.

**Alternatives Considered**:
- Re-fetch full list after toggle — rejected (causes unnecessary loading delay and violates SC-002).
- Pessimistic update (wait for API success) — rejected (acceptable only if latency is very low, but SC-002 mandates sub-500ms visual update).

---

## Decision 4: Delete Strategy

**Decision**: Soft-delete via `DELETE /api/Course/{id}`. On API success, the course is removed from the in-memory array immediately (no reload). SweetAlert2 is used for the confirmation dialog (consistent with the existing pattern across department and user management).

**Rationale**: The spec's FR-008 requires immediate card removal. SweetAlert2 is already in the project dependencies and matches the visual language of existing management pages.

**Alternatives Considered**:
- Reload full list after delete — rejected (causes flash and unnecessary server load).
- Native browser `confirm()` — rejected (not consistent with Lumina branding).

---

## Decision 5: Stitch Design Blocker

**Decision**: The `stitch-designs/course-view/` directory does **not yet exist**. Per Constitution Principle II, implementation MUST NOT begin until this design reference is created.

**Rationale**: The Constitution states: *"No feature MUST ship without a corresponding Stitch design reference being consulted first. If a subfolder does not yet exist, one MUST be created and populated before implementation begins, or the gap MUST be flagged as a blocker."*

**Resolution**: The implementer must create `stitch-designs/course-view/` with at minimum a reference HTML/CSS mockup of the card grid before the implementation phase. This is a **Phase 1 prerequisite blocker**. The card layout patterns from the existing `department-management` and `user-management` pages provide a strong visual reference to base the design on.

---

## Decision 6: Component Location

**Decision**: The component will be created at `src/app/features/course-management/course-view/course-view.component.{ts,html,css}`.

**Rationale**: The user's plan specifies `src/app/features/course-management/course-view/`. Using a dedicated sub-directory within `course-management` keeps the feature namespace consistent and reserves sibling folders for `course-edit/`, `course-assessments/`, and `course-enrollment/` in future cycles — all under the same parent `course-management/` feature folder.

**Alternatives Considered**:
- Flat `src/app/features/course-management/course-management.component.*` — rejected because placing all cycles in a single flat folder would lead to filename conflicts and reduced clarity as cycles are added.
