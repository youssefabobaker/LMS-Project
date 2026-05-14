# Implementation Quickstart: Add Assignment Modal
**Feature**: `010-assignment-add`
**Date**: 2026-05-14

---

## Files to Create

| File | Purpose |
|---|---|
| `src/app/features/assignments/assignment-add/assignment-add.component.ts` | Modal component logic |
| `src/app/features/assignments/assignment-add/assignment-add.component.html` | Modal template |
| `src/app/features/assignments/assignment-add/assignment-add.component.css` | Modal styles |

## Files to Modify

| File | Change |
|---|---|
| `src/app/core/services/assignment.service.ts` | Add `addAttachments()` method |
| `src/app/features/assignments/assignments-view/assignments-view.component.ts` | Add modal host + `openAddModal()` + `onAssignmentCreated()` |
| `src/app/features/assignments/assignments-view/assignments-view.component.html` | Import `AssignmentAddComponent`; add modal `<div>` host; wire `canAddOrUpdate` to show modal button |
| `src/app/features/content/content-view/content-view.component.ts` | Add `@ViewChild(AssignmentsViewComponent)` ref; wire `onAddContent()` to call `assignmentsView.openAddModal()` when `activeTab === 'assignments'` |

---

## Source Code Directory Layout

```text
src/app/features/assignments/
├── assignment-add/              ← NEW
│   ├── assignment-add.component.ts
│   ├── assignment-add.component.html
│   └── assignment-add.component.css
└── assignments-view/            ← MODIFIED (modal host + wiring)
    ├── assignments-view.component.ts
    ├── assignments-view.component.html
    └── assignments-view.component.css

src/app/core/services/
└── assignment.service.ts        ← MODIFIED (addAttachments method)

src/app/features/content/content-view/
└── content-view.component.ts    ← MODIFIED (@ViewChild wiring for tab CTA)
```

---

## Key Implementation Notes

### AssignmentService — `addAttachments()`

```typescript
addAttachments(assignmentId: number, files: File[]): Observable<AssignmentResponseDto> {
  const formData = new FormData();
  files.forEach(f => formData.append('attachmentFiles', f, f.name));
  return this.http.post<any>(`${this.apiUrl}/${assignmentId}/attachments`, formData)
    .pipe(map(u => this.normalizeAssignment(u)));
}
```

### AssignmentAddComponent — Submit Flow

```
submit()
  → validate all fields (mark touched if not)
  → isSubmitting = true
  → AssignmentService.createOrUpdateAssignment(courseId, { id: 0, title, description, dueDate (ISO 8601), totalMarks })
      ✓ success:
          createdAssignmentId = response.id
          if (stagedFiles.length > 0):
              → addAttachmentsStep(response.id)
          else:
              → emitSuccess(response)
      ✗ error:
          submitError = message
          isSubmitting = false

addAttachmentsStep(assignmentId)
  → AssignmentService.addAttachments(assignmentId, files)
      ✓ success:
          → emitSuccess(updatedResponse)
      ✗ error:
          retryMode = true
          submitError = 'partial-success message'
          isSubmitting = false
          assignmentCreated.emit(step1Result)  // still add to list
          modal closes

emitSuccess(item)
  → SweetAlert2 success toast
  → assignmentCreated.emit(item)
  → resetForm()
```

### AssignmentsViewComponent — Modal Wiring

```typescript
openAddModal(): void {
  const el = document.getElementById('assignmentAddModal');
  if (el) {
    (window as any).bootstrap.Modal.getOrCreateInstance(el).show();
  }
}

onAssignmentCreated(newItem: AssignmentResponseDto): void {
  this.assignmentsList = [...this.assignmentsList, newItem]; // append to end (FR-011, Clarification A)
  this.closeAddModal();
}

closeAddModal(): void {
  const el = document.getElementById('assignmentAddModal');
  if (el) {
    (window as any).bootstrap.Modal.getOrCreateInstance(el).hide();
  }
}
```

### ContentViewComponent — @ViewChild Tab CTA Wiring

```typescript
@ViewChild(AssignmentsViewComponent) assignmentsView?: AssignmentsViewComponent;

onAddContent(): void {
  if (this.activeTab === 'content') {
    // existing content modal logic
    const el = document.getElementById('contentAddModal');
    if (el) this.contentAddModalInstance = (window as any).bootstrap.Modal.getOrCreateInstance(el);
    this.contentAddModalInstance?.show();
  } else {
    this.assignmentsView?.openAddModal();
  }
}
```

### HTML — Modal Host in assignments-view.component.html

```html
<!-- ── Add Assignment Modal Host ── -->
<div class="modal fade" id="assignmentAddModal" tabindex="-1"
     data-bs-backdrop="static" data-bs-keyboard="false"
     aria-labelledby="assignmentAddModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content rounded-3 overflow-hidden shadow-lg">
      <app-assignment-add
        [courseId]="courseId"
        (assignmentCreated)="onAssignmentCreated($event)"
        (modalDismissed)="closeAddModal()">
      </app-assignment-add>
    </div>
  </div>
</div>
```

### CSS Strategy

Copy `content-add.component.css` verbatim as the starting point. The only change is the header class name:
- `content-add-header` → `assignment-add-header` (rename the selector; no visual change).

---

## Due Date ISO 8601 Conversion

```typescript
// In submit(), before sending to API:
const dueDateIso = new Date(this.dueDate).toISOString();
```

The `datetime-local` input provides a value like `"2026-06-01T23:59"`.  
`new Date("2026-06-01T23:59").toISOString()` converts it to `"2026-06-01T20:59:00.000Z"` (UTC-adjusted).
