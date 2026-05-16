# Quickstart: Assignment Submission & Grading
**Feature**: `011-assignment-submission`
**Date**: 2026-05-14

---

## Overview

This guide describes how to integrate the Assignment Submission & Grading feature into the existing Lumina codebase. It assumes `AssignmentsViewComponent` and `AssignmentService` already exist and are working.

---

## Step 1 — Add Model Interfaces

Open `src/app/models/assignment.model.ts` and append:

```typescript
export interface AssignmentSubmissionAttachmentDto {
  id: string;           // Guid
  fileName: string;
  fileUrl: string;
  type: string;         // 'application/pdf' | 'video/mp4'
}

export interface AssignmentSubmissionResponseDto {
  id: number;
  assignmentId: number;
  studentId: string;
  textSubmission: string | null;
  submittedAt: string;  // ISO 8601
  grade: number | null;
  feedback: string | null;
  assignmentSubmissionAttachments: AssignmentSubmissionAttachmentDto[];
}

export interface CreateSubmissionDto {
  assignmentId: number;
  textSubmission?: string;
  // attachmentFiles sent via FormData — not typed here
}

export interface GradeSubmissionDto {
  grade: number;
  feedback?: string;
}
```

---

## Step 2 — Create `AssignmentSubmissionService`

Create `src/app/core/services/assignment-submission.service.ts`:

```typescript
@Injectable({ providedIn: 'root' })
export class AssignmentSubmissionService {
  private apiUrl = 'https://localhost:7289/api/AssignmentSubmission';

  submitAssignment(assignmentId: number, textSubmission: string, files: File[])
    : Observable<AssignmentSubmissionResponseDto>

  getStudentSubmissions(): Observable<AssignmentSubmissionResponseDto[]>
    // GET /api/AssignmentSubmission/Student/Assignment/Submissions

  getSubmissionsForAssignment(assignmentId: number)
    : Observable<AssignmentSubmissionResponseDto[]>
    // GET /api/AssignmentSubmission/Assignment/{assignmentId}/Students

  deleteSubmission(submissionId: number): Observable<void>
    // DELETE /api/AssignmentSubmission/Assignment/Submission/{submissionId}

  gradeSubmission(submissionId: number, dto: GradeSubmissionDto)
    : Observable<AssignmentSubmissionResponseDto>
    // PUT /api/AssignmentSubmission/Assignment/Submission/{submissionId}/Grade
}
```

Note: `submitAssignment` builds a `FormData` with field `assignmentId` (int), `textSubmission` (string), and `attachmentFiles` (File[]) — matching the `multipart/form-data` contract.

---

## Step 3 — Update `AssignmentsViewComponent`

### 3a. Parallel Load with `forkJoin`

```typescript
ngOnInit(): void {
  this.canSubmit       = this.permissionService.hasPermission('Ass:solve');
  this.canReadAll      = this.permissionService.hasPermission('AssSubmission:readAll');
  this.canGrade        = this.permissionService.hasPermission('Ass:Grade');
  // ...existing permission checks...

  if (this.courseId) {
    this.loadData();
  }
}

loadData(): void {
  this.isLoading = true;
  const sources = this.canSubmit
    ? forkJoin([
        this.assignmentService.getAssignmentsByCourseId(this.courseId),
        this.submissionService.getStudentSubmissions()
      ])
    : forkJoin([
        this.assignmentService.getAssignmentsByCourseId(this.courseId),
        of([])
      ]);

  sources.subscribe({
    next: ([assignments, submissions]) => {
      this.assignmentsList = assignments;
      this.submissionMap = new Map(submissions.map(s => [s.assignmentId, s]));
      this.isLoading = false;
    },
    error: (err) => { /* handle */ }
  });
}
```

### 3b. State Helper

```typescript
getSubmissionState(assignmentId: number): 'none' | 'submitted' | 'graded' {
  const sub = this.submissionMap.get(assignmentId);
  if (!sub) return 'none';
  return sub.grade !== null ? 'graded' : 'submitted';
}

isLate(submission: AssignmentSubmissionResponseDto, assignment: AssignmentResponseDto): boolean {
  return new Date(submission.submittedAt) > new Date(assignment.dueDate);
}
```

---

## Step 4 — Register the New Route

In `src/app/app.routes.ts`, add inside the relevant parent route:

```typescript
{
  path: 'courses/:courseId/assignments/:assignmentId/submissions',
  loadComponent: () =>
    import('./features/assignments/assignment-submissions-list/assignment-submissions-list.component')
      .then(m => m.AssignmentSubmissionsListComponent)
}
```

---

## Step 5 — Template State Conditions

In `assignments-view.component.html`, inside each card's action area:

```html
<!-- Student: No submission -->
<button *ngIf="canSubmit && getSubmissionState(item.id) === 'none'"
        class="btn btn-submit-add"
        (click)="openSubmissionModal(item, null)">
  + Add Submission
</button>

<!-- Student: Submitted (not graded) -->
<ng-container *ngIf="canSubmit && getSubmissionState(item.id) === 'submitted'">
  <span class="badge badge-submitted">Submitted</span>
  <span *ngIf="isLate(submissionMap.get(item.id)!, item)" class="badge bg-danger ms-1">Late</span>
  <button class="btn btn-submit-edit" (click)="openSubmissionModal(item, submissionMap.get(item.id))">
    Edit Submission
  </button>
</ng-container>

<!-- Instructor: View Submissions -->
<button *ngIf="canReadAll"
        class="btn btn-view-submissions"
        [routerLink]="['/courses', courseId, 'assignments', item.id, 'submissions']">
  View Submissions
</button>
```

---

## Step 6 — Graded State in Expanded Card

Inside the card's expanded body:

```html
<ng-container *ngIf="getSubmissionState(item.id) === 'graded'">
  <div class="grade-panel">
    <span class="grade-value">{{ submissionMap.get(item.id)?.grade }} / {{ item.totalMarks }}</span>
    <p class="feedback-text">{{ submissionMap.get(item.id)?.feedback }}</p>
  </div>
</ng-container>
```

---

## API Quick Reference

| Method | HTTP | Endpoint | Permission |
|---|---|---|---|
| Submit | POST | `/api/AssignmentSubmission/Assignment/Submit` | `Ass:solve` |
| Get Student Submissions | GET | `/api/AssignmentSubmission/Student/Assignment/Submissions` | `Ass:solve` |
| Get All for Assignment | GET | `/api/AssignmentSubmission/Assignment/{id}/Students` | `AssSubmission:readAll` |
| Delete Submission | DELETE | `/api/AssignmentSubmission/Assignment/Submission/{id}` | `AssSubmission:delete` |
| Grade Submission | PUT | `/api/AssignmentSubmission/Assignment/Submission/{id}/Grade` | `Ass:Grade` |
