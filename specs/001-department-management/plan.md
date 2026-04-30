# Implementation Plan: Department Management

**Branch**: `001-department-management` | **Date**: 2026-04-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-department-management/spec.md`

---

## Summary

Implement a fully functional Department Management page within the Lumina LMS Angular
application. The feature covers listing, creating, editing, and removing departments
using the `GET / POST / PUT / DELETE /api/Department` endpoints. The UI follows the
Stitch design blueprint (`stitch-designs/department management/`) and the Lumina
Constitution v1.0.0. No Course logic is introduced.

---

## Technical Context

**Language/Version**: TypeScript 5 / Angular 17+ (Standalone Components)
**Primary Dependencies**: Bootstrap 5, SweetAlert2, Bootstrap Icons, Angular HttpClient
**Storage**: N/A (stateless frontend; backend persists data)
**Testing**: Angular default (spec files — not in scope for this feature)
**Target Platform**: Browser (desktop-first)
**Project Type**: Angular SPA feature module (standalone)
**Performance Goals**: Table renders within 2s on local dev; spinner shown during fetch
**Constraints**: Scope-Lock — only new dept files + `app.routes.ts` + `dashboard.component.html` touched
**Scale/Scope**: Single feature page; no pagination in Phase 1

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Bootstrap-First Styling** — Bootstrap 5 classes used throughout; CSS
  copied from `stitch-designs/department management/code.html` and aligned to
  `design.md` tokens (`#41B3E3`, `#001A33`, `#002D5B`).
- [x] **II. Stitch Design Blueprint** — `stitch-designs/department management/`
  consulted; HTML/CSS extracted as the implementation blueprint.
- [x] **III. Angular Standalone Architecture** — Feature at
  `src/app/features/department-management/`; no NgModule introduced.
- [x] **IV. Separation of Concerns** — HTTP calls in `DepartmentService`; model
  in `src/app/models/department.ts`; no HTTP calls in the component.
- [x] **V. Scope-Lock & Consultation** — Only 3 existing files modified
  (`app.routes.ts`, `dashboard.component.html`); all others are new files.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-department-management/
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── department-api.md ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code (new files — created by this feature)

```text
src/app/models/
└── department.ts                          [NEW]

src/app/core/services/
└── department.service.ts                  [NEW]

src/app/features/department-management/
├── department-management.component.ts     [NEW]
├── department-management.component.html   [NEW]
├── department-management.component.css    [NEW]
└── department-management.component.spec.ts [NEW — empty stub]
```

### Existing Files Modified

```text
src/app/app.routes.ts                      [MODIFIED — add dept route]
src/app/features/dashboard/
└── dashboard.component.html               [MODIFIED — add sidebar nav link]
```

**Structure Decision**: Angular Standalone, single-project layout.
All new files follow the established `src/app/features/<name>/` + `src/app/core/services/`
+ `src/app/models/` pattern identical to User Management.

---

## Phase 0: Research ✅ Complete

All unknowns resolved. See [`research.md`](./research.md) for full decisions.

**Key resolved decisions:**

| Decision | Resolution |
|----------|-----------|
| Base API URL | `https://localhost:7289/api/Department` |
| `getDepartments()` conflict | Keep `AuthService.getDepartments()` (scope-lock); `DepartmentService` is independent |
| HTTP pattern | `HttpClient` → `Observable<T>`, matching `UserService` |
| Route guard | `permissionGuard` + `data: { permission: 'dept:read' }` |
| Status model | No `isActive`; all GET records are active; DELETE = disappear |
| Retry behavior | Re-call `loadDepartments()` in background with spinner |
| Remove confirmation | SweetAlert2 confirm dialog before DELETE |
| Multi-edit switching | `patchValue()` immediately overwrites form |
| Create-while-editing | Resets to Add mode (clears form, sets `editingDeptId = null`) |

---

## Phase 1: Design & Contracts ✅ Complete

All design artifacts generated. See linked files.

### File 1 — `src/app/models/department.ts` (NEW)

```typescript
export interface Department {
  id: number;
  title: string;
}
```

*No `isActive`, no `managerId`. Matches backend GET response exactly.*

---

### File 2 — `src/app/core/services/department.service.ts` (NEW)

```typescript
@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private baseUrl = 'https://localhost:7289/api/Department';

  constructor(private http: HttpClient) {}

  // GET /api/Department
  getDepartments(): Observable<Department[]> { ... }

  // POST /api/Department
  createDepartment(data: { title: string }): Observable<Department> { ... }

  // PUT /api/Department/{id}
  updateDepartment(id: number, data: { title: string }): Observable<void> { ... }

  // DELETE /api/Department/{id}  (soft delete)
  deleteDepartment(id: number): Observable<void> { ... }
}
```

*4 methods total. Zero Course-related methods.*

---

### File 3 — `src/app/features/department-management/department-management.component.ts` (NEW)

Key properties and methods:

| Item | Type | Purpose |
|------|------|---------|
| `departments` | `Department[]` | Table data |
| `isLoading` | `boolean` | Spinner flag |
| `loadFailed` | `boolean` | Error/retry flag |
| `showForm` | `boolean` | Form card toggle |
| `editingDeptId` | `number \| null` | Mode: null=Add, id=Edit |
| `deptForm` | `FormGroup` | Reactive form |
| `loadDepartments()` | method | GET + sets `isLoading`/`loadFailed` |
| `openCreateForm()` | method | Resets form → Add mode |
| `editDept(dept)` | method | Patches form → Edit mode |
| `saveDept()` | method | Routes to create or update |
| `removeDept(id)` | method | Swal confirm → DELETE |
| `resetForm()` | method | Clears form, resets state |
| `hasPermission(p)` | method | Delegates to `PermissionService` |

---

### File 4 — `src/app/features/department-management/department-management.component.html` (NEW)

Structure (from Stitch blueprint `code.html`):

```text
<div class="container mt-4">

  <!-- Page Header -->
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="text-info">Department Management</h2>
    <button *ngIf="hasPermission('dept:add')" class="btn btn-lumina-main">
      + Create New Department
    </button>
  </div>

  <!-- Collapsible Form Card -->
  <div *ngIf="showForm" class="card shadow-sm mb-4">
    <div class="card-header">
      <h5>{{ editingDeptId ? 'Edit' : 'Add' }} Department</h5>
    </div>
    <div class="card-body">
      <form [formGroup]="deptForm" (ngSubmit)="saveDept()">
        <div class="row">
          <div class="col-md-4 mb-3">
            <label>Department Title</label>
            <input formControlName="title" class="form-control" />
            <!-- validation error -->
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" (click)="resetForm()" class="btn btn-lumina-outline">
            Discard
          </button>
          <button type="submit" class="btn btn-save-action" [disabled]="deptForm.invalid">
            Save Department
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Loading Spinner -->
  <div *ngIf="isLoading" class="text-center my-5">
    <div class="spinner-border text-primary"></div>
  </div>

  <!-- Error / Retry State -->
  <div *ngIf="!isLoading && loadFailed" class="text-center my-5">
    <p class="text-muted">Failed to load departments.</p>
    <button (click)="loadDepartments()" class="btn btn-lumina-main">Retry</button>
  </div>

  <!-- Data Table Card -->
  <div *ngIf="!isLoading && !loadFailed" class="card shadow-sm mb-4">
    <div class="table-container">
      <table class="table table-hover align-middle mb-0">
        <thead class="sticky-top">
          <tr>
            <th>#</th>
            <th>Department Title</th>
            <th *ngIf="hasPermission('dept:update') || hasPermission('dept:delete')">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let dept of departments">
            <td>{{ dept.id }}</td>
            <td>{{ dept.title }}</td>
            <td>
              <button *ngIf="hasPermission('dept:update')"
                      (click)="editDept(dept)"
                      class="btn btn-edit-action me-1">
                <i class="bi bi-pencil-square"></i> Edit
              </button>
              <button *ngIf="hasPermission('dept:delete')"
                      (click)="removeDept(dept.id)"
                      class="btn btn-status-action btn-to-disable">
                <i class="bi bi-x-circle"></i> Remove
              </button>
            </td>
          </tr>
          <!-- Empty state (no records) -->
          <tr *ngIf="departments.length === 0">
            <td colspan="3" class="text-center text-muted py-4">
              No departments found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</div>
```

---

### File 5 — `src/app/features/department-management/department-management.component.css` (NEW)

Copy all shared Lumina CSS from `user-management.component.css` (`.card-header`,
`.table thead th`, `.table-container`, `.btn-lumina-main`, `.btn-lumina-outline`,
`.btn-save-action`, `.btn-edit-action`, `.btn-status-action`, `.btn-to-disable`,
scrollbar styles). Remove `.status-badge`, `.status-active`, `.status-disabled`
(not used in Phase 1).

---

### File 6 — `src/app/app.routes.ts` (MODIFIED)

Add one new child route inside the `dashboard` route's `children` array:

```typescript
import { DepartmentManagementComponent } from
  './features/department-management/department-management.component';

// Inside children: [...]
{
  path: 'departments',
  component: DepartmentManagementComponent,
  canActivate: [permissionGuard],
  data: { permission: 'dept:read' },
},
```

---

### File 7 — `src/app/features/dashboard/dashboard.component.html` (MODIFIED)

Add one `<li>` nav item inside the sidebar `<ul class="nav flex-column">`, after the
Roles Management link:

```html
<li class="nav-item mb-2" *ngIf="hasPermission('dept:read')">
  <a class="nav-link d-flex align-items-center"
     routerLink="departments"
     routerLinkActive="active-link">
    <i class="bi bi-building me-3"></i> Departments Management
  </a>
</li>
```

---

## Complexity Tracking

No Constitution Check violations. All changes justified within the feature scope.

---

## Implementation Order (for `/speckit-tasks`)

Execute in this strict sequence to respect dependencies:

1. **Model** — `src/app/models/department.ts` (no dependencies)
2. **Service** — `src/app/core/services/department.service.ts` (depends on model)
3. **Component TS** — `department-management.component.ts` (depends on service + model)
4. **Component CSS** — `department-management.component.css` (no code deps)
5. **Component HTML** — `department-management.component.html` (depends on TS + CSS)
6. **Route** — `app.routes.ts` (depends on component existing)
7. **Sidebar link** — `dashboard.component.html` (depends on route existing)
8. **Validate** — Run `quickstart.md` steps
