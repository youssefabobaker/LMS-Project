# Quick Start: Course Assessment Modal

**Feature**: 005-course-assessment-modal  
**Date**: 2026-05-04

---

## What This Feature Adds

A new **Course Assessment** modal reachable from the Courses list. It lets authorized users:

- **View** all assessments for a course with a live total-weight tracker.
- **Add** one new assessment at a time (collapsible form above the list).
- **Edit** any existing assessment inline, directly within the table row.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/app/models/assessment.ts` | `Assessment` and `AssessmentType` TypeScript interfaces |
| `src/app/features/course-management/course-assessment/course-assessment.component.ts` | All component logic |
| `src/app/features/course-management/course-assessment/course-assessment.component.html` | Template (table + inline forms) |
| `src/app/features/course-management/course-assessment/course-assessment.component.css` | Lumina-themed styles |

## Files to Modify

| File | Change |
|------|--------|
| `src/app/core/services/course.service.ts` | Add 4 assessment methods |
| `src/app/features/course-management/course-view/course-view.component.ts` | Add `@ViewChild` + `openAssessmentModal()` handler |
| `src/app/features/course-management/course-view/course-view.component.html` | Add Assessments button + second modal host |
| `AGENTS.md` | Update plan reference to `specs/005-course-assessment-modal/plan.md` |

---

## Key Implementation Notes

### 1. CourseService — 4 New Methods

```typescript
// GET /api/Course/{courseId}/assessments
getCourseAssessments(courseId: number): Observable<Assessment[]>

// GET /api/Course/assessment-types
getAssessmentTypes(): Observable<AssessmentType[]>

// POST /api/Course/{courseId}/AddAssesment  (body: Assessment[])
addAssessment(courseId: number, assessment: Assessment): Observable<any>

// PUT /api/Course/{courseId}/UpdateAssesment  (body: Assessment[])
updateAssessment(courseId: number, assessment: Assessment): Observable<any>
```

Both `addAssessment` and `updateAssessment` accept a **single** `Assessment` object from the
component and wrap it in an array `[assessment]` internally before sending. Response type is `text`
(backend returns plain text on success).

### 2. Weight Guard Logic

```typescript
calculateTotalWeight(excluding?: number): number {
  return this.assessments
    .filter(a => a.assType !== excluding)
    .reduce((sum, a) => sum + a.percentageWeight, 0);
}

isWeightValid(newWeight: number, editingType?: number): boolean {
  return this.calculateTotalWeight(editingType) + newWeight <= 100;
}
```

Call `isWeightValid(newWeight)` for Add; call `isWeightValid(newWeight, editingAssType)` for Edit.

### 3. Type Dropdown Filtering

The Add form must only offer types **not already present** in `this.assessments`:

```typescript
get availableTypes(): AssessmentType[] {
  const usedTypes = new Set(this.assessments.map(a => a.assType));
  return this.assessmentTypes.filter(t => !usedTypes.has(t.value));
}
```

Auto-select if exactly one available type remains (FR-016).

### 4. In-Place State Sync

- **After successful POST**: `this.assessments.push(newAssessment)` — no API re-fetch.
- **After successful PUT**: find by `assType` and replace: `const idx = this.assessments.findIndex(a => a.assType === updated.assType); this.assessments[idx] = updated;`

### 5. Inline Edit UX

Track which row is currently being edited with `editingAssType: number | null = null`. Only one row
can be in edit mode at a time (FR-014).

### 6. Permission Gates

Use the existing permission helper from `CourseViewComponent`:

| Action | Permission Required |
|--------|---------------------|
| Assessments button | `Course:read` OR `Course:readAll` |
| Add Assessment button | `Course:add` |
| Edit (per row) | `Course:update` |

### 7. Lumina Styling Reminders

- Header gradient: `linear-gradient(90deg, #001A33 0%, #002D5B 100%)` with `color: #41B3E3`
- Save button: `.btn-save-action` (solid cyan `#41B3E3`)
- Edit button: `.btn-edit-action` (ghost cyan)
- Cancel button: `.btn-lumina-outline`
- Error state: Bootstrap `.is-invalid` + `.invalid-feedback`; inline alert uses `alert alert-danger`
- All `number` inputs must have `min="0.01"` (weight) or `min="1"` (hours) and `step` as appropriate

---

## Testing Checklist (manual)

- [ ] Modal opens → list loads → total weight correct
- [ ] Add form hidden by default → "Add Assessment" button reveals it
- [ ] Types dropdown only shows unused types
- [ ] Auto-select fires when exactly 1 type remains
- [ ] Weight guard blocks submission if total > 100
- [ ] Successful add → row appears without reload → total updates
- [ ] Edit row expands inline → type shown as read-only
- [ ] Edit weight guard excludes own old weight correctly
- [ ] Successful edit → row updates without reload → total updates
- [ ] Server error → inline error shown → form/row stays open
- [ ] Users without `Course:add` see no Add button
- [ ] Users without `Course:update` see no Edit buttons
- [ ] Users without `Course:read` / `Course:readAll` see no Assessments button
