# Implementation Plan: Course Enrollment Modal

**Branch**: `006-course-enrollment-modal` | **Date**: 2026-05-05 | **Spec**: [spec.md](./spec.md)

## Summary

Implement a Bootstrap modal to manage instructor enrollment for a course. Administrators can view enrolled instructors (name + email), enroll new ones from a filtered dropdown, and unenroll existing ones via an inline confirmation prompt. All actions update the UI in-place without a page reload. Granular permission guards (`Course:enrollInstructor`, `Course:unenrollInstructor`) control action visibility.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Angular 17+ (Standalone)
**Primary Dependencies**: Angular HttpClient, ReactiveFormsModule (FormsModule for ngModel dropdown), Bootstrap 5 modal, SweetAlert2, Bootstrap Icons
**Storage**: N/A (stateless frontend; no local storage)
**Testing**: Manual integration testing via `ng serve`
**Target Platform**: Web browser (same as existing LMS frontend)
**Performance Goals**: List reflects changes within 1 second of API response (SC-002)
**Constraints**: In-place updates only; no full page reload; strict permission gating
**Scale/Scope**: Single modal per course; instructor list bounded by system user count

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Bootstrap-First Styling** — Modal will use Bootstrap 5 modal classes and Lumina theme (`#41B3E3`, `#001A33`/`#002D5B`); custom CSS classes follow `.btn-lumina-*` naming; design tokens from `design.md`.
- [x] **II. Stitch Design Blueprint** — `stitch-designs/course-enrollment/` confirmed to exist ✅. Must be consulted before writing any HTML/CSS.
- [x] **III. Angular Standalone Architecture** — New component lives under `src/app/features/course-management/course-enrollment/`; no NgModule introduced; standalone only.
- [x] **IV. Separation of Concerns** — API calls added to `CourseService`; new `EnrolledUser` model in `src/app/models/`; component contains only template logic.
- [x] **V. Scope-Lock & Consultation** — Only the following files are modified: `CourseService`, `course-view.component.ts`, `course-view.component.html`, and new enrollment component files. No other files touched.

---

## Project Structure

### Documentation (this feature)

```text
specs/006-course-enrollment-modal/
├── plan.md              ← This file
├── spec.md
├── research.md          ← Phase 0 ✅
├── data-model.md        ← Phase 1 ✅
├── contracts/
│   └── api-contracts.md ← Phase 1 ✅
├── checklists/
│   └── requirements.md
└── tasks.md             ← Phase 2 (speckit-tasks)
```

### Source Code (repository root)

```text
src/app/
├── models/
│   └── enrolled-user.ts                      ← NEW: EnrolledUser interface
│
├── core/services/
│   └── course.service.ts                     ← MODIFIED: +3 enrollment methods
│
└── features/course-management/
    ├── course-enrollment/                    ← NEW feature folder
    │   ├── course-enrollment.component.ts
    │   ├── course-enrollment.component.html
    │   └── course-enrollment.component.css
    │
    ├── course-view/
    │   ├── course-view.component.ts          ← MODIFIED: +enrollment modal wiring
    │   └── course-view.component.html        ← MODIFIED: +enrollmentModal div + trigger button
    └── ...

stitch-designs/course-enrollment/             ← MUST be consulted (exists ✅)
```

**Structure Decision**: Single project, Angular feature-folder convention. Mirrors the `course-assessment` pattern exactly.

---

## Implementation Phases

### Phase A — Model & Service Layer

**Files modified**: `src/app/models/enrolled-user.ts` (new), `src/app/core/services/course.service.ts`

#### A1 — Create `EnrolledUser` interface

```typescript
// src/app/models/enrolled-user.ts
export interface EnrolledUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
```

#### A2 — Add normalization helper in `CourseService`

```typescript
private normalizeEnrolledUser(u: any): EnrolledUser {
  return {
    id: u.id ?? u.Id,
    firstName: u.firstName ?? u.FirstName,
    lastName: u.lastName ?? u.LastName,
    email: u.email ?? u.Email,
  };
}
```

#### A3 — Add `getEnrolledUsers(courseId)`

```typescript
// GET /api/Course/{courseId}/users
getEnrolledUsers(courseId: number): Observable<EnrolledUser[]> {
  return this.http.get<any[]>(`${this.baseUrl}/${courseId}/users`).pipe(
    map(list => list.map(u => this.normalizeEnrolledUser(u)))
  );
}
```

#### A4 — Add `enrollUser(courseId, userId)`

```typescript
// POST /api/Course/{courseId}/users
enrollUser(courseId: number, userId: string): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/${courseId}/users`,
    { userId },
    { responseType: 'text' }
  );
}
```

#### A5 — Add `unenrollUser(courseId, userId)`

```typescript
// DELETE /api/Course/{courseId}/users/{userId}
unenrollUser(courseId: number, userId: string): Observable<any> {
  return this.http.delete(
    `${this.baseUrl}/${courseId}/users/${userId}`,
    { responseType: 'text' }
  );
}
```

---

### Phase B — Component: `CourseEnrollmentComponent`

**Files created**: `course-enrollment.component.ts`, `course-enrollment.component.html`, `course-enrollment.component.css`

#### B1 — Component skeleton

```typescript
@Component({
  selector: 'app-course-enrollment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-enrollment.component.html',
  styleUrls: ['./course-enrollment.component.css'],
})
export class CourseEnrollmentComponent {
  courseId!: number;
  courseName = '';

  enrolledUsers: EnrolledUser[] = [];
  allInstructors: User[] = [];
  selectedUserId: string | null = null;
  confirmingUnenrollId: string | null = null;

  isLoading = false;
  loadError = '';
  enrollError = '';
  unenrollError = '';

  canEnroll = false;
  canUnenroll = false;

  constructor(
    private courseService: CourseService,
    private userService: UserService,
    private permissionService: PermissionService,
  ) {}

  open(courseId: number, courseName: string): void {
    this.courseId = courseId;
    this.courseName = courseName;
    this.isLoading = true;
    this.loadError = '';
    this.enrollError = '';
    this.unenrollError = '';
    this.confirmingUnenrollId = null;
    this.selectedUserId = null;

    this.canEnroll = this.permissionService.hasPermission('Course:enrollInstructor');
    this.canUnenroll = this.permissionService.hasPermission('Course:unenrollInstructor');

    forkJoin({
      enrolled: this.courseService.getEnrolledUsers(courseId),
      users: this.userService.getUsers(),
    }).subscribe({
      next: ({ enrolled, users }) => {
        this.enrolledUsers = enrolled;
        this.allInstructors = users.filter(
          u => u.roles.some(r => r.toLowerCase() === 'instructor')
        );
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Failed to load enrollment data. Please try again.';
        this.isLoading = false;
      },
    });
  }

  // Derived getter — auto-recomputes on each change detection cycle
  get availableInstructors(): User[] {
    const enrolledIds = new Set(this.enrolledUsers.map(u => u.id));
    return this.allInstructors.filter(u => !enrolledIds.has(u.id));
  }

  onEnroll(): void {
    if (!this.selectedUserId) return;
    this.enrollError = '';
    this.courseService.enrollUser(this.courseId, this.selectedUserId).subscribe({
      next: () => {
        const user = this.allInstructors.find(u => u.id === this.selectedUserId)!;
        this.enrolledUsers = [...this.enrolledUsers, {
          id: user.id, firstName: user.firstName,
          lastName: user.lastName, email: user.email
        }];
        this.selectedUserId = null;
        Swal.fire({ toast: true, position: 'bottom-end', icon: 'success',
          title: 'Instructor enrolled successfully.', showConfirmButton: false, timer: 3000 });
      },
      error: () => {
        this.enrollError = 'Failed to enroll instructor. Please try again.';
      },
    });
  }

  requestUnenroll(userId: string): void {
    this.confirmingUnenrollId = userId;
    this.unenrollError = '';
  }

  cancelUnenroll(): void {
    this.confirmingUnenrollId = null;
  }

  confirmUnenroll(): void {
    if (!this.confirmingUnenrollId) return;
    const userId = this.confirmingUnenrollId;
    this.courseService.unenrollUser(this.courseId, userId).subscribe({
      next: () => {
        this.enrolledUsers = this.enrolledUsers.filter(u => u.id !== userId);
        this.confirmingUnenrollId = null;
        Swal.fire({ toast: true, position: 'bottom-end', icon: 'success',
          title: 'Instructor unenrolled successfully.', showConfirmButton: false, timer: 3000 });
      },
      error: () => {
        this.unenrollError = 'Failed to unenroll instructor. Please try again.';
        this.confirmingUnenrollId = null;
      },
    });
  }
}
```

#### B2 — HTML template (reference `stitch-designs/course-enrollment/`)

Key structural elements:
- **Modal header**: course name + close button
- **Loading spinner**: `*ngIf="isLoading"`
- **Error banner**: `*ngIf="loadError"`
- **Enrolled table**: name + email columns + action column (delete icon or inline confirm)
- **Empty state**: `*ngIf="enrolledUsers.length === 0 && !isLoading"`
- **Enroll section** (`*ngIf="canEnroll"`): dropdown bound to `[(ngModel)]="selectedUserId"` + Enroll button `[disabled]="!selectedUserId || availableInstructors.length === 0"` + empty-dropdown message
- Unenroll icon `*ngIf="canUnenroll && confirmingUnenrollId !== user.id"` + inline confirm buttons `*ngIf="confirmingUnenrollId === user.id"`

#### B3 — CSS

Follow `stitch-designs/course-enrollment/` for visual reference. Apply Lumina token classes (table head `#001A33`, accent `#41B3E3`, `.btn-lumina-main`, `.btn-lumina-outline`, `.btn-save-action`). Mirror the `course-assessment.component.css` pattern for table container, status badges, and form card.

---

### Phase C — Integration into `CourseViewComponent`

**Files modified**: `course-view.component.ts`, `course-view.component.html`

#### C1 — Import and declare child component

```typescript
import { CourseEnrollmentComponent } from '../course-enrollment/course-enrollment.component';

@Component({
  imports: [..., CourseEnrollmentComponent],
})
```

#### C2 — Add `@ViewChild` and `openEnrollmentModal()` method

```typescript
@ViewChild(CourseEnrollmentComponent) enrollmentComponent!: CourseEnrollmentComponent;

openEnrollmentModal(course: Course): void {
  this.selectedCourse = course;
  const el = document.getElementById('enrollmentModal');
  if (!el) return;
  let modal = (window as any).bootstrap.Modal.getInstance(el);
  if (!modal) {
    modal = new (window as any).bootstrap.Modal(el, { backdrop: 'static', keyboard: false });
  }
  modal.show();
  if (this.enrollmentComponent) {
    this.enrollmentComponent.open(course.Id, course.Title);
  }
}
```

#### C3 — Add enrollment modal `<div>` to `course-view.component.html`

```html
<!-- Enrollment Modal -->
<div class="modal fade" id="enrollmentModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <app-course-enrollment></app-course-enrollment>
    </div>
  </div>
</div>
```

#### C4 — Gate the trigger button on course card

```html
<!-- Only visible to users with Course:read OR Course:readAll -->
<button *ngIf="canReadCourse" class="btn btn-lumina-outline btn-sm"
  (click)="openEnrollmentModal(course)">
  <i class="bi bi-person-plus"></i> Manage Enrollment
</button>
```

---

## Complexity Tracking

No Constitution violations. All changes are within scope. No new patterns introduced.

---

## Pre-Implementation Checklist

- [ ] Consult `stitch-designs/course-enrollment/` before writing HTML/CSS
- [ ] Verify `CourseService.baseUrl` matches the running backend (`https://localhost:7289/api/Course`)
- [ ] Confirm `UserService.getUsers()` populates `roles[]` correctly for instructors
- [ ] Confirm `PermissionService.hasPermission()` accepts `'Course:enrollInstructor'` and `'Course:unenrollInstructor'`
- [ ] Confirm SweetAlert2 (`Swal`) is available in the enrollment component (import from 'sweetalert2')
