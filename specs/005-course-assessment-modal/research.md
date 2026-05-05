# Research: Course Assessment Modal

**Feature**: 005-course-assessment-modal  
**Date**: 2026-05-04

---

## Decision 1: Assessment Identity Key

**Decision**: Use `assType` (integer) as the unique identifier for an assessment within a course.  
**Rationale**: Confirmed in clarification session (Q1/B). The API does not return a separate `id` field for assessments; the type code is the composite key (`courseId` + `assType`).  
**Alternatives considered**: A separate numeric ID (rejected — not in API contract); index-based identity (rejected — fragile on list reorder).

---

## Decision 2: Edit UX Pattern

**Decision**: Inline row expansion — clicking Edit on an assessment row transforms that row into an editable form in-place.  
**Rationale**: Confirmed in clarification session (Q2/A). Minimises context-switch, keeps the full list visible during editing, consistent with admin-table UX best practices.  
**Alternatives considered**: Separate sub-panel (rejected in Q2); reuse of add form (rejected — conflates two distinct flows).

---

## Decision 3: Save Error Handling

**Decision**: On POST/PUT failure, show an inline error alert inside the modal; keep the form open with the user's data intact.  
**Rationale**: Confirmed in clarification session (Q3/A). Lowest-friction recovery; consistent with the SweetAlert2 / toast pattern already established elsewhere in Lumina.  
**Alternatives considered**: Reset form on error (rejected — loses user input); modal-level error dialog (rejected — overkill for recoverable network errors).

---

## Decision 4: Type Dropdown Auto-Selection

**Decision**: When exactly one unused assessment type remains, the Add form auto-selects it. If multiple types are available, the dropdown starts blank.  
**Rationale**: Confirmed in clarification session (Q4/B). Reduces clicks in the common end-state while preserving intentionality when there is a real choice.  
**Alternatives considered**: Always blank (rejected — unnecessary friction at end of setup); always auto-select (rejected — too presumptuous when multiple options exist).

---

## Decision 5: Add Form Placement

**Decision**: Add Assessment form is hidden by default; revealed by clicking a dedicated "Add Assessment" button, which expands the form above the assessment list. Form collapses after save or cancel.  
**Rationale**: Confirmed in clarification session (Q5/B). Keeps the modal uncluttered when the user only wants to review or edit; the button is a clear, discoverable affordance.  
**Alternatives considered**: Always-visible top form (rejected — wastes modal space when not adding); always-visible bottom form (rejected — pushes list out of view on small screens).

---

## Decision 6: API Response Normalisation

**Decision**: Apply the same `normalizeAssessment()` pattern already established in `CourseService` and `UserService` — map both `camelCase` and `PascalCase` field names defensively.  
**Rationale**: Backend has already been observed returning inconsistent casing across endpoints. Normalising at the service layer prevents silent UI breakage if casing changes again.  
**Alternatives considered**: Rely on camelCase only (rejected — proven fragile); use an HTTP interceptor (deferred — out of scope for this cycle).

---

## Decision 7: Weight Guard Calculation

**Decision**: Implement `calculateTotalWeight()` as a pure function: `sum of percentageWeight for all assessments except the one currently being edited`. The guard triggers if `totalOthers + newWeight > 100`.  
**Rationale**: Spec FR-004 and FR-011 require this. Excluding the edited row's old value prevents false positives when increasing weight within the remaining headroom.  
**Alternatives considered**: Server-side validation only (rejected — poor UX: error arrives after a network round-trip); blocking at input level (rejected — overly restrictive, total context required).

---

## Decision 8: In-Place State Sync Strategy

**Decision**: After a successful POST, push the new `Assessment` object to the local `assessments[]` array. After a successful PUT, find the entry by `assType` and replace it. Recalculate the displayed total immediately. Do NOT close the modal.  
**Rationale**: SC-003 requires the updated list to be visible within 1 second without a page reload. Re-fetching after every mutation introduces unnecessary latency.  
**Alternatives considered**: Full re-fetch after each save (rejected — latency, unnecessary); optimistic update with rollback (deferred — no offline requirement in v1).
