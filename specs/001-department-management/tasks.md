---
description: "Task list for Department Management feature implementation"
---

# Tasks: Department Management

**Input**: Design documents from `specs/001-department-management/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths included in every task description

## Path Conventions (Lumina Angular Standalone)

- **Feature components**: `src/app/features/department-management/`
- **Core services**: `src/app/core/services/`
- **Model interfaces**: `src/app/models/`
- **Global styles / tokens**: `src/styles.css`
- **Stitch design reference**: `stitch designs/department management/`
- Do NOT create NgModule files; all components MUST be standalone

---

## Phase 1: Setup

**Purpose**: Create all new files/folders needed before any logic is written.

- [x] T001 Create folder `src/app/features/department-management/` (the feature directory)
- [x] T002 [P] Create empty file `src/app/models/department.ts`
- [x] T003 [P] Create empty file `src/app/core/services/department.service.ts`
- [x] T004 [P] Create empty files `src/app/features/department-management/department-management.component.ts`, `.html`, `.css`, `.spec.ts`

**Checkpoint**: Folder structure exists; all 6 new files are in place (empty stubs).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on. No user story work can begin until this phase is complete.

⚠️ **CRITICAL**: Complete T005 → T008 in order before any phase 3+ work.

- [x] T005 Define the `Department` TypeScript interface in `src/app/models/department.ts`:
  ```typescript
  export interface Department {
    id: number;
    title: string;
  }
  ```
  Fields: `id: number` (server-generated), `title: string` (required, unique). No `isActive`, no `managerId`.

- [x] T006 Implement `DepartmentService` in `src/app/core/services/department.service.ts` with `HttpClient` injected via constructor, `baseUrl = 'https://localhost:7289/api/Department'`, and four methods:
  - `getDepartments(): Observable<Department[]>` → `GET /api/Department`
  - `createDepartment(data: { title: string }): Observable<Department>` → `POST /api/Department`
  - `updateDepartment(id: number, data: { title: string }): Observable<void>` → `PUT /api/Department/{id}`
  - `deleteDepartment(id: number): Observable<void>` → `DELETE /api/Department/{id}`
  Decorate with `@Injectable({ providedIn: 'root' })`. Import `Department` from `../../models/department`. Zero Course-related methods.

- [x] T007 Scaffold `DepartmentManagementComponent` in `src/app/features/department-management/department-management.component.ts` as a standalone component:
  - `selector: 'app-department-management'`
  - `standalone: true`
  - `imports: [CommonModule, ReactiveFormsModule]`
  - Inject: `DepartmentService`, `FormBuilder`, `PermissionService` (from `../../core/services/`)
  - Declare component properties: `departments: Department[] = []`, `isLoading = false`, `loadFailed = false`, `showForm = false`, `editingDeptId: number | null = null`, `deptForm!: FormGroup`
  - Implement `ngOnInit()` calling `this.initForm()` then `this.loadDepartments()`
  - Implement `initForm()`: `this.deptForm = this.fb.group({ title: ['', [Validators.required]] })`
  - Implement `hasPermission(permission: string): boolean` delegating to `PermissionService`

- [x] T008 Apply Lumina CSS to `src/app/features/department-management/department-management.component.css`. Copy the following rule-sets verbatim from `src/app/features/user-management/user-management.component.css` (do NOT copy `.status-badge`, `.status-active`, `.status-disabled` — those are not used in Phase 1):
  - `.table-container` (max-height, overflow-y, position)
  - `.sticky-top` (position sticky, z-index, background)
  - `.table-container::-webkit-scrollbar` and `::-webkit-scrollbar-thumb`
  - `:root` CSS variables (`--lumina-blue`, `--lumina-info`)
  - `.btn-lumina-main` and `.btn-lumina-main:hover`
  - `.btn-lumina-outline` and `.btn-lumina-outline:hover`
  - `.btn-save-action` and `.btn-save-action:disabled`
  - `.btn-edit-action`, `.btn-edit-action:hover`, `.btn-edit-action i`
  - `.btn-status-action`, `.btn-to-disable`, `.btn-to-disable:hover`
  - `.card-header`, `.card-header h5`, `.card`
  - `.form-control:focus`
  - `.table thead th`, `.table tbody tr`, `.table tbody tr:hover`, `.table tbody td`

**Checkpoint**: `DepartmentService` compiles cleanly. `DepartmentManagementComponent` scaffolded with all properties and `ngOnInit`. CSS applied. No user story logic implemented yet.

---

## Phase 3: User Story 1 — View Department List (Priority: P1) 🎯 MVP

**Goal**: Load and display all departments in a scrollable table on page load. Show spinner while loading, error + retry on failure, empty-state when list is empty.

**Independent Test**: Navigate to `/dashboard/departments` → spinner appears → table populates with `GET /api/Department` data. (Quickstart Step 1)

### Implementation for User Story 1

- [x] T009 [US1] Implement `loadDepartments()` method in `department-management.component.ts`:
  - Set `isLoading = true`, `loadFailed = false`
  - Call `this.deptService.getDepartments().subscribe({ next: (data) => { this.departments = data; this.isLoading = false; }, error: () => { this.isLoading = false; this.loadFailed = true; Swal.fire({ icon: 'error', title: 'Load Failed', text: 'Could not load departments. Please retry.' }); } })`

- [x] T010 [US1] Build the HTML skeleton in `department-management.component.html` matching the Stitch design (`stitch designs/department management/code.html`). Structure:
  ```html
  <div class="container mt-4">
    <!-- Page Header (US2 button added in Phase 4) -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-info">Department Management</h2>
      <div><!-- US2 button placeholder --></div>
    </div>

    <!-- Loading Spinner -->
    <div *ngIf="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Error / Retry State -->
    <div *ngIf="!isLoading && loadFailed" class="text-center my-5">
      <p class="text-muted mb-3">Failed to load departments.</p>
      <button class="btn btn-lumina-main" (click)="loadDepartments()">
        <i class="bi bi-arrow-clockwise me-2"></i> Retry
      </button>
    </div>

    <!-- Data Table Card -->
    <div *ngIf="!isLoading && !loadFailed" class="card shadow-sm mb-4">
      <div class="table-container">
        <table class="table table-hover align-middle mb-0">
          <thead class="sticky-top">
            <tr>
              <th>#</th>
              <th>Department Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let dept of departments">
              <td>{{ dept.id }}</td>
              <td>{{ dept.title }}</td>
              <td><!-- action buttons: US3/US4 --></td>
            </tr>
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
  Use Bootstrap 5 classes. Apply `class="text-info"` to page title. Thead must use `.sticky-top` class and the dark `#001A33` background from component CSS.

**Checkpoint**: Navigate to `/dashboard/departments` (route not yet wired — verify by temporarily adding the route or testing component in isolation). Spinner shows → departments table renders. Empty-state shows when list is empty. Retry button calls `loadDepartments()` which re-shows spinner.

---

## Phase 4: User Story 2 — Create Department (Priority: P2)

**Goal**: "Create New Department" button (permission-gated) opens a collapsible form card. On valid submit, `POST /api/Department` is called, form closes, list refreshes, success toast fires.

**Independent Test**: Click "Create New Department" → fill title → save → new row appears in table + success toast. (Quickstart Steps 2, 4, 5)

### Implementation for User Story 2

- [x] T011 [US2] Implement `openCreateForm()` method in `department-management.component.ts`:
  - Calls `resetForm()` which sets `editingDeptId = null`, clears `deptForm` with `this.deptForm.reset()`, sets `showForm = true`
  - Implements `resetForm()`: `this.showForm = true; this.editingDeptId = null; this.deptForm.reset();`
  - Note: clicking "Create New Department" while form is in edit mode MUST switch to Add mode (same `resetForm()` call)

- [x] T012 [US2] Implement `saveDept()` method in `department-management.component.ts` for Create path only (Edit path added in Phase 5):
  - Guard: `if (this.deptForm.invalid || this.deptForm.value.title?.trim() === '') return;`
  - Build payload: `const payload = { title: this.deptForm.value.title.trim() };`
  - If `editingDeptId === null`: call `this.deptService.createDepartment(payload).subscribe({ next: () => { Swal.fire({ icon: 'success', title: 'Created!', text: 'Department created successfully.', timer: 2000, showConfirmButton: false }); this.loadDepartments(); this.closeForm(); }, error: (err) => { const msg = err.error?.message || 'Operation failed'; Swal.fire({ icon: 'error', title: 'Error!', text: msg }); } })`
  - Implement `closeForm()`: sets `showForm = false`, `editingDeptId = null`, calls `this.deptForm.reset()`

- [x] T013 [US2] Add the form card HTML and permission-gated "Create New Department" button to `department-management.component.html`. Replace the page header `<div>` placeholder:
  ```html
  <!-- Create New Department button — permission gated -->
  <button *ngIf="hasPermission('dept:add')"
          class="btn btn-lumina-main"
          (click)="openCreateForm()">
    <i class="bi bi-plus-lg me-2"></i> Create New Department
  </button>
  ```
  Add the collapsible form card BETWEEN the page header and the spinner (uses `*ngIf="showForm"`):
  ```html
  <div *ngIf="showForm" class="card shadow-sm mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="text-info mb-0">
        {{ editingDeptId ? 'Edit Department' : 'Add Department' }}
      </h5>
      <button class="btn btn-lumina-outline btn-sm" (click)="closeForm()">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
    <div class="card-body">
      <form [formGroup]="deptForm" (ngSubmit)="saveDept()">
        <div class="row">
          <div class="col-md-4 mb-3">
            <label class="form-label fw-bold">Department Title</label>
            <input type="text"
                   formControlName="title"
                   class="form-control"
                   [class.is-invalid]="deptForm.get('title')?.invalid && deptForm.get('title')?.touched"
                   placeholder="e.g. Computer Science" />
            <div class="invalid-feedback">Department title is required.</div>
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2 pt-3 border-top">
          <button type="button" class="btn btn-lumina-outline" (click)="closeForm()">
            Discard
          </button>
          <button type="submit"
                  class="btn btn-save-action"
                  [disabled]="deptForm.invalid">
            Save Department
          </button>
        </div>
      </form>
    </div>
  </div>
  ```

**Checkpoint**: Create form opens on button click, validates empty title, calls `POST /api/Department` with `{ title }`, shows success/error toast, closes form, refreshes list. (Quickstart Step 2)

---

## Phase 5: User Story 3 — Edit Department (Priority: P3)

**Goal**: Edit icon button (permission-gated) opens the form pre-populated. On save, `PUT /api/Department/{id}` is called. Multiple-department switching works seamlessly.

**Independent Test**: Click Edit on any row → form pre-filled → change title → save → updated title appears. (Quickstart Steps 3, 4, 5)

### Implementation for User Story 3

- [x] T014 [US3] Implement `editDept(dept: Department)` method in `department-management.component.ts`:
  ```typescript
  editDept(dept: Department): void {
    this.editingDeptId = dept.id;
    this.showForm = true;
    this.deptForm.patchValue({ title: dept.title });
  }
  ```
  This handles both: (a) opening from closed state and (b) switching between departments while form is already open (Q4 clarification: immediate overwrite, no dialog).

- [x] T015 [US3] Extend `saveDept()` in `department-management.component.ts` to handle the Edit path. Add the `else` branch after the create path:
  ```typescript
  // else — Edit mode
  this.deptService.updateDepartment(this.editingDeptId!, payload).subscribe({
    next: () => {
      Swal.fire({ icon: 'success', title: 'Updated!',
                  text: 'Department updated successfully.',
                  timer: 2000, showConfirmButton: false });
      this.loadDepartments();
      this.closeForm();
    },
    error: (err) => {
      const msg = err.error?.message || 'Update failed';
      Swal.fire({ icon: 'error', title: 'Error!', text: msg });
      if (err.status === 404) this.closeForm();
    }
  });
  ```
  On `404` response: show error toast AND close/reset the form (404 means the dept was deleted by another admin).

- [x] T016 [US3] Add the Edit action button to each table row in `department-management.component.html` inside the `<td>` actions cell:
  ```html
  <td>
    <button *ngIf="hasPermission('dept:update')"
            class="btn btn-edit-action me-1"
            (click)="editDept(dept)"
            title="Edit Department">
      <i class="bi bi-pencil-square"></i> Edit
    </button>
    <!-- Remove button placeholder — added in Phase 6 -->
  </td>
  ```
  Button only rendered when user has `dept:update` permission.

**Checkpoint**: Click Edit → form opens pre-filled. Click Edit on a second department → form switches without dialog. Click "Create New Department" while in Edit mode → form resets to Add mode. (Quickstart Steps 3, 4, 5)

---

## Phase 6: User Story 4 — Remove Department (Priority: P4)

**Goal**: Remove icon button (permission-gated) triggers SweetAlert2 confirm dialog. On confirm, `DELETE /api/Department/{id}` called. Row disappears immediately on success.

**Independent Test**: Click Remove → confirm dialog → confirm → row disappears + success toast. Cancel → row stays. (Quickstart Step 6)

### Implementation for User Story 4

- [x] T017 [US4] Implement `removeDept(id: number)` method in `department-management.component.ts`:
  ```typescript
  removeDept(id: number): void {
    Swal.fire({
      title: 'Remove Department?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e63946',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deptService.deleteDepartment(id).subscribe({
          next: () => {
            this.departments = this.departments.filter(d => d.id !== id);
            Swal.fire({ icon: 'success', title: 'Removed!',
                        text: 'Department removed successfully.',
                        timer: 2000, showConfirmButton: false });
          },
          error: (err) => {
            const msg = err.error?.message || 'Remove failed';
            Swal.fire({ icon: 'error', title: 'Error!', text: msg });
          }
        });
      }
    });
  }
  ```
  On success: use `this.departments.filter()` to remove row immediately (no full `loadDepartments()` call needed).

- [x] T018 [US4] Add the Remove action button to the table row actions `<td>` in `department-management.component.html`, after the Edit button:
  ```html
  <button *ngIf="hasPermission('dept:delete')"
          class="btn btn-status-action btn-to-disable"
          (click)="removeDept(dept.id)"
          title="Remove Department">
    <i class="bi bi-x-circle me-1"></i> Remove
  </button>
  ```
  Button only rendered when user has `dept:delete` permission.

**Checkpoint**: Remove button shown only with `dept:delete`. Confirm dialog fires. Cancel = no API call. Confirm = DELETE called, row removed immediately, success toast. Error = toast + row stays. (Quickstart Step 6)

---

## Phase 7: Routing & Navigation

**Purpose**: Wire the feature into the application so it is reachable. Only touches two existing files.

- [x] T019 Register the department management route in `src/app/app.routes.ts`. Add this import at the top of the file:
  ```typescript
  import { DepartmentManagementComponent } from
    './features/department-management/department-management.component';
  ```
  Then add this child route inside the `dashboard` route's `children` array (after the `users` route):
  ```typescript
  {
    path: 'departments',
    component: DepartmentManagementComponent,
    canActivate: [permissionGuard],
    data: { permission: 'dept:read' },
  },
  ```

- [x] T020 Add the sidebar navigation link to `src/app/features/dashboard/dashboard.component.html`. Inside `<ul class="nav flex-column">`, add the following `<li>` after the Roles Management item:
  ```html
  <li class="nav-item mb-2" *ngIf="hasPermission('dept:read')">
    <a class="nav-link d-flex align-items-center"
       routerLink="departments"
       routerLinkActive="active-link">
      <i class="bi bi-building me-3"></i> Departments Management
    </a>
  </li>
  ```
  Nav link hidden when user lacks `dept:read`. Uses `bi-building` icon (Bootstrap Icons).

**Checkpoint**: Navigate to `/dashboard/departments` — page loads. Sidebar shows "Departments Management" link (when permitted). `permissionGuard` blocks access for users without `dept:read`.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, cleanup, and course-isolation check.

- [x] T021 [P] Verify `SweetAlert2` import is present at the top of `department-management.component.ts`: `import Swal from 'sweetalert2';`. Confirm `package.json` already lists `sweetalert2` (do NOT install if already present).
- [x] T022 [P] Run `quickstart.md` validation: Execute all 9 steps manually to confirm the full feature works end-to-end with the live backend.
- [x] T023 [P] Courses isolation audit: Confirm that `department-management.component.ts`, `department.service.ts`, and `department.ts` model contain zero imports, injections, or method calls referencing `Course`, `CourseService`, or any Course endpoint. If any are found, remove immediately.
- [x] T024 Confirm Angular compiles without errors: run `ng build --configuration development` (or `ng serve`) and resolve any TypeScript/template errors before marking feature complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately; T002/T003/T004 can run in parallel
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories; T006 depends on T005; T007/T008 can run in parallel after T006
- **Phase 3 (US1)**: Depends on Phase 2 — T009 before T010
- **Phase 4 (US2)**: Depends on Phase 2 (and optionally US1 HTML shell) — T011 before T012 before T013
- **Phase 5 (US3)**: Depends on Phase 4 (uses same form/`saveDept`) — T014 before T015 before T016
- **Phase 6 (US4)**: Depends on Phase 2 — independent of US2/US3; T017 before T018
- **Phase 7 (Routing)**: Depends on Phase 3 (component must exist) — T019 before T020
- **Phase 8 (Polish)**: Depends on all phases complete — T021/T022/T023 can run in parallel; T024 last

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no story dependencies
- **US2 (P2)**: Can start after Phase 2 — no story dependencies (shares component with US1)
- **US3 (P3)**: Depends on US2 being complete (extends `saveDept()` and form HTML)
- **US4 (P4)**: Can start after Phase 2 — independent of US2/US3

### Within Each User Story

- Logic (`.ts`) MUST be implemented before the template (`.html`) references it
- Service methods MUST exist before component calls them
- CSS (`.css`) is independent and can be applied at any time after Phase 1

### Parallel Opportunities

```bash
# Phase 1 — run together:
T002  # Create department.ts model file
T003  # Create department.service.ts file
T004  # Create component files

# Phase 2 — sequential (T005 → T006 → T007 || T008):
T005  # Define Department interface
T006  # Implement DepartmentService (depends on T005)
T007 || T008  # Scaffold component TS  ||  Apply CSS (both depend on T006)

# Phase 6 can run in parallel with Phase 4/5:
T017 || T011  # removeDept() logic  ||  openCreateForm() logic

# Phase 8 — run together after feature complete:
T021 || T022 || T023  # Swal check  ||  Quickstart  ||  Course isolation audit
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T008)
3. Complete Phase 3: User Story 1 — View List (T009–T010)
4. Complete Phase 7: Routing (T019–T020)
5. **STOP and VALIDATE**: Navigate to `/dashboard/departments` — table populates ✅
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Core infrastructure ready
2. US1 (View) + Routing → Table renders at `/dashboard/departments` (MVP!)
3. US2 (Create) → Admins can add departments
4. US3 (Edit) → Admins can update department names
5. US4 (Remove) → Admins can soft-delete departments
6. Polish → Feature complete

### Parallel Team Strategy (if >1 developer)

After Phase 2:
- Developer A: US1 (View) + Routing
- Developer B: US2 (Create) + US3 (Edit)  ← US3 extends US2's form/saveDept
- Developer C: US4 (Remove) ← fully independent

---

## Notes

- `[P]` tasks = operate on different files, no incomplete dependencies
- `[US#]` label maps task to specific user story for traceability
- `SweetAlert2` import required in component — already a project dependency
- `getDepartments()` in `AuthService` is NOT modified (Scope-Lock, Constitution V)
- The Status badge column is intentionally absent — confirmed in clarification Q1
- No pagination logic — confirmed out of scope for Phase 1
- Avoid: touching `auth.service.ts`, `user-management.*`, `role-management.*`
